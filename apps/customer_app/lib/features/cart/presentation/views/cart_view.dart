import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yallamarket/core/icons/app_icons.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/formatters/app_currency.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/appbar/app_navigation_icon_button.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/presentation/widgets/states/app_state_view.dart';
import '../../../../core/presentation/widgets/texts/app_currency_text.dart';
import '../../../../core/routing/app_routes.dart';
import '../../domain/entities/cart_item.dart';
import '../cubit/cart_cubit.dart';

String _formatMoney(double value, {int fractionDigits = 1}) =>
    AppCurrency.format(value, fractionDigits: fractionDigits);

class CartView extends StatefulWidget {
  const CartView({super.key});

  @override
  State<CartView> createState() => _CartViewState();
}

class _CartViewState extends State<CartView> {
  double _subtotal(List<CartItemData> cartItems) {
    return cartItems.fold(0, (sum, item) => sum + (item.price * item.quantity));
  }

  int _itemCount(List<CartItemData> cartItems) {
    return cartItems.fold(0, (sum, item) => sum + item.quantity);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: BlocBuilder<CartCubit, List<CartItemData>>(
        builder: (context, cartItems) {
          final topBar = _buildCartTopBar(
            isDark: isDark,
            itemCount: _itemCount(cartItems),
          );

          return SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  child: topBar,
                ),
                Expanded(
                  child: cartItems.isEmpty
                      ? const _EmptyCartView()
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
                          itemCount: cartItems.length,
                          separatorBuilder: (_, _) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final item = cartItems[index];
                            return Dismissible(
                              key: Key(item.id),
                              direction: DismissDirection.endToStart,
                              background: Container(
                                padding: const EdgeInsetsDirectional.only(
                                  end: 22,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.error,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                alignment: AlignmentDirectional.centerEnd,
                                child: const Icon(
                                  AppIcons.trash,
                                  color: Colors.white,
                                  size: 24,
                                ),
                              ),
                              onDismissed: (direction) {
                                context.read<CartCubit>().removeItem(item.id);
                                CustomSnackBar.showRemoved(
                                  context: context,
                                  title: 'Item removed from cart',
                                );
                              },
                              child: _buildCartItem(
                                context,
                                item: item,
                                isDark: isDark,
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: BlocBuilder<CartCubit, List<CartItemData>>(
        builder: (context, cartItems) {
          if (cartItems.isEmpty) return const SizedBox.shrink();

          final subtotal = _subtotal(cartItems);

          return _CheckoutSummary(
            subtotal: subtotal,
            itemCount: _itemCount(cartItems),
            isDark: isDark,
            onCheckout: () {
              Navigator.pushNamed(context, AppRoutes.checkout);
            },
          );
        },
      ),
    );
  }

  Widget _buildCartTopBar({required bool isDark, required int itemCount}) {
    return Row(
      children: [
        AppNavigationIconButton.back(
          onPressed: () => Navigator.pop(context),
          color: isDark ? Colors.white : Colors.black,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            context.tr('Cart'),
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: isDark ? Colors.white : Colors.black,
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (itemCount > 0) _CartCountBadge(count: itemCount, isDark: isDark),
      ],
    );
  }

  Widget _buildCartItem(
    BuildContext context, {
    required CartItemData item,
    required bool isDark,
  }) {
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final imageBackground = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : const Color(0xFFF1F3F8);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.04),
        ),
        boxShadow: [
          if (!isDark)
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 18,
              offset: const Offset(0, 10),
            ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 86,
            height: 92,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: imageBackground,
              borderRadius: BorderRadius.circular(8),
            ),
            child: AppImage(
              source: item.image,
              fit: BoxFit.contain,
              cacheWidth: 172,
              cacheHeight: 184,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        context.tr(item.brand),
                        style: TextStyle(
                          color: mutedColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.verified,
                      color: AppColors.primary,
                      size: 14,
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  context.tr(item.title),
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14,
                    height: 1.25,
                    fontWeight: FontWeight.w800,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.attributes.isNotEmpty) ...[
                  const SizedBox(height: 5),
                  RichText(
                    text: TextSpan(
                      style: TextStyle(color: textColor),
                      children: _attributeSpans(context, item.attributes),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    _QuantityStepper(item: item, isDark: isDark),
                    const Spacer(),
                    AppCurrencyText(
                      text: context.tr(
                        _formatMoney(item.price * item.quantity),
                      ),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: textColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<InlineSpan> _attributeSpans(
    BuildContext context,
    List<CartItemAttribute> attributes,
  ) {
    return [
      for (final attribute in attributes) ...[
        TextSpan(
          text: '${context.tr(attribute.label)} ',
          style: const TextStyle(color: Colors.grey, fontSize: 12),
        ),
        TextSpan(
          text: '${context.tr(attribute.value)} ',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        ),
      ],
    ];
  }
}

class _CartCountBadge extends StatelessWidget {
  const _CartCountBadge({required this.count, required this.isDark});

  final int count;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 34,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardColor : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(AppIcons.shopping_bag, color: AppColors.primary, size: 17),
          const SizedBox(width: 6),
          Text(
            count.toString(),
            style: TextStyle(
              color: isDark ? Colors.white : AppColors.lightTextPrimary,
              fontWeight: FontWeight.w800,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuantityStepper extends StatelessWidget {
  const _QuantityStepper({required this.item, required this.isDark});

  final CartItemData item;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 34,
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.06)
            : const Color(0xFFF1F3F8),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          _QuantityButton(
            icon: AppIcons.minus,
            color: item.quantity > 1
                ? (isDark ? Colors.white70 : Colors.black54)
                : (isDark ? Colors.white30 : Colors.black26),
            onTap: () {
              if (item.quantity > 1) {
                context.read<CartCubit>().decrementQuantity(item.id);
              } else {
                CustomSnackBar.showWarning(
                  context: context,
                  title: 'Minimum quantity is 1',
                );
              }
            },
          ),
          SizedBox(
            width: 36,
            child: Text(
              item.quantity.toString(),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : AppColors.lightTextPrimary,
              ),
            ),
          ),
          _QuantityButton(
            icon: AppIcons.add,
            color: Colors.white,
            backgroundColor: AppColors.primary,
            onTap: () => context.read<CartCubit>().incrementQuantity(item.id),
          ),
        ],
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  const _QuantityButton({
    required this.icon,
    required this.color,
    required this.onTap,
    this.backgroundColor,
  });

  final IconData icon;
  final Color color;
  final Color? backgroundColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: backgroundColor ?? Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          width: 34,
          height: 34,
          child: Icon(icon, size: 16, color: color),
        ),
      ),
    );
  }
}

class _CheckoutSummary extends StatelessWidget {
  const _CheckoutSummary({
    required this.subtotal,
    required this.itemCount,
    required this.isDark,
    required this.onCheckout,
  });

  final double subtotal;
  final int itemCount;
  final bool isDark;
  final VoidCallback onCheckout;

  @override
  Widget build(BuildContext context) {
    const deliveryFee = 0.0;
    final total = subtotal + deliveryFee;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
        decoration: BoxDecoration(
          color: panelColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          border: Border(
            top: BorderSide(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.05),
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.20 : 0.08),
              blurRadius: 22,
              offset: const Offset(0, -8),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _SummaryRow(
              label: 'Subtotal',
              value: _formatMoney(subtotal),
              textColor: textColor,
              mutedColor: mutedColor,
            ),
            const SizedBox(height: 8),
            _SummaryRow(
              label: 'Delivery',
              value: deliveryFee == 0 ? 'Free' : _formatMoney(deliveryFee),
              textColor: textColor,
              mutedColor: mutedColor,
              valueColor: AppColors.success,
            ),
            const SizedBox(height: 12),
            Divider(
              height: 1,
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.06),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.productCount(itemCount),
                        style: TextStyle(
                          color: mutedColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      AppCurrencyText(
                        text: context.tr(_formatMoney(total)),
                        style: TextStyle(
                          color: textColor,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onCheckout,
                    icon: const Icon(AppIcons.card_tick, size: 19),
                    label: Text(context.tr('Checkout')),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    required this.textColor,
    required this.mutedColor,
    this.valueColor,
  });

  final String label;
  final String value;
  final Color textColor;
  final Color mutedColor;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          context.tr(label),
          style: TextStyle(
            color: mutedColor,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        const Spacer(),
        AppCurrencyText(
          text: context.tr(value),
          style: TextStyle(
            color: valueColor ?? textColor,
            fontSize: 13,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _EmptyCartView extends StatelessWidget {
  const _EmptyCartView();

  @override
  Widget build(BuildContext context) {
    return const AppEmptyState(
      title: 'Your cart is empty',
      message: 'Add products you like and review them here before checkout.',
      icon: AppIcons.shopping_bag,
    );
  }
}
