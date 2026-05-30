import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/store/data/repositories/product_remote_repository_impl.dart';

import '../../../../helpers/domain_fixtures.dart';
import '../../../../helpers/fake_api_client.dart';

void main() {
  group('ProductRemoteRepositoryImpl', () {
    test('searches products through the API contract', () async {
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'GET');
        expect(request.path, '/products/search');
        expect(request.queryParameters?['query'], 'shoe');
        return {
          'items': [sampleProduct.toJson()],
        };
      });
      final repository = ProductRemoteRepositoryImpl(apiClient);

      final result = await repository.searchProducts(' shoe ');

      result.when(
        success: (products) => expect(products.single.id, sampleProduct.id),
        failure: (failure) => fail(failure.message),
      );
    });

    test('loads products with the selected city query parameter', () async {
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'GET');
        expect(request.path, '/products');
        expect(request.queryParameters?['city'], 'sharm-el-sheikh');
        return {
          'items': [sampleProduct.toJson()],
        };
      });
      final repository = ProductRemoteRepositoryImpl(apiClient);

      final result = await repository.getProducts(citySlug: 'sharm-el-sheikh');

      result.when(
        success: (products) => expect(products.single.id, sampleProduct.id),
        failure: (failure) => fail(failure.message),
      );
    });

    test('searches products with the selected city query parameter', () async {
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'GET');
        expect(request.path, '/products/search');
        expect(request.queryParameters?['query'], 'shoe');
        expect(request.queryParameters?['city'], 'sharm-el-sheikh');
        return {
          'items': [sampleProduct.toJson()],
        };
      });
      final repository = ProductRemoteRepositoryImpl(apiClient);

      final result = await repository.searchProducts(
        ' shoe ',
        citySlug: 'sharm-el-sheikh',
      );

      result.when(
        success: (products) => expect(products.single.id, sampleProduct.id),
        failure: (failure) => fail(failure.message),
      );
    });

    test('loads categories and brands from remote endpoints', () async {
      final apiClient = FakeApiClient((request) {
        if (request.path == '/categories') {
          return {
            'items': [sampleCategory.toJson()],
          };
        }
        if (request.path == '/brands') {
          return {
            'items': [sampleBrand.toJson()],
          };
        }
        fail('Unexpected request ${request.method} ${request.path}');
      });
      final repository = ProductRemoteRepositoryImpl(apiClient);

      final categoriesResult = await repository.getCategories();
      final brandsResult = await repository.getBrands();

      categoriesResult.when(
        success: (categories) => expect(categories.single.name, 'Shoes'),
        failure: (failure) => fail(failure.message),
      );
      brandsResult.when(
        success: (brands) => expect(brands.single.name, 'Yalla'),
        failure: (failure) => fail(failure.message),
      );
    });
  });
}
