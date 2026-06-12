part of 'brand_products_view.dart';

class _LocalCategoryHeader extends StatelessWidget {
  const _LocalCategoryHeader({
    required this.title,
    required this.logo,
    required this.cityName,
    required this.shopCount,
  });

  final String title;
  final String logo;
  final String cityName;
  final int shopCount;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: AppImage(
              source: logo,
              fit: BoxFit.contain,
              cacheWidth: 108,
              cacheHeight: 108,
              fallback: const Icon(AppIcons.shop, color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  shopCount == 0
                      ? 'لا يوجد محلات متاحة في $cityName'
                      : '$shopCount محل متاح في $cityName',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: mutedColor,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LocalShopCard extends StatelessWidget {
  const _LocalShopCard({required this.shop, required this.onTap});

  final MarketShopData shop;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : const Color(0xFFEDEFF3);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : const Color(0xFF9B9B9B);
    final accentColor = Color(shop.accentColorValue);
    final previewColor = isDark
        ? accentColor.withValues(alpha: 0.16)
        : const Color(0xFFFDEDEE);
    final forwardIcon = Directionality.of(context) == TextDirection.rtl
        ? AppIcons.arrow_left_2
        : AppIcons.arrow_right_3;
    final previewProducts = shop.products.take(3).toList(growable: false);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Material(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: borderColor),
              boxShadow: [
                if (!isDark)
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.055),
                    blurRadius: 18,
                    offset: const Offset(0, 9),
                  ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    _ShopLogo(
                      shop: shop,
                      size: 58,
                      backgroundColor: previewColor,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            shop.name,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(
                                  color: isDark
                                      ? AppColors.darkTextPrimary
                                      : AppColors.lightTextPrimary,
                                  fontWeight: FontWeight.w900,
                                  height: 1.08,
                                ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          _ShopMetaChip(
                            icon: AppIcons.box,
                            label: shop.productCountLabel,
                            color: accentColor,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        forwardIcon,
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  children: previewProducts
                      .map(
                        (product) => Expanded(
                          child: _ShopPreviewTile(
                            image: product.image,
                            backgroundColor: previewColor,
                          ),
                        ),
                      )
                      .toList(growable: false),
                ),
                const SizedBox(height: 12),
                Directionality(
                  textDirection: TextDirection.rtl,
                  child: Text(
                    previewProducts.map((product) => product.title).join(' • '),
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: mutedColor,
                      fontWeight: FontWeight.w800,
                      height: 1.25,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ShopPreviewTile extends StatelessWidget {
  const _ShopPreviewTile({required this.image, required this.backgroundColor});

  final String image;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Container(
        height: 82,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(8),
        ),
        child: AppImage(
          source: image,
          fit: BoxFit.contain,
          cacheWidth: 164,
          cacheHeight: 164,
        ),
      ),
    );
  }
}

class _ShopHeaderCard extends StatelessWidget {
  const _ShopHeaderCard({required this.shop});

  final MarketShopData shop;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _ShopLogo(shop: shop, size: 62),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      shop.name,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'منيو متاح في ${context.tr(shop.cityName)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: mutedColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ShopLogo extends StatelessWidget {
  const _ShopLogo({
    required this.shop,
    required this.size,
    this.backgroundColor,
  });

  final MarketShopData shop;
  final double size;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = Color(shop.accentColorValue);

    return Container(
      width: size,
      height: size,
      padding: EdgeInsets.all(size * 0.18),
      decoration: BoxDecoration(
        color:
            backgroundColor ??
            accentColor.withValues(alpha: isDark ? 0.18 : 0.10),
        borderRadius: BorderRadius.circular(8),
      ),
      child: AppImage(
        source: shop.logo,
        fit: BoxFit.contain,
        cacheWidth: (size * 2).round(),
        cacheHeight: (size * 2).round(),
        fallback: Icon(AppIcons.shop, color: accentColor),
      ),
    );
  }
}

class _ShopMetaChip extends StatelessWidget {
  const _ShopMetaChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 4),
          Text(
            context.tr(label),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
