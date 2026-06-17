import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/images/app_avatar.dart';
import '../../../../core/presentation/widgets/products/cart_counter_icon.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../../core/presentation/widgets/texts/section_heading.dart';
import '../../../location/domain/entities/city_data.dart';
import '../../../location/presentation/cubit/location_cubit.dart';
import '../../../location/presentation/cubit/location_state.dart';
import '../../../location/presentation/widgets/city_selector_sheet.dart';
import '../../../personalization/presentation/controllers/user_profile_controller.dart';
import '../../../store/presentation/cubit/product_catalog_cubit.dart';
import '../../../store/presentation/cubit/product_discovery_cubit.dart';
import '../widgets/home_categories.dart';
import '../widgets/home_products_grid.dart';
import '../widgets/promo_slider.dart';

const _supportedRegionCheckInterval = Duration(seconds: 20);

String _homeRegionLabel(BuildContext context, CityData? city) {
  if (city == null) return context.tr('General');
  if (city.isNamedGeneral) {
    return city.displayName(arabic: context.isArabicLanguage);
  }

  final supportedCity =
      CityData.fromSlug(city.slug) ?? CityData.fromName(city.name);

  if (supportedCity == null || supportedCity.isGeneral) {
    return context.tr('General');
  }

  return supportedCity.displayName(arabic: context.isArabicLanguage);
}

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> with WidgetsBindingObserver {
  bool _isCheckingSupportedRegion = false;
  Timer? _supportedRegionTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _checkForSupportedRegion();
    });
    _supportedRegionTimer = Timer.periodic(_supportedRegionCheckInterval, (_) {
      if (mounted) _checkForSupportedRegion();
    });
  }

  @override
  void dispose() {
    _supportedRegionTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkForSupportedRegion();
    }
  }

  Future<void> _checkForSupportedRegion() async {
    if (_isCheckingSupportedRegion) return;
    _isCheckingSupportedRegion = true;

    try {
      final locationCubit = context.read<LocationCubit>();
      final currentCity = locationCubit.state.selectedCity;
      final detectedCity = await locationCubit.previewCurrentLocation();

      if (!mounted || detectedCity == null) return;
      if (currentCity?.slug == detectedCity.slug &&
          currentCity?.name == detectedCity.name) {
        return;
      }

      await _switchToDetectedRegion(detectedCity);
    } finally {
      _isCheckingSupportedRegion = false;
    }
  }

  Future<void> _switchToDetectedRegion(CityData detectedCity) async {
    final selectedCity = await context.read<LocationCubit>().selectCity(
      detectedCity,
      source: detectedCity.source,
    );
    if (!mounted || selectedCity == null) return;

    await context.read<ProductCatalogCubit>().loadProducts(force: true);
    if (!mounted) return;
    await context.read<ProductDiscoveryCubit>().loadDiscovery(force: true);
    if (!mounted) return;

    CustomSnackBar.showPersistentSuccess(
      context: context,
      title: 'Region saved',
      message: 'Products and offers will refresh for your region.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HomeTopBar(isDark: isDark),
              const SizedBox(height: 18),
              _HomeSearchField(isDark: isDark),
              const SizedBox(height: 22),
              const PromoSlider(),
              const SizedBox(height: 24),
              const SectionHeading(
                title: 'Popular Categories',
                showActionButton: false,
              ),
              const SizedBox(height: 12),
              const HomeCategories(),
              const SizedBox(height: 22),
              SectionHeading(
                title: 'Popular Products',
                onPressed: () {
                  Navigator.pushNamed(context, AppRoutes.allProducts);
                },
              ),
              const SizedBox(height: 14),
              const HomeProductsGrid(limit: 8),
            ],
          ),
        ),
      ),
    );
  }
}

class _HomeTopBar extends StatelessWidget {
  const _HomeTopBar({required this.isDark});

  final bool isDark;

  Future<void> _openCitySelector(BuildContext context) {
    return CitySelectorSheet.show(
      context,
      onCityChanged: () async {
        await context.read<ProductCatalogCubit>().loadProducts(force: true);
        if (!context.mounted) return;
        await context.read<ProductDiscoveryCubit>().loadDiscovery(force: true);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<UserProfileController>(
      valueListenable: UserProfileController.instance,
      builder: (context, profile, _) {
        return Row(
          children: [
            Material(
              color: AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.10),
              borderRadius: BorderRadius.circular(8),
              child: InkWell(
                onTap: () {
                  Navigator.pushNamed(context, AppRoutes.profile);
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.12),
                    ),
                  ),
                  child: _TopProfileAvatar(profile: profile),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: BlocBuilder<LocationCubit, LocationState>(
                builder: (context, state) {
                  return Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: _HomeRegionBadge(
                      label: _homeRegionLabel(context, state.selectedCity),
                      onTap: () => _openCitySelector(context),
                    ),
                  );
                },
              ),
            ),
            _TopActionButton(
              isDark: isDark,
              icon: AppIcons.notification,
              onTap: () {
                Navigator.pushNamed(context, AppRoutes.notifications);
              },
            ),
            const SizedBox(width: 8),
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCardColor : Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.08)
                      : Colors.black.withValues(alpha: 0.06),
                ),
              ),
              child: CartCounterIcon(
                onPressed: () {
                  Navigator.pushNamed(context, AppRoutes.cart);
                },
                iconColor: isDark ? Colors.white : AppColors.lightTextPrimary,
              ),
            ),
          ],
        );
      },
    );
  }
}

class _HomeRegionBadge extends StatelessWidget {
  const _HomeRegionBadge({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Tooltip(
      message: context.tr('Change region'),
      child: Material(
        color: AppColors.warning.withValues(alpha: isDark ? 0.18 : 0.12),
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 180),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    label,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: AppColors.warning,
                      fontWeight: FontWeight.w900,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  AppIcons.arrow_down_1,
                  color: AppColors.warning,
                  size: 13,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TopProfileAvatar extends StatelessWidget {
  const _TopProfileAvatar({required this.profile});

  final UserProfileController profile;

  @override
  Widget build(BuildContext context) {
    return AppAvatar(
      initials: profile.initials,
      imageBytes: profile.avatarBytes,
      imageUrl: profile.avatarUrl,
      size: 46,
      borderRadius: 7,
      borderColor: Colors.transparent,
      backgroundColor: Colors.transparent,
      textScale: 0.35,
    );
  }
}

class _TopActionButton extends StatelessWidget {
  const _TopActionButton({
    required this.isDark,
    required this.icon,
    required this.onTap,
  });

  final bool isDark;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isDark ? AppColors.darkCardColor : Colors.white,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.06),
            ),
          ),
          child: Icon(icon, size: 21),
        ),
      ),
    );
  }
}

class _HomeSearchField extends StatelessWidget {
  const _HomeSearchField({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Material(
      color: isDark ? AppColors.darkCardColor : Colors.white,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(context, AppRoutes.search);
        },
        borderRadius: BorderRadius.circular(8),
        child: Container(
          height: 54,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.06),
            ),
          ),
          child: Row(
            children: [
              Icon(AppIcons.search_normal, color: mutedColor, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  context.tr('Search products and categories...'),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: mutedColor,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: isDark ? 0.20 : 0.10,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  AppIcons.filter_search,
                  color: AppColors.primary,
                  size: 18,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
