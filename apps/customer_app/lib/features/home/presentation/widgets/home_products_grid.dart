import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/presentation/widgets/states/app_state_view.dart';
import '../../../../core/presentation/widgets/layouts/grid_layout.dart';
import '../../../../core/presentation/widgets/products/product_cards/product_card_vertical.dart';
import '../../../store/domain/entities/product_data.dart';
import '../../../store/presentation/cubit/product_catalog_cubit.dart';
import '../../../store/presentation/cubit/product_catalog_state.dart';

class HomeProductsGrid extends StatelessWidget {
  const HomeProductsGrid({super.key, this.products, this.limit});

  final List<ProductData>? products;
  final int? limit;

  @override
  Widget build(BuildContext context) {
    final catalogState = context.watch<ProductCatalogCubit>().state;
    if (products == null) {
      if (catalogState is ProductCatalogLoading) {
        return const AppLoadingState(message: 'Loading products...');
      }
      if (catalogState is ProductCatalogFailure) {
        return AppErrorState(
          title: 'Products could not load',
          message: catalogState.message,
          onRetry: () =>
              context.read<ProductCatalogCubit>().loadProducts(force: true),
        );
      }
      if (catalogState is ProductCatalogNeedsCity) {
        return const AppEmptyState(
          title: 'Choose your city',
          message: 'So we can show products available in your area.',
        );
      }
    }

    final loadedProducts = catalogState is ProductCatalogReady
        ? catalogState.products
        : const <ProductData>[];
    final source = products ?? loadedProducts;
    final visibleCount = limit == null
        ? source.length
        : limit!.clamp(0, source.length).toInt();

    if (visibleCount == 0) {
      return const AppEmptyState(
        title: 'No products available',
        message: 'Products will appear here once the catalog is ready.',
      );
    }

    return GridLayout(
      itemCount: visibleCount,
      itemBuilder: (_, index) {
        final product = source[index];
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
    );
  }
}
