import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/images/app_avatar.dart';
import '../../../../core/presentation/widgets/products/cart_counter_icon.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../../core/presentation/widgets/texts/section_heading.dart';
import '../../../location/presentation/cubit/location_cubit.dart';
import '../../../location/presentation/cubit/location_state.dart';
import '../../../location/presentation/widgets/city_selector_sheet.dart';
import '../../../personalization/presentation/controllers/user_profile_controller.dart';
import '../../../store/presentation/cubit/product_catalog_cubit.dart';
import '../../../store/presentation/cubit/product_discovery_cubit.dart';
import '../widgets/home_categories.dart';
import '../widgets/home_products_grid.dart';
import '../widgets/promo_slider.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

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

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    context.tr('Delivering to:'),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: mutedColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  BlocBuilder<LocationCubit, LocationState>(
                    builder: (context, state) {
                      return _DeliveryCityButton(
                        cityName: state.selectedCity?.name ?? 'Choose city',
                        onTap: () => _openCitySelector(context),
                      );
                    },
                  ),
                ],
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
}

class _DeliveryCityButton extends StatelessWidget {
  const _DeliveryCityButton({required this.cityName, required this.onTap});

  final String cityName;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  context.tr(cityName),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              const Icon(AppIcons.arrow_down_1, size: 16),
            ],
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
