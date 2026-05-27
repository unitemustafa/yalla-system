import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../constants/app_colors.dart';
import '../../../localization/app_translations.dart';
import '../../../preferences/app_preferences_controller.dart';
import '../../../../features/store/domain/entities/product_data.dart';
import '../buttons/app_action_button.dart';
import '../layouts/grid_layout.dart';
import '../states/app_state_view.dart';
import 'product_cards/product_card_vertical.dart';
import 'product_sort_button.dart';

enum ProductResultsStatus { loading, ready, empty, error }

class ProductResultsView extends StatefulWidget {
  const ProductResultsView({
    super.key,
    required this.products,
    this.status = ProductResultsStatus.ready,
    this.showSearch = true,
    this.pageSize = 4,
    this.initialQuery = '',
    this.emptyTitle = 'No products found',
    this.emptyMessage = 'Try another search, category, or sorting option.',
    this.loadingMessage = 'Loading products...',
    this.errorTitle = 'Products could not load',
    this.errorMessage = 'Please check your connection and try again.',
    this.onRetry,
  });

  final List<ProductData> products;
  final ProductResultsStatus status;
  final bool showSearch;
  final int pageSize;
  final String initialQuery;
  final String emptyTitle;
  final String emptyMessage;
  final String loadingMessage;
  final String errorTitle;
  final String errorMessage;
  final VoidCallback? onRetry;

  @override
  State<ProductResultsView> createState() => _ProductResultsViewState();
}

class _ProductResultsViewState extends State<ProductResultsView> {
  late final TextEditingController _queryController;
  String _sortOption = 'Name';
  int _page = 0;

  static const _sortOptions = [
    'Name',
    'Higher Price',
    'Lower Price',
    'Sale',
    'Newest',
    'Popularity',
  ];

  @override
  void initState() {
    super.initState();
    _queryController = TextEditingController(text: widget.initialQuery);
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  void _resetPage() {
    if (_page != 0) setState(() => _page = 0);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.status == ProductResultsStatus.loading) {
      return AppLoadingState(message: widget.loadingMessage);
    }

    if (widget.status == ProductResultsStatus.error) {
      return AppErrorState(
        title: widget.errorTitle,
        message: widget.errorMessage,
        onRetry: widget.onRetry,
      );
    }

    if (widget.status == ProductResultsStatus.empty ||
        widget.products.isEmpty) {
      return AppEmptyState(
        title: widget.emptyTitle,
        message: widget.emptyMessage,
        icon: AppIcons.box,
      );
    }

    return ValueListenableBuilder<AppPreferences>(
      valueListenable: AppPreferencesController.instance,
      builder: (context, preferences, _) {
        return AnimatedBuilder(
          animation: _queryController,
          builder: (context, _) {
            final query = _queryController.text.trim();
            final filtered = widget.products
                .where(
                  (product) =>
                      product.isAllowedBySafeMode(preferences.safeMode),
                )
                .where((product) => product.matches(query))
                .toList(growable: false);
            final sorted = _sortProducts(filtered, _sortOption);
            final totalPages = sorted.isEmpty
                ? 1
                : (sorted.length / widget.pageSize).ceil();
            final safePage = _page.clamp(0, totalPages - 1).toInt();
            final start = safePage * widget.pageSize;
            final end = (start + widget.pageSize)
                .clamp(0, sorted.length)
                .toInt();
            final pageItems = sorted.sublist(start, end);

            if (safePage != _page) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) setState(() => _page = safePage);
              });
            }

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (widget.showSearch) ...[
                  _ProductSearchField(
                    controller: _queryController,
                    onChanged: (_) => _resetPage(),
                  ),
                  const SizedBox(height: 12),
                ],
                ProductSortButton(
                  value: _sortOption,
                  options: _sortOptions,
                  onChanged: (value) {
                    setState(() {
                      _sortOption = value;
                      _page = 0;
                    });
                  },
                ),
                const SizedBox(height: 16),
                _ProductResultsSummary(
                  count: sorted.length,
                  query: query,
                  page: safePage + 1,
                  totalPages: totalPages,
                ),
                const SizedBox(height: 14),
                if (sorted.isEmpty)
                  AppEmptyState(
                    title: widget.emptyTitle,
                    message: query.isEmpty
                        ? widget.emptyMessage
                        : 'No products match "$query". Try a shorter keyword.',
                    actionLabel: query.isEmpty ? null : 'Clear search',
                    onAction: query.isEmpty ? null : _queryController.clear,
                    icon: AppIcons.search_status,
                  )
                else ...[
                  GridLayout(
                    itemCount: pageItems.length,
                    itemBuilder: (_, index) {
                      final product = pageItems[index];
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
                  if (totalPages > 1) ...[
                    const SizedBox(height: 18),
                    _PaginationControls(
                      page: safePage,
                      totalPages: totalPages,
                      onPrevious: safePage == 0
                          ? null
                          : () => setState(() => _page -= 1),
                      onNext: safePage >= totalPages - 1
                          ? null
                          : () => setState(() => _page += 1),
                    ),
                  ],
                ],
              ],
            );
          },
        );
      },
    );
  }

  List<ProductData> _sortProducts(List<ProductData> items, String sortOption) {
    final sorted = List<ProductData>.of(items);
    switch (sortOption) {
      case 'Higher Price':
        sorted.sort((a, b) => b.priceValue.compareTo(a.priceValue));
        break;
      case 'Lower Price':
        sorted.sort((a, b) => a.priceValue.compareTo(b.priceValue));
        break;
      case 'Sale':
        sorted.sort((a, b) {
          final aHasDiscount = a.discount.trim().isNotEmpty;
          final bHasDiscount = b.discount.trim().isNotEmpty;
          if (aHasDiscount == bHasDiscount) return a.title.compareTo(b.title);
          return bHasDiscount ? 1 : -1;
        });
        break;
      case 'Name':
      case 'Newest':
      case 'Popularity':
      default:
        sorted.sort((a, b) => a.title.compareTo(b.title));
    }
    return sorted;
  }
}

class _ProductSearchField extends StatelessWidget {
  const _ProductSearchField({
    required this.controller,
    required this.onChanged,
  });

  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return TextField(
      controller: controller,
      onChanged: onChanged,
      textInputAction: TextInputAction.search,
      decoration: InputDecoration(
        hintText: context.tr('Filter products...'),
        prefixIcon: const Icon(AppIcons.search_normal),
        suffixIcon: controller.text.isEmpty
            ? null
            : IconButton(
                onPressed: () {
                  controller.clear();
                  onChanged('');
                },
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

class _ProductResultsSummary extends StatelessWidget {
  const _ProductResultsSummary({
    required this.count,
    required this.query,
    required this.page,
    required this.totalPages,
  });

  final int count;
  final String query;
  final int page;
  final int totalPages;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final text = query.isEmpty
        ? context.productCount(count)
        : context.searchResults(count, query);

    return Row(
      children: [
        Expanded(
          child: Text(
            text,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w900),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Text(
          context.isArabicLanguage
              ? 'صفحة $page من $totalPages'
              : 'Page $page of $totalPages',
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: mutedColor,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _PaginationControls extends StatelessWidget {
  const _PaginationControls({
    required this.page,
    required this.totalPages,
    required this.onPrevious,
    required this.onNext,
  });

  final int page;
  final int totalPages;
  final VoidCallback? onPrevious;
  final VoidCallback? onNext;

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final previousIcon = isRtl ? AppIcons.arrow_right_3 : AppIcons.arrow_left_2;
    final nextIcon = isRtl ? AppIcons.arrow_left_2 : AppIcons.arrow_right_3;

    return Row(
      children: [
        Expanded(
          child: AppActionButton(
            label: 'Previous',
            icon: previousIcon,
            onPressed: onPrevious,
            variant: AppActionButtonVariant.outlined,
          ),
        ),
        const SizedBox(width: 12),
        Container(
          width: 58,
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            context.tr('${page + 1}/$totalPages'),
            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: AppActionButton(
            label: 'Next',
            icon: nextIcon,
            onPressed: onNext,
          ),
        ),
      ],
    );
  }
}
