import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../data/demo/demo_categories.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/brands/brand_card.dart';
import '../../../../core/presentation/widgets/layouts/grid_layout.dart';
import '../../../../core/presentation/widgets/products/cart_counter_icon.dart';
import '../../../../core/presentation/widgets/texts/section_heading.dart';
import '../../../../core/routing/app_route_arguments.dart';
import '../../../../core/routing/app_routes.dart';
import '../../domain/entities/category_data.dart';
import '../cubit/product_discovery_cubit.dart';
import '../cubit/product_discovery_state.dart';
import '../widgets/category_tab.dart';

class StoreView extends StatelessWidget {
  const StoreView({super.key});

  static const List<_StoreCategoryData> _categories = [
    _StoreCategoryData(label: 'الأكل', showcases: MarketCategories.food),
    _StoreCategoryData(label: 'الطازج', showcases: MarketCategories.fresh),
    _StoreCategoryData(label: 'التسوق', showcases: MarketCategories.shopping),
    _StoreCategoryData(label: 'البيت', showcases: MarketCategories.home),
    _StoreCategoryData(label: 'الموضة', showcases: MarketCategories.fashion),
    _StoreCategoryData(label: 'الخدمات', showcases: MarketCategories.business),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return BlocBuilder<ProductDiscoveryCubit, ProductDiscoveryState>(
      builder: (context, state) {
        final featuredCategories = _resolvedCategories(
          MarketCategories.featured,
          state.categories,
        );

        return DefaultTabController(
          length: _categories.length,
          child: Scaffold(
            backgroundColor: backgroundColor,
            body: SafeArea(
              child: NestedScrollView(
                headerSliverBuilder: (_, innerBoxIsScrolled) {
                  return [
                    SliverToBoxAdapter(
                      child: ColoredBox(
                        color: backgroundColor,
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _StoreTopBar(isDark: isDark),
                              const SizedBox(height: 18),
                              _StoreSearchField(isDark: isDark),
                              const SizedBox(height: 22),
                              SectionHeading(
                                title: 'Featured Categories',
                                onPressed: () {
                                  Navigator.pushNamed(
                                    context,
                                    AppRoutes.categories,
                                  );
                                },
                              ),
                              const SizedBox(height: 12),
                              GridLayout(
                                itemCount: featuredCategories.length,
                                mainAxisExtent: 78,
                                itemBuilder: (_, index) {
                                  final category = featuredCategories[index];
                                  return BrandCard(
                                    showBorder: true,
                                    brand: category.name,
                                    productCount: category.productCountLabel,
                                    logo: category.image,
                                    accentColor: Color(
                                      category.accentColorValue,
                                    ),
                                    onTap: () {
                                      Navigator.pushNamed(
                                        context,
                                        AppRoutes.brandProducts,
                                        arguments: BrandProductsRouteArgs(
                                          brand: category.name,
                                          logo: category.image,
                                          productCount:
                                              category.productCountLabel,
                                        ),
                                      );
                                    },
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    SliverPersistentHeader(
                      pinned: true,
                      delegate: _StoreTabsHeaderDelegate(
                        backgroundColor: backgroundColor,
                        isDark: isDark,
                        labels: _categories
                            .map((category) => category.label)
                            .toList(growable: false),
                      ),
                    ),
                  ];
                },
                body: ColoredBox(
                  color: backgroundColor,
                  child: TabBarView(
                    children: _categories
                        .map(
                          (category) => CategoryTab(
                            showcases: _resolvedCategories(
                              category.showcases,
                              state.categories,
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  List<CategoryData> _resolvedCategories(
    List<MarketCategoryData> categories,
    List<CategoryData> loadedCategories,
  ) {
    return categories
        .map((category) => _resolvedCategory(category, loadedCategories))
        .toList(growable: false);
  }

  CategoryData _resolvedCategory(
    MarketCategoryData category,
    List<CategoryData> loadedCategories,
  ) {
    final normalizedName = _normalize(category.name);
    for (final loadedCategory in loadedCategories) {
      if (_normalize(loadedCategory.name) == normalizedName) {
        return loadedCategory;
      }
    }

    return CategoryData(
      id: _slugFrom(category.name),
      name: category.name,
      slug: _slugFrom(category.name),
      productCount: _countFromLabel(category.count),
      image: category.image,
      galleryImages: category.galleryImages,
      accentColorValue: category.color.toARGB32(),
      keywords: category.keywords,
    );
  }

  String _normalize(String value) => value.trim().toLowerCase();

  String _slugFrom(String value) {
    return value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\u0600-\u06ff]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
  }

  int _countFromLabel(String value) {
    return int.tryParse(value.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
  }
}

class _StoreTopBar extends StatelessWidget {
  const _StoreTopBar({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr('Store'),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                context.tr('Categories & picks'),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: mutedColor,
                  fontWeight: FontWeight.w600,
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
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.cart);
            },
            iconColor: isDark ? Colors.white : AppColors.lightTextPrimary,
          ),
        ),
      ],
    );
  }
}

class _StoreSearchField extends StatelessWidget {
  const _StoreSearchField({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Material(
      color: panelColor,
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
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Icon(AppIcons.search_normal, color: mutedColor, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  context.tr('Search categories, products...'),
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
                    alpha: isDark ? 0.18 : 0.10,
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

class _StoreTabsHeaderDelegate extends SliverPersistentHeaderDelegate {
  const _StoreTabsHeaderDelegate({
    required this.backgroundColor,
    required this.isDark,
    required this.labels,
  });

  final Color backgroundColor;
  final bool isDark;
  final List<String> labels;

  @override
  double get minExtent => 62;

  @override
  double get maxExtent => 62;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final tabTextStyle = Theme.of(
      context,
    ).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w800);

    return Material(
      color: backgroundColor,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCardColor : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.06),
            ),
          ),
          child: TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            padding: const EdgeInsets.all(4),
            labelPadding: const EdgeInsets.symmetric(horizontal: 14),
            indicatorSize: TabBarIndicatorSize.tab,
            indicator: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            dividerColor: Colors.transparent,
            overlayColor: WidgetStateProperty.all(Colors.transparent),
            unselectedLabelColor: isDark
                ? AppColors.darkTextSecondary
                : AppColors.lightTextSecondary,
            labelColor: Colors.white,
            labelStyle: tabTextStyle,
            unselectedLabelStyle: tabTextStyle,
            tabs: labels
                .map((label) => Tab(height: 34, child: Text(context.tr(label))))
                .toList(growable: false),
          ),
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _StoreTabsHeaderDelegate oldDelegate) {
    return oldDelegate.backgroundColor != backgroundColor ||
        oldDelegate.isDark != isDark ||
        oldDelegate.labels.length != labels.length;
  }
}

class _StoreCategoryData {
  const _StoreCategoryData({required this.label, required this.showcases});

  final String label;
  final List<MarketCategoryData> showcases;
}
