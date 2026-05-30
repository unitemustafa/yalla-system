import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../core/presentation/widgets/brands/brand_card.dart';
import '../../../../core/presentation/widgets/layouts/grid_layout.dart';
import '../../../../core/presentation/widgets/products/product_cards/product_card_vertical.dart';
import '../../../../core/preferences/app_preferences_controller.dart';
import '../../../../core/routing/app_route_arguments.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../store/domain/entities/category_data.dart';
import '../../../store/domain/entities/product_data.dart';
import '../../../store/presentation/cubit/product_discovery_cubit.dart';
import '../../../store/presentation/cubit/product_discovery_state.dart';

enum SearchFilter { all, products, categories }

class SearchView extends StatefulWidget {
  const SearchView({super.key, this.initialFilter = SearchFilter.all});

  final SearchFilter initialFilter;

  @override
  State<SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<SearchView> {
  late SearchFilter _filter;
  final TextEditingController _queryController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _filter = widget.initialFilter;
    _queryController.addListener(_onQueryChanged);
  }

  @override
  void dispose() {
    _queryController.removeListener(_onQueryChanged);
    _queryController.dispose();
    super.dispose();
  }

  void _onQueryChanged() {
    context.read<ProductDiscoveryCubit>().search(_queryController.text);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final maxWidth = constraints.maxWidth >= 900
                ? 920.0
                : constraints.maxWidth;

            return ValueListenableBuilder<AppPreferences>(
              valueListenable: AppPreferencesController.instance,
              builder: (context, preferences, _) {
                return AnimatedBuilder(
                  animation: _queryController,
                  builder: (context, _) {
                    final discoveryState = context
                        .watch<ProductDiscoveryCubit>()
                        .state;
                    final products = discoveryState.products;
                    final categories = discoveryState.categories;
                    final query = _queryController.text.trim();
                    final productResults = _filteredProducts(
                      query,
                      products,
                      safeMode: preferences.safeMode,
                    );
                    final categoryResults = _filteredCategories(
                      query,
                      categories,
                    );
                    final hasResults =
                        productResults.isNotEmpty || categoryResults.isNotEmpty;
                    final isInitialLoading =
                        discoveryState is ProductDiscoveryLoading &&
                        products.isEmpty &&
                        categories.isEmpty;
                    final needsCity =
                        discoveryState is ProductDiscoveryNeedsCity;

                    return SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: BoxConstraints(maxWidth: maxWidth),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const PageTopBar(
                                title: 'Search',
                                subtitle: 'Products and categories',
                              ),
                              const SizedBox(height: 18),
                              _SearchInput(
                                controller: _queryController,
                                isDark: isDark,
                              ),
                              const SizedBox(height: 12),
                              _FilterBar(
                                selected: _filter,
                                onChanged: (filter) =>
                                    setState(() => _filter = filter),
                              ),
                              const SizedBox(height: 18),
                              if (isInitialLoading) ...[
                                const LinearProgressIndicator(),
                                const SizedBox(height: 12),
                              ],
                              if (needsCity)
                                _EmptySearchState(
                                  query: '',
                                  isDark: isDark,
                                  title: 'Choose your city',
                                  message:
                                      'So we can show products available in your area.',
                                  onClear: () => Navigator.pop(context),
                                )
                              else if (query.isEmpty)
                                _SearchStarter(
                                  isDark: isDark,
                                  onQuerySelected: (value) =>
                                      _queryController.text = value,
                                )
                              else if (!hasResults)
                                _EmptySearchState(
                                  query: query,
                                  isDark: isDark,
                                  onClear: _queryController.clear,
                                )
                              else ...[
                                _SearchSummary(
                                  query: query,
                                  total:
                                      productResults.length +
                                      categoryResults.length,
                                  isDark: isDark,
                                ),
                                const SizedBox(height: 18),
                                if (_shows(SearchFilter.categories) &&
                                    categoryResults.isNotEmpty) ...[
                                  _SectionTitle(
                                    title: 'Categories',
                                    count: categoryResults.length,
                                  ),
                                  const SizedBox(height: 10),
                                  ...categoryResults.map(
                                    (category) => Padding(
                                      padding: const EdgeInsets.only(
                                        bottom: 10,
                                      ),
                                      child: BrandCard(
                                        showBorder: true,
                                        brand: category.name,
                                        productCount:
                                            category.productCountLabel,
                                        logo: category.image,
                                        accentColor: Color(
                                          category.accentColorValue,
                                        ),
                                        onTap: () =>
                                            _openCategory(context, category),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                ],
                                if (_shows(SearchFilter.products) &&
                                    productResults.isNotEmpty) ...[
                                  _SectionTitle(
                                    title: 'Products',
                                    count: productResults.length,
                                  ),
                                  const SizedBox(height: 10),
                                  GridLayout(
                                    itemCount: productResults.length,
                                    itemBuilder: (_, index) {
                                      final product = productResults[index];
                                      return ProductCardVertical(
                                        image: product.image,
                                        title: product.title,
                                        brand: product.brand,
                                        price: product.price,
                                        productId: product.id,
                                        productSlug: product.slug,
                                        oldPrice: product.oldPrice,
                                        discount: product.discount,
                                      );
                                    },
                                  ),
                                ],
                              ],
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            );
          },
        ),
      ),
    );
  }

  bool _shows(SearchFilter filter) {
    return _filter == SearchFilter.all || _filter == filter;
  }

  List<ProductData> _filteredProducts(
    String query,
    List<ProductData> source, {
    required bool safeMode,
  }) {
    if (!_shows(SearchFilter.products)) return [];
    final safeSource = source
        .where((product) => product.isAllowedBySafeMode(safeMode))
        .toList(growable: false);
    if (query.isEmpty) return safeSource.take(4).toList(growable: false);
    final lowerQuery = query.toLowerCase();
    return safeSource
        .where((product) {
          return product.title.toLowerCase().contains(lowerQuery) ||
              product.brand.toLowerCase().contains(lowerQuery) ||
              product.tags.any((tag) => tag.contains(lowerQuery));
        })
        .toList(growable: false);
  }

  List<CategoryData> _filteredCategories(
    String query,
    List<CategoryData> source,
  ) {
    if (!_shows(SearchFilter.categories)) return [];
    if (query.isEmpty) {
      return source.take(6).toList(growable: false);
    }
    return source
        .where((category) => category.matches(query))
        .toList(growable: false);
  }

  void _openCategory(BuildContext context, CategoryData category) {
    Navigator.pushNamed(
      context,
      AppRoutes.brandProducts,
      arguments: BrandProductsRouteArgs(
        brand: category.name,
        logo: category.image,
        productCount: category.productCountLabel,
      ),
    );
  }
}

class _SearchInput extends StatelessWidget {
  const _SearchInput({required this.controller, required this.isDark});

  final TextEditingController controller;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      autofocus: true,
      textInputAction: TextInputAction.search,
      decoration: InputDecoration(
        hintText: context.tr('Search products and categories...'),
        prefixIcon: const Icon(AppIcons.search_normal),
        suffixIcon: controller.text.isEmpty
            ? const Icon(AppIcons.filter_search, color: AppColors.primary)
            : IconButton(
                onPressed: controller.clear,
                icon: const Icon(Icons.close_rounded),
                tooltip: context.tr('Clear'),
              ),
        filled: true,
        fillColor: isDark ? AppColors.darkCardColor : Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.06),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.06),
          ),
        ),
      ),
    );
  }
}

class _FilterBar extends StatelessWidget {
  const _FilterBar({required this.selected, required this.onChanged});

  final SearchFilter selected;
  final ValueChanged<SearchFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    const filters = [
      (SearchFilter.all, 'All'),
      (SearchFilter.products, 'Products'),
      (SearchFilter.categories, 'Categories'),
    ];

    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final filter = filters[index].$1;
          final label = filters[index].$2;
          final isSelected = selected == filter;

          return Material(
            color: isSelected
                ? AppColors.primary
                : AppColors.primary.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: () => onChanged(filter),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Center(
                  child: Text(
                    context.tr(label),
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.primary,
                      fontWeight: FontWeight.w900,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _SearchStarter extends StatelessWidget {
  const _SearchStarter({required this.isDark, required this.onQuerySelected});

  final bool isDark;
  final ValueChanged<String> onQuerySelected;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    const suggestions = ['مطاعم', 'خضار', 'صيدلية', 'ملابس', 'أجهزة إلكترونية'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF25273A) : const Color(0xFFEAF2FF),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : AppColors.primary.withValues(alpha: 0.12),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: isDark ? 0.20 : 0.12,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  AppIcons.search_favorite,
                  color: AppColors.primary,
                  size: 28,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.tr('Search smarter'),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      context.tr(
                        'Try product names, categories, or sale keywords.',
                      ),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: mutedColor,
                        height: 1.35,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        Text(
          context.tr('Trending searches'),
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: suggestions
              .map((suggestion) {
                return ActionChip(
                  label: Text(context.tr(suggestion)),
                  avatar: const Icon(AppIcons.search_normal, size: 16),
                  onPressed: () => onQuerySelected(suggestion),
                );
              })
              .toList(growable: false),
        ),
      ],
    );
  }
}

class _SearchSummary extends StatelessWidget {
  const _SearchSummary({
    required this.query,
    required this.total,
    required this.isDark,
  });

  final String query;
  final int total;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Row(
      children: [
        Expanded(
          child: Text(
            context.isArabicLanguage
                ? '$total نتيجة لـ "$query"'
                : '$total result${total == 1 ? '' : 's'} for "$query"',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
        ),
        Text(
          context.tr('Best match'),
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: mutedColor,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.count});

  final String title;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            context.tr(title),
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
        ),
        Text(
          context.tr('$count'),
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _EmptySearchState extends StatelessWidget {
  const _EmptySearchState({
    required this.query,
    required this.isDark,
    required this.onClear,
    this.title,
    this.message,
  });

  final String query;
  final bool isDark;
  final VoidCallback onClear;
  final String? title;
  final String? message;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 36),
        child: Column(
          children: [
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(
                  alpha: isDark ? 0.18 : 0.10,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                AppIcons.search_status,
                color: AppColors.primary,
                size: 42,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              context.tr(title ?? 'No results for "$query"'),
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              context.tr(
                message ?? 'Try a category or a shorter product name.',
              ),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: mutedColor,
                height: 1.35,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 18),
            OutlinedButton(
              onPressed: onClear,
              child: Text(context.tr(title == null ? 'Clear search' : 'Back')),
            ),
          ],
        ),
      ),
    );
  }
}
