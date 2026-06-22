import 'package:dio/dio.dart';

import '../../../../core/errors/api_error_handler.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/brand_data.dart';
import '../../domain/entities/category_data.dart';
import '../../domain/entities/product_data.dart';
import '../../domain/repositories/product_repository.dart';
import 'product_repository_impl.dart';

class ProductRemoteRepositoryImpl implements ProductRepository {
  ProductRemoteRepositoryImpl(this._apiClient);

  final ApiClient _apiClient;
  final ProductRepositoryImpl _demoRepository = ProductRepositoryImpl();

  @override
  Future<ApiResult<List<ProductData>>> getProducts({String? citySlug}) {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>(
        '/products',
        queryParameters: _cityQuery(citySlug),
      );
      return _productsFromPayload(payload);
    }, fallback: () => _demoRepository.getProducts(citySlug: citySlug));
  }

  @override
  Future<ApiResult<ProductData>> getProduct(String idOrSlug) {
    return _guard(() async {
      final payload = await _apiClient.get<Map<String, dynamic>>(
        '/products/$idOrSlug',
      );
      return ProductData.fromJson(payload);
    }, fallback: () => _demoRepository.getProduct(idOrSlug));
  }

  @override
  Future<ApiResult<List<ProductData>>> searchProducts(
    String query, {
    String? citySlug,
  }) {
    return _guard(
      () async {
        final payload = await _apiClient.get<Object?>(
          '/products/search',
          queryParameters: {'query': query.trim(), ..._cityQuery(citySlug)},
        );
        return _productsFromPayload(payload);
      },
      fallback: () => _demoRepository.searchProducts(query, citySlug: citySlug),
    );
  }

  @override
  Future<ApiResult<List<CategoryData>>> getCategories() {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>('/categories');
      return _categoriesFromPayload(payload);
    }, fallback: _demoRepository.getCategories);
  }

  @override
  Future<ApiResult<List<BrandData>>> getBrands() {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>('/brands');
      return _brandsFromPayload(payload);
    }, fallback: _demoRepository.getBrands);
  }

  List<ProductData> _productsFromPayload(Object? payload) {
    final rawItems = payload is Map<String, dynamic>
        ? payload['items'] ?? payload['products']
        : payload;
    if (rawItems is! List) return const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(ProductData.fromJson)
        .toList(growable: false);
  }

  List<CategoryData> _categoriesFromPayload(Object? payload) {
    final rawItems = payload is Map<String, dynamic>
        ? payload['items'] ?? payload['categories']
        : payload;
    if (rawItems is! List) return const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(CategoryData.fromJson)
        .toList(growable: false);
  }

  List<BrandData> _brandsFromPayload(Object? payload) {
    final rawItems = payload is Map<String, dynamic>
        ? payload['items'] ?? payload['brands']
        : payload;
    if (rawItems is! List) return const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(BrandData.fromJson)
        .toList(growable: false);
  }

  Map<String, dynamic> _cityQuery(String? citySlug) {
    final normalized = citySlug?.trim();
    if (normalized == null || normalized.isEmpty) return const {};
    return {'region': normalized, 'city': normalized};
  }

  Future<ApiResult<T>> _guard<T>(
    Future<T> Function() action, {
    Future<ApiResult<T>> Function()? fallback,
  }) async {
    try {
      return ApiResult.success(await action());
    } on DioException catch (error) {
      if (fallback != null && _shouldUseDemoFallback(error)) {
        return fallback();
      }
      return ApiResult.failure(ApiErrorHandler.handle(error));
    } catch (_) {
      if (fallback != null) return fallback();
      return const ApiResult.failure(
        UnknownFailure('Could not load products.'),
      );
    }
  }

  bool _shouldUseDemoFallback(DioException error) {
    final statusCode = error.response?.statusCode;
    final contentType = error.response?.headers.value('content-type') ?? '';
    return statusCode == 404 || contentType.toLowerCase().contains('html');
  }
}
