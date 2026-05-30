import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../store/data/demo/demo_categories.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/routing/app_route_arguments.dart';
import '../../../../core/routing/app_routes.dart';

class HomeCategories extends StatelessWidget {
  const HomeCategories({super.key});

  @override
  Widget build(BuildContext context) {
    const categories = [
      MarketCategories.restaurants,
      MarketCategories.supermarket,
      MarketCategories.vegetables,
      MarketCategories.fruits,
    ];

    return SizedBox(
      height: 104,
      child: ListView.builder(
        itemExtent: 96,
        itemCount: categories.length,
        scrollDirection: Axis.horizontal,
        itemBuilder: (_, index) {
          return GestureDetector(
            onTap: () {
              Navigator.pushNamed(
                context,
                AppRoutes.brandProducts,
                arguments: BrandProductsRouteArgs(
                  brand: categories[index].name,
                  logo: categories[index].image,
                  productCount: categories[index].count,
                ),
              );
            },
            child: _HomeCategoryChip(data: categories[index]),
          );
        },
      ),
    );
  }
}

class _HomeCategoryChip extends StatelessWidget {
  const _HomeCategoryChip({required this.data});

  final MarketCategoryData data;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;

    return Container(
      width: 86,
      margin: const EdgeInsetsDirectional.only(end: 10),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.06),
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 46,
            height: 46,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: data.color.withValues(alpha: isDark ? 0.20 : 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: RepaintBoundary(
              child: AppImage(
                source: data.image,
                fit: BoxFit.contain,
                cacheWidth: 92,
                cacheHeight: 92,
                filterQuality: FilterQuality.low,
                fallback: Icon(Icons.category_outlined, color: data.color),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            context.tr(data.name),
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
