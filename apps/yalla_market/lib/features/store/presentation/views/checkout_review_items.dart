part of 'checkout_view.dart';

class _ReviewItemsSection extends StatelessWidget {
  const _ReviewItemsSection({
    required this.items,
    required this.itemCount,
    required this.isDark,
  });

  final List<CartItemData> items;
  final int itemCount;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                context.tr('Items'),
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: textColor,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            _SoftBadge(
              label: context.productCount(itemCount),
              icon: AppIcons.shopping_bag,
              isDark: isDark,
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...List.generate(items.length, (index) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: index == items.length - 1 ? 0 : 10,
            ),
            child: _CheckoutItemCard(
              item: items[index],
              isDark: isDark,
              mutedColor: mutedColor,
              textColor: textColor,
            ),
          );
        }),
      ],
    );
  }
}

class _CheckoutItemCard extends StatelessWidget {
  const _CheckoutItemCard({
    required this.item,
    required this.isDark,
    required this.textColor,
    required this.mutedColor,
  });

  final CartItemData item;
  final bool isDark;
  final Color textColor;
  final Color mutedColor;

  @override
  Widget build(BuildContext context) {
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final imageBackground = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : const Color(0xFFF0F3F8);
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
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
            width: 78,
            height: 86,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: imageBackground,
              borderRadius: BorderRadius.circular(8),
            ),
            child: AppImage(
              source: item.image,
              fit: BoxFit.contain,
              cacheWidth: 156,
              cacheHeight: 172,
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
                          fontWeight: FontWeight.w800,
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
                    fontWeight: FontWeight.w900,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.attributes.isNotEmpty) ...[
                  const SizedBox(height: 5),
                  RichText(
                    text: TextSpan(
                      style: TextStyle(
                        color: mutedColor,
                        fontSize: 12,
                        height: 1.2,
                      ),
                      children: _attributeSpans(context, item.attributes),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 13),
                Row(
                  children: [
                    _QuantityPill(quantity: item.quantity, isDark: isDark),
                    const Spacer(),
                    AppCurrencyText(
                      text: _formatMoney(item.price * item.quantity),
                      style: TextStyle(
                        color: textColor,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
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
        TextSpan(text: '${context.tr(attribute.label)} '),
        TextSpan(
          text: '${context.tr(attribute.value)} ',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ],
    ];
  }
}
