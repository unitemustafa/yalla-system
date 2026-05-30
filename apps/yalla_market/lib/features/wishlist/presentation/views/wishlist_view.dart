import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/presentation/widgets/layouts/grid_layout.dart';
import '../../../../core/presentation/widgets/products/product_cards/product_card_vertical.dart';
import '../../../../core/presentation/widgets/products/cart_counter_icon.dart';
import '../../../../core/routing/app_route_arguments.dart';
import '../../../../core/routing/app_routes.dart';
import '../../domain/entities/wishlist_item.dart';
import '../cubit/wishlist_cubit.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class WishlistView extends StatelessWidget {
  const WishlistView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return BlocBuilder<WishlistCubit, List<WishlistItem>>(
      builder: (context, wishlist) {
        final isEmpty = wishlist.isEmpty;

        return Scaffold(
          backgroundColor: isDark
              ? AppColors.darkBackground
              : const Color(0xFFF7F8FB),
          body: SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  child: _WishlistTopBar(isDark: isDark),
                ),
                Expanded(
                  child: isEmpty
                      ? _EmptyWishlistView(
                          isDark: isDark,
                          onExplorePressed: () {
                            Navigator.pushNamedAndRemoveUntil(
                              context,
                              AppRoutes.navigationMenu,
                              (route) => false,
                              arguments: const NavigationMenuRouteArgs(
                                initialIndex: 1,
                              ),
                            );
                          },
                        )
                      : SingleChildScrollView(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                          child: GridLayout(
                            itemCount: wishlist.length,
                            itemBuilder: (_, index) {
                              final item = wishlist[index];
                              return ProductCardVertical(
                                image: item.image,
                                title: item.title,
                                brand: item.brand,
                                price: item.price,
                                oldPrice: item.oldPrice,
                                discount: item.discount,
                              );
                            },
                          ),
                        ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _WishlistTopBar extends StatelessWidget {
  const _WishlistTopBar({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr('Wishlist'),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                context.tr('Saved products and favorites'),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.lightTextSecondary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
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
            iconColor: isDark ? Colors.white : AppColors.lightTextPrimary,
          ),
        ),
      ],
    );
  }
}

class _EmptyWishlistView extends StatelessWidget {
  const _EmptyWishlistView({
    required this.isDark,
    required this.onExplorePressed,
  });

  final bool isDark;
  final VoidCallback onExplorePressed;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final subtitleColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: isDark
              ? const [AppColors.darkBackground, Color(0xFF202235)]
              : const [Colors.white, Color(0xFFF6F8FF)],
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _WishlistEmptyArtwork(isDark: isDark),
                    const SizedBox(height: 28),
                    Text(
                      context.tr('Your wishlist is waiting'),
                      style: textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      context.tr(
                        'Save the products you love and find them here whenever you are ready.',
                      ),
                      style: textTheme.bodyMedium?.copyWith(
                        color: subtitleColor,
                        height: 1.45,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 28),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 320),
                      child: AppActionButton(
                        label: 'Explore products',
                        icon: AppIcons.shop,
                        onPressed: onExplorePressed,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _WishlistEmptyArtwork extends StatelessWidget {
  const _WishlistEmptyArtwork({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final panelColor = isDark ? const Color(0xFF262838) : Colors.white;
    final panelBorder = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : AppColors.primary.withValues(alpha: 0.10);
    final shadowColor = isDark
        ? Colors.black.withValues(alpha: 0.22)
        : AppColors.primary.withValues(alpha: 0.10);

    return SizedBox(
      width: 260,
      height: 210,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 12,
            child: Container(
              width: 230,
              height: 142,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              decoration: BoxDecoration(
                color: panelColor,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: panelBorder),
                boxShadow: [
                  BoxShadow(
                    color: shadowColor,
                    blurRadius: 28,
                    offset: const Offset(0, 18),
                  ),
                ],
              ),
              child: const FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ProductPeek(
                      image: AppAssets.nikeAirJordanSingleBlue,
                      backgroundColor: Color(0xFFEAF2FF),
                      angle: -0.12,
                    ),
                    SizedBox(width: 8),
                    _ProductPeek(
                      image: AppAssets.samsungS9Mobile,
                      backgroundColor: Color(0xFFFFF2DD),
                      angle: 0.08,
                    ),
                    SizedBox(width: 8),
                    _ProductPeek(
                      image: AppAssets.leatherJacket1,
                      backgroundColor: Color(0xFFEFF8F1),
                      angle: 0.12,
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            child: Container(
              width: 104,
              height: 104,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.28),
                    blurRadius: 30,
                    offset: const Offset(0, 16),
                  ),
                ],
              ),
              child: const Icon(AppIcons.heart5, size: 48, color: Colors.white),
            ),
          ),
          PositionedDirectional(
            end: 68,
            bottom: 22,
            child: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark ? AppColors.darkCardColor : Colors.white,
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.10)
                      : Colors.white,
                  width: 2,
                ),
              ),
              child: const Icon(
                AppIcons.add,
                size: 18,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductPeek extends StatelessWidget {
  const _ProductPeek({
    required this.image,
    required this.backgroundColor,
    required this.angle,
  });

  final String image;
  final Color backgroundColor;
  final double angle;

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: angle,
      child: Container(
        width: 58,
        height: 78,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(18),
        ),
        child: AppImage(
          source: image,
          fit: BoxFit.contain,
          cacheWidth: 116,
          cacheHeight: 156,
        ),
      ),
    );
  }
}
