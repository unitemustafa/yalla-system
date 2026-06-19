import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import '../../../constants/app_assets.dart';
import '../../../constants/app_colors.dart';
import '../../../localization/app_translations.dart';
import '../images/app_image.dart';

class BrandCard extends StatelessWidget {
  const BrandCard({
    super.key,
    required this.showBorder,
    this.onTap,
    this.brand = 'مطاعم',
    this.productCount = '265 products',
    this.logo = AppAssets.temporaryMarketPlaceholder,
    this.accentColor = AppColors.primary,
  });

  final bool showBorder;
  final void Function()? onTap;
  final String brand;
  final String productCount;
  final String logo;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);
    final logoBackground = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : accentColor.withValues(alpha: 0.10);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: showBorder ? panelColor : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: showBorder ? Border.all(color: borderColor) : null,
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: logoBackground,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: AppImage(
                  source: logo,
                  fit: BoxFit.contain,
                  cacheWidth: 80,
                  cacheHeight: 80,
                  fallback: Icon(
                    AppIcons.shop,
                    color: isDark ? Colors.white : Colors.black,
                    size: 20,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          AppIcons.verify5,
                          color: AppColors.primary,
                          size: 13,
                        ),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            brand,
                            textAlign: TextAlign.start,
                            maxLines: 2,
                            overflow: TextOverflow.fade,
                            softWrap: true,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(
                                  fontSize: 14,
                                  height: 1.08,
                                  fontWeight: FontWeight.w900,
                                ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      context.tr(productCount),
                      style: Theme.of(
                        context,
                      ).textTheme.labelMedium!.apply(color: Colors.grey),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
