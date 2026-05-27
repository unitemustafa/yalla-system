import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/demo/demo_shops.dart';
import '../../../location/domain/usecases/location_usecases.dart';
import '../../domain/entities/category_data.dart';
import '../../domain/entities/product_data.dart';
import '../../domain/usecases/get_brands_usecase.dart';
import '../../domain/usecases/get_categories_usecase.dart';
import '../../domain/usecases/get_products_usecase.dart';
import '../../domain/usecases/search_products_usecase.dart';
import 'product_discovery_state.dart';

class ProductDiscoveryCubit extends Cubit<ProductDiscoveryState> {
  ProductDiscoveryCubit({
    required GetProductsUseCase getProducts,
    required SearchProductsUseCase searchProducts,
    required GetCategoriesUseCase getCategories,
    required GetBrandsUseCase getBrands,
    required GetSelectedCityUseCase getSelectedCity,
  }) : _getProducts = getProducts,
       _searchProducts = searchProducts,
       _getCategories = getCategories,
       _getBrands = getBrands,
       _getSelectedCity = getSelectedCity,
       super(const ProductDiscoveryInitial()) {
    loadDiscovery();
  }

  final GetProductsUseCase _getProducts;
  final SearchProductsUseCase _searchProducts;
  final GetCategoriesUseCase _getCategories;
  final GetBrandsUseCase _getBrands;
  final GetSelectedCityUseCase _getSelectedCity;

  Future<void> loadDiscovery({bool force = false}) async {
    if (!force && state is ProductDiscoveryReady) return;

    final cityResult = await _getSelectedCity();
    final selectedCity = cityResult.when(
      success: (city) => city,
      failure: (_) => null,
    );

    if (selectedCity == null) {
      emit(const ProductDiscoveryNeedsCity());
      return;
    }

    emit(
      ProductDiscoveryLoading(
        query: state.query,
        products: state.products,
        categories: state.categories,
        brands: state.brands,
        city: selectedCity,
      ),
    );

    final productsResult = await _getProducts(citySlug: selectedCity.slug);
    final categoriesResult = await _getCategories();
    final brandsResult = await _getBrands();

    productsResult.when(
      success: (products) {
        final allProducts = _productsWithShopMenus(
          products,
          citySlug: selectedCity.slug,
        );

        categoriesResult.when(
          success: (categories) {
            final countedCategories = _categoriesWithProductCounts(
              categories: categories,
              products: allProducts,
              citySlug: selectedCity.slug,
            );

            brandsResult.when(
              success: (brands) {
                emit(
                  ProductDiscoveryReady(
                    query: '',
                    products: allProducts,
                    categories: countedCategories,
                    brands: brands,
                    city: selectedCity,
                  ),
                );
              },
              failure: (failure) => _emitFailure(failure.message),
            );
          },
          failure: (failure) => _emitFailure(failure.message),
        );
      },
      failure: (failure) => _emitFailure(failure.message),
    );
  }

  Future<void> search(String query) async {
    final normalizedQuery = query.trim();
    if (normalizedQuery == state.query && state is ProductDiscoveryReady) {
      return;
    }

    final cityResult = await _getSelectedCity();
    final selectedCity = cityResult.when(
      success: (city) => city,
      failure: (_) => null,
    );

    if (selectedCity == null) {
      emit(const ProductDiscoveryNeedsCity());
      return;
    }

    emit(
      ProductDiscoveryLoading(
        query: normalizedQuery,
        products: state.products,
        categories: state.categories,
        brands: state.brands,
        city: selectedCity,
      ),
    );

    final productsResult = normalizedQuery.isEmpty
        ? await _getProducts(citySlug: selectedCity.slug)
        : await _searchProducts(normalizedQuery, citySlug: selectedCity.slug);

    productsResult.when(
      success: (products) {
        final allProducts = _productsWithShopMenus(
          products,
          citySlug: selectedCity.slug,
          query: normalizedQuery,
        );

        emit(
          ProductDiscoveryReady(
            query: normalizedQuery,
            products: allProducts,
            categories: _filterCategories(normalizedQuery, state.categories),
            brands: state.brands,
            city: selectedCity,
          ),
        );
      },
      failure: (failure) =>
          _emitFailure(failure.message, query: normalizedQuery),
    );
  }

  List<CategoryData> _filterCategories(
    String query,
    List<CategoryData> categories,
  ) {
    if (query.isEmpty) return categories;
    return categories
        .where((category) => category.matches(query))
        .toList(growable: false);
  }

  List<ProductData> _productsWithShopMenus(
    List<ProductData> products, {
    required String citySlug,
    String query = '',
  }) {
    final normalizedCity = _normalize(citySlug);
    final shopProducts = MarketShops.all
        .where((shop) => shop.citySlug == normalizedCity)
        .expand((shop) => shop.products);
    final combinedProducts = <ProductData>[...products, ...shopProducts];
    final matchingProducts = query.trim().isEmpty
        ? combinedProducts
        : combinedProducts
              .where((product) => product.matches(query))
              .toList(growable: false);

    return _dedupeProducts(matchingProducts);
  }

  List<ProductData> _dedupeProducts(Iterable<ProductData> products) {
    final seen = <String>{};
    final result = <ProductData>[];

    for (final product in products) {
      final key =
          product.id?.trim().toLowerCase() ??
          product.slug?.trim().toLowerCase() ??
          '${_normalize(product.brand)}::${_normalize(product.title)}';
      if (seen.add(key)) result.add(product);
    }

    return result;
  }

  List<CategoryData> _categoriesWithProductCounts({
    required List<CategoryData> categories,
    required List<ProductData> products,
    required String citySlug,
  }) {
    return categories
        .map(
          (category) => category.copyWith(
            productCount: _productCountForCategory(
              category: category,
              products: products,
              citySlug: citySlug,
            ),
          ),
        )
        .toList(growable: false);
  }

  int _productCountForCategory({
    required CategoryData category,
    required List<ProductData> products,
    required String citySlug,
  }) {
    final shops = MarketShops.byCategoryAndCity(category.name, citySlug);
    if (shops.isNotEmpty) {
      return shops.fold<int>(0, (sum, shop) => sum + shop.productCount);
    }

    return products
        .where((product) => _productBelongsToCategory(product, category))
        .length;
  }

  bool _productBelongsToCategory(ProductData product, CategoryData category) {
    final categoryTerms = {
      category.name,
      category.slug,
      ...category.keywords,
    }.map(_normalize).where((term) => term.isNotEmpty).toSet();
    if (categoryTerms.isEmpty) return false;

    if (categoryTerms.contains(_normalize(product.brand))) return true;

    return product.tags.any((tag) => categoryTerms.contains(_normalize(tag)));
  }

  String _normalize(String value) {
    return value.trim().toLowerCase();
  }

  void _emitFailure(String message, {String? query}) {
    emit(
      ProductDiscoveryFailure(
        message,
        query: query ?? state.query,
        products: state.products,
        categories: state.categories,
        brands: state.brands,
        city: state.city,
      ),
    );
  }
}
