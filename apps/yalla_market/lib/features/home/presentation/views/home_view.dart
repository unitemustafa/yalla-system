import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/icons/app_icons.dart';
import '../../../../core/presentation/widgets/images/app_avatar.dart';
import '../../../../core/presentation/widgets/products/cart_counter_icon.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/presentation/widgets/states/app_state_view.dart';
import '../../../../core/presentation/widgets/texts/section_heading.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../location/presentation/cubit/location_cubit.dart';
import '../../../personalization/presentation/controllers/user_profile_controller.dart';
import '../cubit/home_cubit.dart';
import '../widgets/home_categories.dart';
import '../widgets/home_products_grid.dart';
import '../widgets/promo_slider.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> with WidgetsBindingObserver {
  static const resumeCheckInterval = Duration(minutes: 10);
  static const _lastLocationCheckKey = 'location.last_resume_check_ms';
  DateTime? _lastLocationCheck;
  bool _checkingLocation = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      unawaited(context.read<HomeCubit>().load());
      unawaited(_checkLocation(force: true));
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      unawaited(_checkLocation());
    }
  }

  Future<void> _checkLocation({bool force = false}) async {
    final locationCubit = context.read<LocationCubit>();
    final homeCubit = context.read<HomeCubit>();
    final now = DateTime.now();
    final preferences = await SharedPreferences.getInstance();
    final persistedCheck = preferences.getInt(_lastLocationCheckKey);
    final persistedAt = persistedCheck == null
        ? null
        : DateTime.fromMillisecondsSinceEpoch(persistedCheck);
    if (_checkingLocation ||
        (!force &&
            (persistedAt ?? _lastLocationCheck) != null &&
            now.difference((persistedAt ?? _lastLocationCheck)!) <
                resumeCheckInterval)) {
      return;
    }
    _checkingLocation = true;
    _lastLocationCheck = now;
    await preferences.setInt(_lastLocationCheckKey, now.millisecondsSinceEpoch);
    try {
      final city = await locationCubit.previewCurrentLocation();
      if (!mounted || city == null || !city.cityChanged) return;
      locationCubit.syncCity(city);
      await homeCubit.load(force: true);
      if (!mounted) return;
      CustomSnackBar.showSuccess(
        context: context,
        title: 'City changed',
        message: 'Home was refreshed for ${city.name}.',
      );
    } finally {
      _checkingLocation = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkBackground
          : const Color(0xFFF7F8FB),
      body: SafeArea(
        child: BlocBuilder<HomeCubit, HomeState>(
          builder: (context, state) {
            if (state is HomeInitial || state is HomeLoading) {
              return const AppLoadingState(message: 'Loading Home...');
            }
            if (state is HomeLocationRequired) {
              return AppEmptyState(
                title: 'Choose your city',
                message: 'A supported city is required before opening Home.',
                actionLabel: 'Choose city',
                onAction: () => Navigator.pushNamedAndRemoveUntil(
                  context,
                  AppRoutes.selectCity,
                  (route) => false,
                ),
                icon: AppIcons.location,
              );
            }
            if (state is HomeFailure) {
              return AppErrorState(
                title: 'Home could not load',
                message: state.message,
                onRetry: () => context.read<HomeCubit>().load(force: true),
              );
            }
            final data = switch (state) {
              HomeReady(:final data) => data,
              HomeEmpty(:final data) => data,
              _ => null,
            };
            if (data == null) return const SizedBox.shrink();
            return RefreshIndicator(
              onRefresh: () => context.read<HomeCubit>().load(force: true),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                children: [
                  _HomeTopBar(cityName: data.cityName),
                  const SizedBox(height: 20),
                  if (state is HomeEmpty)
                    const AppEmptyState(
                      title: 'No content available',
                      message:
                          'No markets, offers, or products exist for this city.',
                    )
                  else ...[
                    PromoSlider(offers: data.offers),
                    if (data.offers.isNotEmpty) const SizedBox(height: 24),
                    const SectionHeading(
                      title: 'Market classifications',
                      showActionButton: false,
                    ),
                    const SizedBox(height: 12),
                    HomeCategories(classifications: data.classifications),
                    const SizedBox(height: 22),
                    const SectionHeading(
                      title: 'Popular Products',
                      showActionButton: false,
                    ),
                    const SizedBox(height: 14),
                    HomeProductsGrid(products: data.products),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _HomeTopBar extends StatelessWidget {
  const _HomeTopBar({required this.cityName});

  final String cityName;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<UserProfileController>(
      valueListenable: UserProfileController.instance,
      builder: (context, profile, _) {
        return Row(
          children: [
            GestureDetector(
              onTap: () => Navigator.pushNamed(context, AppRoutes.profile),
              child: AppAvatar(
                initials: profile.initials,
                imageBytes: profile.avatarBytes,
                imageUrl: profile.avatarUrl,
                size: 46,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile.displayName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  Text(
                    cityName,
                    style: const TextStyle(color: AppColors.primary),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () =>
                  Navigator.pushNamed(context, AppRoutes.notifications),
              icon: const Icon(AppIcons.notification),
            ),
            CartCounterIcon(
              iconColor: Theme.of(context).colorScheme.onSurface,
              onPressed: () => Navigator.pushNamed(context, AppRoutes.cart),
            ),
          ],
        );
      },
    );
  }
}
