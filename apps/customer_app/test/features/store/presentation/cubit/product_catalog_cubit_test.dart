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
import 'package:yallamarket/features/store/domain/usecases/get_products_usecase.dart';
import 'package:yallamarket/features/store/presentation/cubit/product_catalog_cubit.dart';
import 'package:yallamarket/features/store/presentation/cubit/product_catalog_state.dart';

import '../../../../helpers/domain_fixtures.dart';

void main() {
  group('ProductCatalogCubit', () {
    test('loads products when it is created', () async {
      final cubit = ProductCatalogCubit(
        GetProductsUseCase(_FakeProductRepository(products: [sampleProduct])),
        GetSelectedCityUseCase(_FakeLocationRepository()),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emitsThrough(isA<ProductCatalogReady>()),
      );

      await expectedStates;

      final state = cubit.state as ProductCatalogReady;
      expect(state.products.single.id, sampleProduct.id);
      await cubit.close();
    });

    test('emits failure when product loading fails', () async {
      final repository = _FakeProductRepository(
        products: const [],
        failure: const ServerFailure('Products are unavailable.'),
      );
      final cubit = ProductCatalogCubit(
        GetProductsUseCase(repository),
        GetSelectedCityUseCase(_FakeLocationRepository()),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emitsThrough(isA<ProductCatalogFailure>()),
      );

      await expectedStates;

      expect(
        (cubit.state as ProductCatalogFailure).message,
        'Products are unavailable.',
      );
      await cubit.close();
    });

    test('does not reload a ready catalog unless forced', () async {
      final repository = _FakeProductRepository(products: [sampleProduct]);
      final cubit = ProductCatalogCubit(
        GetProductsUseCase(repository),
        GetSelectedCityUseCase(_FakeLocationRepository()),
      );
      await Future<void>.delayed(Duration.zero);

      await cubit.loadProducts();
      expect(repository.loadCount, 1);
      expect(repository.lastCitySlug, 'sharm-el-sheikh');

      await cubit.loadProducts(force: true);
      expect(repository.loadCount, 2);
      await cubit.close();
    });

    test('requires a selected city before loading products', () async {
      final repository = _FakeProductRepository(products: [sampleProduct]);
      final cubit = ProductCatalogCubit(
        GetProductsUseCase(repository),
        GetSelectedCityUseCase(_FakeLocationRepository(city: null)),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emits(isA<ProductCatalogNeedsCity>()),
      );

      await expectedStates;

      expect(repository.loadCount, 0);
      await cubit.close();
    });
  });
}

class _FakeProductRepository implements ProductRepository {
  _FakeProductRepository({required this.products, this.failure});

  final List<ProductData> products;
  final Failure? failure;
  int loadCount = 0;
  String? lastCitySlug;

  @override
  Future<ApiResult<List<ProductData>>> getProducts({String? citySlug}) async {
    loadCount += 1;
    lastCitySlug = citySlug;

    if (failure case final error?) {
      return ApiResult.failure(error);
    }

    return ApiResult.success(products);
  }

  @override
  Future<ApiResult<ProductData>> getProduct(String idOrSlug) async {
    return ApiResult.success(products.first);
  }

  @override
  Future<ApiResult<List<ProductData>>> searchProducts(
    String query, {
    String? citySlug,
  }) async {
    return ApiResult.success(products);
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
