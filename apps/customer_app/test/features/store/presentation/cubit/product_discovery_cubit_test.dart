import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/errors/failure.dart';
import 'package:yallamarket/core/network/api_result.dart';
import 'package:yallamarket/features/location/domain/entities/city_data.dart';
import 'package:yallamarket/features/location/domain/repositories/location_repository.dart';
import 'package:yallamarket/features/location/domain/usecases/location_usecases.dart';
import 'package:yallamarket/features/store/domain/entities/brand_data.dart';
import 'package:yallamarket/features/store/domain/entities/category_data.dart';
import 'package:yallamarket/features/store/domain/entities/product_data.dart';
import 'package:yallamarket/features/store/domain/repositories/product_repository.dart';
import 'package:yallamarket/features/store/domain/usecases/get_brands_usecase.dart';
import 'package:yallamarket/features/store/domain/usecases/get_categories_usecase.dart';
import 'package:yallamarket/features/store/domain/usecases/get_products_usecase.dart';
import 'package:yallamarket/features/store/domain/usecases/search_products_usecase.dart';
import 'package:yallamarket/features/store/presentation/cubit/product_discovery_cubit.dart';
import 'package:yallamarket/features/store/presentation/cubit/product_discovery_state.dart';

import '../../../../helpers/domain_fixtures.dart';

void main() {
  group('ProductDiscoveryCubit', () {
    test('loads products, categories, and brands when created', () async {
      final locationRepository = _FakeLocationRepository();
      final cubit = ProductDiscoveryCubit(
        getProducts: GetProductsUseCase(_FakeProductRepository()),
        searchProducts: SearchProductsUseCase(_FakeProductRepository()),
        getCategories: GetCategoriesUseCase(_FakeProductRepository()),
        getBrands: GetBrandsUseCase(_FakeProductRepository()),
        getSelectedCity: GetSelectedCityUseCase(locationRepository),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emitsThrough(isA<ProductDiscoveryReady>()),
      );

      await expectedStates;

      final state = cubit.state as ProductDiscoveryReady;
      expect(
        state.products.any((product) => product.id == sampleProduct.id),
        isTrue,
      );
      expect(state.categories.single.id, sampleCategory.id);
      expect(state.brands.single.id, sampleBrand.id);
      await cubit.close();
    });

    test('searches products and filters categories for the query', () async {
      final repository = _FakeProductRepository();
      final locationRepository = _FakeLocationRepository();
      final cubit = ProductDiscoveryCubit(
        getProducts: GetProductsUseCase(repository),
        searchProducts: SearchProductsUseCase(repository),
        getCategories: GetCategoriesUseCase(repository),
        getBrands: GetBrandsUseCase(repository),
        getSelectedCity: GetSelectedCityUseCase(locationRepository),
      );
      await Future<void>.delayed(Duration.zero);

      await cubit.search('shoe');

      final state = cubit.state as ProductDiscoveryReady;
      expect(repository.lastQuery, 'shoe');
      expect(repository.lastCitySlug, 'sharm-el-sheikh');
      expect(state.query, 'shoe');
      expect(state.products.single.id, sampleProduct.id);
      await cubit.close();
    });

    test('keeps stale discovery data when search fails', () async {
      final repository = _FakeProductRepository();
      final locationRepository = _FakeLocationRepository();
      final cubit = ProductDiscoveryCubit(
        getProducts: GetProductsUseCase(repository),
        searchProducts: SearchProductsUseCase(repository),
        getCategories: GetCategoriesUseCase(repository),
        getBrands: GetBrandsUseCase(repository),
        getSelectedCity: GetSelectedCityUseCase(locationRepository),
      );
      await Future<void>.delayed(Duration.zero);
      repository.searchFailure = const ServerFailure('Search unavailable.');

      await cubit.search('shoe');

      final state = cubit.state as ProductDiscoveryFailure;
      expect(state.message, 'Search unavailable.');
      expect(
        state.products.any((product) => product.id == sampleProduct.id),
        isTrue,
      );
      await cubit.close();
    });

    test('requires a selected city before loading discovery data', () async {
      final repository = _FakeProductRepository();
      final cubit = ProductDiscoveryCubit(
        getProducts: GetProductsUseCase(repository),
        searchProducts: SearchProductsUseCase(repository),
        getCategories: GetCategoriesUseCase(repository),
        getBrands: GetBrandsUseCase(repository),
        getSelectedCity: GetSelectedCityUseCase(
          _FakeLocationRepository(city: null),
        ),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emits(isA<ProductDiscoveryNeedsCity>()),
      );

      await expectedStates;

      expect(repository.loadCount, 0);
      await cubit.close();
    });
  });
}

class _FakeProductRepository implements ProductRepository {
  Failure? searchFailure;
  String? lastQuery;
  String? lastCitySlug;
  int loadCount = 0;

  @override
  Future<ApiResult<List<ProductData>>> getProducts({String? citySlug}) async {
    loadCount += 1;
    lastCitySlug = citySlug;
    return const ApiResult.success([sampleProduct]);
  }

  @override
  Future<ApiResult<ProductData>> getProduct(String idOrSlug) async {
    return const ApiResult.success(sampleProduct);
  }

  @override
  Future<ApiResult<List<ProductData>>> searchProducts(
    String query, {
    String? citySlug,
  }) async {
    lastQuery = query;
    lastCitySlug = citySlug;
    if (searchFailure case final failure?) {
      return ApiResult.failure(failure);
    }
    return const ApiResult.success([sampleProduct]);
  }

  @override
  Future<ApiResult<List<CategoryData>>> getCategories() async {
    return const ApiResult.success([sampleCategory]);
  }

  @override
  Future<ApiResult<List<BrandData>>> getBrands() async {
    return const ApiResult.success([sampleBrand]);
  }
}

class _FakeLocationRepository implements LocationRepository {
  _FakeLocationRepository({
    this.city = const CityData(
      name: 'Sharm El Sheikh',
      slug: 'sharm-el-sheikh',
    ),
  });

  final CityData? city;

  @override
  Future<ApiResult<CityData?>> getSelectedCity() async {
    return ApiResult.success(city);
  }

  @override
  Future<ApiResult<CityData>> saveSelectedCity(CityData city) async {
    return ApiResult.success(city);
  }

  @override
  Future<ApiResult<CityData>> useCurrentLocation() async {
    return ApiResult.success(city ?? CityData.supported.first);
  }
}
