import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/localization/app_translations.dart';
import '../../../../../core/presentation/widgets/appbar/app_navigation_icon_button.dart';
import '../../../../../core/presentation/widgets/products/product_results_view.dart';
import '../../../domain/entities/product_data.dart';
import '../../cubit/product_catalog_cubit.dart';
import '../../cubit/product_catalog_state.dart';

class AllProductsView extends StatefulWidget {
  const AllProductsView({
    super.key,
    this.title = 'Popular Products',
    this.subtitle = 'Browse all curated products',
  });

  final String title;
  final String subtitle;

  @override
  State<AllProductsView> createState() => _AllProductsViewState();
}

class _AllProductsViewState extends State<AllProductsView> {
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
            final maxContentWidth = constraints.maxWidth >= 800
                ? 920.0
                : constraints.maxWidth;

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: maxContentWidth),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _ProductsTopBar(
                        title: widget.title,
                        subtitle: widget.subtitle,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 18),
                      BlocBuilder<ProductCatalogCubit, ProductCatalogState>(
                        builder: (context, state) {
                          final status = switch (state) {
                            ProductCatalogLoading() =>
                              ProductResultsStatus.loading,
                            ProductCatalogFailure() =>
                              ProductResultsStatus.error,
                            ProductCatalogNeedsCity() =>
                              ProductResultsStatus.empty,
                            _ => ProductResultsStatus.ready,
                          };
                          final products = state is ProductCatalogReady
                              ? state.products
                              : const <ProductData>[];

                          return ProductResultsView(
                            products: products,
                            status: status,
                            onRetry: () => context
                                .read<ProductCatalogCubit>()
                                .loadProducts(force: true),
                            pageSize: 4,
                            emptyTitle: 'No products available',
                            emptyMessage: state is ProductCatalogNeedsCity
                                ? 'So we can show products available in your area.'
                                : 'Products will appear here once the catalog is ready.',
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _ProductsTopBar extends StatelessWidget {
  const _ProductsTopBar({
    required this.title,
    required this.subtitle,
    required this.isDark,
  });

  final String title;
  final String subtitle;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Row(
      children: [
        AppNavigationIconButton.back(onPressed: () => Navigator.pop(context)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr(title),
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                context.tr(subtitle),
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
    );
  }
}
