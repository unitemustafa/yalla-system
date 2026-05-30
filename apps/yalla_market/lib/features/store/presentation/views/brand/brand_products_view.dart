import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../data/demo/demo_categories.dart';
import '../../../data/demo/demo_shops.dart';
import '../../../../../core/localization/app_translations.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/brands/brand_card.dart';
import '../../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../../core/presentation/widgets/products/product_results_view.dart';
import '../../../../../core/presentation/widgets/states/app_state_view.dart';
import '../../../../../core/routing/app_route_arguments.dart';
import '../../../../../core/routing/app_routes.dart';
import '../../../domain/entities/product_data.dart';
import '../../cubit/product_catalog_cubit.dart';
import '../../cubit/product_catalog_state.dart';

part 'brand_products_widgets.dart';

class BrandProductsView extends StatefulWidget {
  const BrandProductsView({
    super.key,
    required this.brand,
    required this.logo,
    required this.productCount,
    this.shopId,
  });

  final String brand;
  final String logo;
  final String productCount;
  final String? shopId;

  @override
  State<BrandProductsView> createState() => _BrandProductsViewState();
}

class _BrandProductsViewState extends State<BrandProductsView> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: BlocBuilder<ProductCatalogCubit, ProductCatalogState>(
          builder: (context, state) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
              child: _buildContent(context, state),
            );
          },
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, ProductCatalogState state) {
    final isLocalShopCategory = MarketCategories.hasLocalShops(widget.brand);
    final selectedShopId = widget.shopId;

    if (state is ProductCatalogInitial || state is ProductCatalogLoading) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageTopBar(title: widget.brand, subtitle: widget.productCount),
          const SizedBox(height: 22),
          const AppLoadingState(message: 'Loading products...'),
        ],
      );
    }

    if (state is ProductCatalogFailure) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageTopBar(title: widget.brand, subtitle: widget.productCount),
          const SizedBox(height: 22),
          AppErrorState(
            title: 'Products could not load',
            message: state.message,
            onRetry: () =>
                context.read<ProductCatalogCubit>().loadProducts(force: true),
          ),
        ],
      );
    }

    if (state is ProductCatalogNeedsCity) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageTopBar(title: widget.brand, subtitle: 'Choose your city'),
          const SizedBox(height: 22),
          const AppEmptyState(
            title: 'Choose your city',
            message: 'So we can show products available in your area.',
            icon: AppIcons.location,
          ),
        ],
      );
    }

    final readyState = state as ProductCatalogReady;
    if (isLocalShopCategory && selectedShopId != null) {
      return _buildShopMenu(context, readyState, selectedShopId);
    }

    if (isLocalShopCategory) {
      return _buildLocalShops(context, readyState);
    }

    return _buildProductList(context, readyState);
  }

  Widget _buildLocalShops(BuildContext context, ProductCatalogReady state) {
    final shops = MarketShops.byCategoryAndCity(widget.brand, state.city.slug);
    final cityName = context.tr(state.city.name);
    final subtitle = shops.isEmpty
        ? cityName
        : '${shops.length} محل في $cityName';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageTopBar(title: widget.brand, subtitle: subtitle),
        const SizedBox(height: 18),
        _LocalCategoryHeader(
          title: widget.brand,
          logo: widget.logo,
          cityName: cityName,
          shopCount: shops.length,
        ),
        const SizedBox(height: 18),
        if (shops.isEmpty)
          AppEmptyState(
            title: 'لا يوجد محلات في ${widget.brand}',
            message: 'هنضيف محلات في $cityName قريبًا.',
            icon: AppIcons.shop,
          )
        else
          ...shops.map(
            (shop) => _LocalShopCard(
              shop: shop,
              onTap: () {
                Navigator.pushNamed(
                  context,
                  AppRoutes.brandProducts,
                  arguments: BrandProductsRouteArgs(
                    brand: widget.brand,
                    logo: widget.logo,
                    productCount: shop.productCountLabel,
                    shopId: shop.id,
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _buildShopMenu(
    BuildContext context,
    ProductCatalogReady state,
    String shopId,
  ) {
    final shop = MarketShops.byId(shopId);
    final cityName = context.tr(state.city.name);
    if (shop == null || shop.citySlug != state.city.slug) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageTopBar(title: widget.brand, subtitle: cityName),
          const SizedBox(height: 22),
          const AppEmptyState(
            title: 'المحل غير متاح',
            message: 'المحل ده مش متاح في المنطقة المختارة حاليًا.',
            icon: AppIcons.shop,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageTopBar(
          title: shop.name,
          subtitle: '${widget.brand} • ${context.tr(shop.cityName)}',
        ),
        const SizedBox(height: 18),
        _ShopHeaderCard(shop: shop),
        const SizedBox(height: 22),
        ProductResultsView(
          products: shop.products,
          status: ProductResultsStatus.ready,
          pageSize: 6,
          emptyTitle: 'المنيو فاضي',
          emptyMessage: 'لسه مفيش منتجات متاحة من المحل ده.',
          loadingMessage: 'Loading menu...',
        ),
      ],
    );
  }

  Widget _buildProductList(BuildContext context, ProductCatalogReady state) {
    final products = state.products
        .where(
          (product) =>
              product.brand.trim().toLowerCase() ==
              widget.brand.trim().toLowerCase(),
        )
        .toList(growable: false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PageTopBar(title: widget.brand, subtitle: widget.productCount),
        const SizedBox(height: 18),
        BrandCard(
          showBorder: true,
          brand: widget.brand,
          logo: widget.logo,
          productCount: widget.productCount,
        ),
        const SizedBox(height: 26),
        ProductResultsView(
          products: products.cast<ProductData>(),
          status: ProductResultsStatus.ready,
          pageSize: 4,
          onRetry: () =>
              context.read<ProductCatalogCubit>().loadProducts(force: true),
          emptyTitle: 'No ${widget.brand} items yet',
          emptyMessage:
              'This category is empty. Try another category or check back later.',
        ),
      ],
    );
  }
}
