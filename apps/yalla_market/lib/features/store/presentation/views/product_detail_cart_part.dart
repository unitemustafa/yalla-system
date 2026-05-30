part of 'product_detail_view.dart';

class _BottomAddToCartBar extends StatelessWidget {
  const _BottomAddToCartBar({
    required this.isDark,
    required this.quantity,
    required this.price,
    required this.isOutOfStock,
    required this.onDecrease,
    required this.onIncrease,
    required this.onAddToCart,
  });

  final bool isDark;
  final int quantity;
  final double price;
  final bool isOutOfStock;
  final VoidCallback onDecrease;
  final VoidCallback onIncrease;
  final VoidCallback onAddToCart;

  @override
  Widget build(BuildContext context) {
    final total = price * quantity;
    final canAdd = quantity > 0 && !isOutOfStock;

    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCardColor : Colors.white,
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
              color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.08),
              blurRadius: 18,
              offset: const Offset(0, -8),
            ),
          ],
        ),
        child: Row(
          children: [
            _QuantityStepper(
              quantity: quantity,
              isDark: isDark,
              onDecrease: onDecrease,
              onIncrease: onIncrease,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: ElevatedButton(
                onPressed: onAddToCart,
                style: ElevatedButton.styleFrom(
                  backgroundColor: canAdd
                      ? AppColors.primary
                      : (isDark
                            ? Colors.white.withValues(alpha: 0.10)
                            : Colors.black.withValues(alpha: 0.08)),
                  foregroundColor: canAdd
                      ? Colors.white
                      : (isDark ? Colors.white54 : Colors.black45),
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(AppIcons.bag_2, size: 19),
                    const SizedBox(width: 8),
                    Flexible(
                      child: AppCurrencyText(
                        text: quantity > 0
                            ? '${context.tr('Add')} ${AppCurrency.format(total)}'
                            : context.tr('Add to Bag'),
                        currencyColor: Colors.white,
                        style: const TextStyle(fontWeight: FontWeight.w900),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuantityStepper extends StatelessWidget {
  const _QuantityStepper({
    required this.quantity,
    required this.isDark,
    required this.onDecrease,
    required this.onIncrease,
  });

  final int quantity;
  final bool isDark;
  final VoidCallback onDecrease;
  final VoidCallback onIncrease;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 42,
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.06)
            : const Color(0xFFF1F3F8),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          _QtyButton(
            icon: AppIcons.minus,
            onTap: onDecrease,
            isDark: isDark,
            isPrimary: false,
          ),
          SizedBox(
            width: 34,
            child: Text(
              context.tr('$quantity'),
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
            ),
          ),
          _QtyButton(
            icon: AppIcons.add,
            onTap: onIncrease,
            isDark: isDark,
            isPrimary: true,
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  const _QtyButton({
    required this.icon,
    required this.onTap,
    required this.isDark,
    required this.isPrimary,
  });

  final IconData icon;
  final VoidCallback onTap;
  final bool isDark;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isPrimary ? AppColors.primary : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          width: 42,
          height: 42,
          child: Icon(
            icon,
            size: 17,
            color: isPrimary
                ? Colors.white
                : (isDark ? Colors.white70 : Colors.black54),
          ),
        ),
      ),
    );
  }
}
