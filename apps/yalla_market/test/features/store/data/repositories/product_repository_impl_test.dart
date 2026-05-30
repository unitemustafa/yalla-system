import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/errors/failure.dart';
import 'package:yalla_market/features/store/data/repositories/product_repository_impl.dart';

void main() {
  group('ProductRepositoryImpl', () {
    late ProductRepositoryImpl repository;

    setUp(() {
      repository = ProductRepositoryImpl();
    });

    test('loads products from the demo catalog', () async {
      final result = await repository.getProducts();

      result.when(
        success: (products) {
          expect(products, isNotEmpty);
          expect(products.first.id, isNotNull);
          expect(products.first.slug, isNotNull);
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('filters products by city slug', () async {
      final result = await repository.getProducts(citySlug: 'sharm-el-sheikh');

      result.when(
        success: (products) {
          expect(products, isNotEmpty);
          expect(
            products.every((product) => product.citySlug == 'sharm-el-sheikh'),
            isTrue,
          );
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('returns failure when product is not found', () async {
      final result = await repository.getProduct('missing-product');

      result.when(
        success: (_) => fail('Missing product should not resolve.'),
        failure: (failure) {
          expect(failure, isA<ValidationFailure>());
          expect(failure.message, 'Product was not found.');
        },
      );
    });

    test('searches products from the demo catalog', () async {
      final result = await repository.searchProducts('vegetables');

      result.when(
        success: (products) {
          expect(products, isNotEmpty);
          expect(products.first.tags, contains('vegetables'));
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('loads categories and brands from local demo data', () async {
      final categoriesResult = await repository.getCategories();
      final brandsResult = await repository.getBrands();

      categoriesResult.when(
        success: (categories) {
          expect(categories, isNotEmpty);
          expect(categories.first.slug, isNotEmpty);
        },
        failure: (failure) => fail(failure.message),
      );
      brandsResult.when(
        success: (brands) {
          expect(brands, isNotEmpty);
          expect(brands.first.productCount, greaterThan(0));
        },
        failure: (failure) => fail(failure.message),
      );
    });
  });
}
