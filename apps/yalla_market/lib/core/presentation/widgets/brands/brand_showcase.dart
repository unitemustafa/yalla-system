import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import '../../../constants/app_colors.dart';
import '../../../localization/app_translations.dart';
import '../images/app_image.dart';

class BrandShowcase extends StatelessWidget {
  const BrandShowcase({
    super.key,
    required this.brand,
    required this.productCount,
    required this.logo,
    required this.images,
    this.accentColor = AppColors.primary,
    this.onTap,
  });

  final String brand;
  final String productCount;
  final String logo;
  final List<String> images;
  final Color accentColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final forwardIcon = Directionality.of(context) == TextDirection.rtl
        ? AppIcons.arrow_left_2
        : AppIcons.arrow_right_3;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Material(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: borderColor),
              boxShadow: [
                if (!isDark)
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.035),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      padding: const EdgeInsets.all(9),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.06)
                            : accentColor.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: AppImage(
                        source: logo,
                        fit: BoxFit.contain,
                        cacheWidth: 88,
                        cacheHeight: 88,
                        fallback: Icon(
                          AppIcons.shop,
                          color: isDark ? Colors.white : Colors.black,
                          size: 22,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  brand,
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(
                                        color: textColor,
                                        fontWeight: FontWeight.w800,
                                      ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
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
                          const SizedBox(height: 2),
                          Text(
                            context.tr(productCount),
                            style: Theme.of(context).textTheme.labelMedium
                                ?.copyWith(
                                  color: mutedColor,
                                  fontWeight: FontWeight.w600,
                                ),
                          ),
                        ],
                      ),
                    ),
                    Tooltip(
                      message: context.tr('View $brand products'),
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: onTap == null
                              ? (isDark
                                    ? Colors.white.withValues(alpha: 0.06)
                                    : Colors.black.withValues(alpha: 0.04))
                              : AppColors.primary.withValues(
                                  alpha: isDark ? 0.18 : 0.10,
                                ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          forwardIcon,
                          color: onTap == null ? mutedColor : AppColors.primary,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: List.generate(images.length, (index) {
                    return Expanded(
                      child: Padding(
                        padding: EdgeInsetsDirectional.only(
                          end: index == images.length - 1 ? 0 : 8,
                        ),
                        child: _BrandTopProductImage(
                          image: images[index],
                          accentColor: accentColor,
                          isDark: isDark,
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BrandTopProductImage extends StatelessWidget {
  const _BrandTopProductImage({
    required this.image,
    required this.accentColor,
    required this.isDark,
  });

  final String image;
  final Color accentColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 104,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.06)
            : accentColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: AppImage(
        source: image,
        fit: BoxFit.contain,
        cacheWidth: 220,
        cacheHeight: 208,
      ),
    );
  }
}
