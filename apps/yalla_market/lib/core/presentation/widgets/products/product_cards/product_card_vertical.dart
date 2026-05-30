import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import 'package:yalla_market/core/presentation/widgets/images/app_image.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../constants/app_colors.dart';
import '../../../../formatters/app_currency.dart';
import '../../../../localization/app_translations.dart';
import '../../../../routing/app_route_arguments.dart';
import '../../../../routing/app_routes.dart';
import '../../../../../features/cart/domain/entities/cart_item.dart';
import '../../../../../features/cart/presentation/cubit/cart_cubit.dart';
import '../../../../../features/wishlist/domain/entities/wishlist_item.dart';
import '../../../../../features/wishlist/presentation/cubit/wishlist_cubit.dart';
import '../../snackbars/custom_snackbar.dart';

import '../../texts/app_currency_text.dart';
import '../../texts/green_currency_price.dart';

class ProductCardVertical extends StatefulWidget {
  const ProductCardVertical({
    super.key,
    required this.image,
    required this.title,
    required this.brand,
    required this.price,
    this.productId,
    this.productSlug,
    this.oldPrice,
    this.discount,
  });

  final String image, title, brand, price;
  final String? productId, productSlug;
  final String? oldPrice, discount;

  @override
  State<ProductCardVertical> createState() => _ProductCardVerticalState();
}

class _ProductCardVerticalState extends State<ProductCardVertical> {
  String _formatPrice(String? price) {
    return AppCurrency.formatPriceText(price);
  }

  double _parseFirstPrice(String price) {
    final firstPrice = price.split('-').first.trim();
    return double.tryParse(
          firstPrice.replaceAll(RegExp(r'[^0-9.,-]'), '').replaceAll(',', ''),
        ) ??
        0.0;
  }

  void _openProductDetails(BuildContext context) {
    Navigator.pushNamed(
      context,
      AppRoutes.productDetail,
      arguments: ProductDetailRouteArgs(
        image: widget.image,
        title: widget.title,
        brand: widget.brand,
        price: widget.price,
        productId: widget.productId,
        productSlug: widget.productSlug,
        oldPrice: widget.oldPrice,
        discount: widget.discount,
      ),
    );
  }

  void _toggleWishlist(BuildContext context, bool wasFavorite) {
    final item = WishlistItem(
      image: widget.image,
      title: widget.title,
      brand: widget.brand,
      price: widget.price,
      oldPrice: widget.oldPrice,
      discount: widget.discount,
    );

    context.read<WishlistCubit>().toggleItem(item);
    if (wasFavorite) {
      CustomSnackBar.showRemoved(
        context: context,
        title: 'Item removed from wishlist',
      );
    } else {
      CustomSnackBar.showAdded(
        context: context,
        title: 'Item added to wishlist',
      );
    }
  }

  void _addToCart(BuildContext context) {
    context.read<CartCubit>().addItem(
      CartItemData(
        id: widget.title,
        productId: widget.productId,
        image: widget.image,
        brand: widget.brand,
        title: widget.title,
        price: _parseFirstPrice(widget.price),
        quantity: 1,
      ),
      1,
    );
    CustomSnackBar.showAdded(context: context, title: 'Product added to cart');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final imagePanelColor = isDark
        ? Colors.white.withValues(alpha: 0.05)
        : const Color(0xFFF1F3F8);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _openProductDetails(context),
        borderRadius: BorderRadius.circular(8),
        child: Ink(
          decoration: BoxDecoration(
            color: panelColor,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.05),
            ),
            boxShadow: [
              if (!isDark)
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.035),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 132,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: imagePanelColor,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(8),
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
                        child: RepaintBoundary(
                          child: AppImage(
                            source: widget.image,
                            fit: BoxFit.contain,
                            cacheWidth: 260,
                            cacheHeight: 240,
                            filterQuality: FilterQuality.low,
                          ),
                        ),
                      ),
                    ),
                    if (widget.discount != null)
                      PositionedDirectional(
                        top: 0,
                        start: 0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.warning,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            widget.discount!,
                            style: const TextStyle(
                              color: Colors.black,
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    PositionedDirectional(
                      top: 0,
                      end: 0,
                      child:
                          BlocSelector<WishlistCubit, List<WishlistItem>, bool>(
                            selector: (items) => items.any(
                              (element) => element.title == widget.title,
                            ),
                            builder: (context, isFavorite) {
                              return _ProductIconButton(
                                icon: isFavorite
                                    ? AppIcons.heart5
                                    : AppIcons.heart,
                                iconColor: isFavorite
                                    ? AppColors.error
                                    : (isDark
                                          ? Colors.white70
                                          : Colors.black45),
                                isDark: isDark,
                                onTap: () =>
                                    _toggleWishlist(context, isFavorite),
                              );
                            },
                          ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.tr(widget.title),
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: textColor,
                          height: 1.18,
                          fontWeight: FontWeight.w900,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 2,
                      ),
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              context.tr(widget.brand),
                              style: Theme.of(context).textTheme.labelMedium
                                  ?.copyWith(
                                    color: mutedColor,
                                    fontWeight: FontWeight.w700,
                                  ),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            AppIcons.verify5,
                            color: AppColors.primary,
                            size: 14,
                          ),
                        ],
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          Expanded(
                            child: _ProductPriceBlock(
                              price: widget.price,
                              oldPrice: _formatPrice(widget.oldPrice),
                              textColor: textColor,
                              mutedColor: mutedColor,
                            ),
                          ),
                          const SizedBox(width: 8),
                          BlocSelector<CartCubit, List<CartItemData>, int>(
                            selector: (items) {
                              final cartItem = items
                                  .where(
                                    (i) =>
                                        (widget.productId != null &&
                                            i.productId == widget.productId) ||
                                        i.id == widget.title,
                                  )
                                  .firstOrNull;
                              return cartItem?.quantity ?? 0;
                            },
                            builder: (context, currentQuantity) {
                              return _AddToCartButton(
                                quantity: currentQuantity,
                                onTap: () => _addToCart(context),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProductPriceBlock extends StatelessWidget {
  const _ProductPriceBlock({
    required this.price,
    required this.oldPrice,
    required this.textColor,
    required this.mutedColor,
  });

  final String price;
  final String oldPrice;
  final Color textColor;
  final Color mutedColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: double.infinity,
          height: 24,
          child: Align(
            alignment: AlignmentDirectional.centerStart,
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: AlignmentDirectional.centerStart,
              child: GreenCurrencyPrice(
                price: price,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: textColor,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ),
        if (oldPrice.isNotEmpty) ...[
          const SizedBox(height: 2),
          AppCurrencyText(
            text: oldPrice,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: mutedColor,
              decoration: TextDecoration.lineThrough,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ],
    );
  }
}

class _ProductIconButton extends StatelessWidget {
  const _ProductIconButton({
    required this.icon,
    required this.iconColor,
    required this.isDark,
    required this.onTap,
  });

  final IconData icon;
  final Color iconColor;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isDark
          ? Colors.black.withValues(alpha: 0.28)
          : Colors.white.withValues(alpha: 0.95),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          width: 32,
          height: 32,
          child: Icon(icon, color: iconColor, size: 18),
        ),
      ),
    );
  }
}

class _AddToCartButton extends StatelessWidget {
  const _AddToCartButton({required this.quantity, required this.onTap});

  final int quantity;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.primary,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          width: 36,
          height: 36,
          child: Center(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 160),
              child: quantity == 0
                  ? const Icon(
                      AppIcons.add,
                      key: ValueKey('add'),
                      color: Colors.white,
                      size: 19,
                    )
                  : Text(
                      context.tr('$quantity'),
                      key: ValueKey(quantity),
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
