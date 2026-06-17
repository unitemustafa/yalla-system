import '../demo/demo_categories.dart';
import '../demo/demo_products.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/brand_data.dart';
import '../../domain/entities/category_data.dart';
import '../../domain/repositories/product_repository.dart';

class ProductRepositoryImpl implements ProductRepository {
  @override
  Future<ApiResult<List<ProductData>>> getProducts({String? citySlug}) async {
    try {
      return ApiResult.success(_filterByCity(DemoProducts.products, citySlug));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not load products.'),
      );
    }
  }

  @override
  Future<ApiResult<ProductData>> getProduct(String idOrSlug) async {
    try {
      final normalized = idOrSlug.trim().toLowerCase();
      if (normalized.isEmpty) {
        return const ApiResult.failure(
          ValidationFailure('Product identifier is required.'),
        );
      }

      final product = _findProduct(normalized);
      if (product == null) {
        return const ApiResult.failure(
          ValidationFailure('Product was not found.'),
        );
      }

      return ApiResult.success(product);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not load this product.'),
      );
    }
  }

  @override
  Future<ApiResult<List<ProductData>>> searchProducts(
    String query, {
    String? citySlug,
  }) async {
    try {
      final cityProducts = _filterByCity(DemoProducts.products, citySlug);
      final normalized = query.trim().toLowerCase();
      if (normalized.isEmpty) {
        return ApiResult.success(cityProducts);
      }

      final products = cityProducts
          .where((product) => product.matches(normalized))
          .toList(growable: false);
      return ApiResult.success(products);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not search products.'),
      );
    }
  }

  @override
  Future<ApiResult<List<CategoryData>>> getCategories() async {
    try {
      return ApiResult.success(
        MarketCategories.all.map(_categoryFromDemo).toList(growable: false),
      );
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not load categories.'),
      );
    }
  }

  @override
  Future<ApiResult<List<BrandData>>> getBrands() async {
    try {
      final brands = <String, List<ProductData>>{};
      for (final product in DemoProducts.products) {
        brands.putIfAbsent(product.brand, () => []).add(product);
      }

      return ApiResult.success(
        brands.entries
            .map((entry) {
              final products = entry.value;
              final firstProduct = products.first;
              return BrandData(
                id: _slugFrom(entry.key),
                name: entry.key,
                slug: _slugFrom(entry.key),
                productCount: products.length,
                image: firstProduct.image,
                accentColorValue: 0xFF4F60F6,
                keywords: [
                  entry.key,
                  ...products.expand((product) => product.tags),
                ],
              );
            })
            .toList(growable: false),
      );
    } catch (_) {
      return const ApiResult.failure(UnknownFailure('Could not load brands.'));
    }
  }

  ProductData? _findProduct(String normalized) {
    for (final product in DemoProducts.products) {
      if (product.id?.toLowerCase() == normalized ||
          product.slug?.toLowerCase() == normalized ||
          product.title.toLowerCase() == normalized ||
          _slugFrom(product.title) == normalized) {
        return product;
      }
    }
    return null;
  }

  List<ProductData> _filterByCity(
    List<ProductData> products,
    String? citySlug,
  ) {
    final normalized = citySlug?.trim().toLowerCase();
    if (normalized == null || normalized.isEmpty || normalized == 'general') {
      return products
          .where((product) => product.isGeneralVisibility)
          .toList(growable: false);
    }

    return products
        .where(
          (product) =>
              product.isGeneralVisibility ||
              product.effectiveRegionSlugs.contains(normalized),
        )
        .toList(growable: false);
  }

  String _slugFrom(String value) {
    final slug = value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\u0600-\u06ff]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    if (slug.isNotEmpty) return slug;

    final stableCode = value.codeUnits.fold<int>(
      0,
      (sum, codeUnit) => (sum + codeUnit) & 0xFFFF,
    );
    return 'item-$stableCode';
  }

  CategoryData _categoryFromDemo(MarketCategoryData category) {
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

  int _countFromLabel(String value) {
    return int.tryParse(value.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
  }
}
