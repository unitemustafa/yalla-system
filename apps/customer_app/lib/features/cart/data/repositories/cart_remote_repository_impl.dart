import 'package:dio/dio.dart';

import '../../../../core/errors/api_error_handler.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/cart_item.dart';
import '../../domain/repositories/cart_repository.dart';

class CartRemoteRepositoryImpl implements CartRepository {
  CartRemoteRepositoryImpl(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<ApiResult<List<CartItemData>>> getItems() {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>('/cart');
      return _itemsFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<CartItemData>>> addItem(
    CartItemData item,
    int quantityToAdd,
  ) {
    return _guard(() async {
      final payload = await _apiClient.post<Object?>(
        '/cart/items',
        data: {
          'productId': item.productId ?? item.id,
          'variantId': item.variantId,
          'quantity': quantityToAdd,
          'attributes': item.attributes
              .map((attribute) => attribute.toJson())
              .toList(),
        },
      );
      return _itemsFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<CartItemData>>> incrementQuantity(String id) {
    return _guard(() async {
      final payload = await _apiClient.post<Object?>(
        '/cart/items/$id/increment',
      );
      return _itemsFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<CartItemData>>> decrementQuantity(String id) {
    return _guard(() async {
      final payload = await _apiClient.post<Object?>(
        '/cart/items/$id/decrement',
      );
      return _itemsFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<CartItemData>>> removeItem(String id) {
    return _guard(() async {
      final payload = await _apiClient.delete<Object?>('/cart/items/$id');
      return _itemsFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<CartItemData>>> clear() {
    return _guard(() async {
      final payload = await _apiClient.delete<Object?>('/cart');
      return _itemsFromPayload(payload);
    });
  }

  List<CartItemData> _itemsFromPayload(Object? payload) {
    final rawItems = payload is Map<String, dynamic>
        ? payload['items'] ?? payload['cartItems']
        : payload;
    if (rawItems is! List) return const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(CartItemData.fromJson)
        .toList(growable: false);
  }

  Future<ApiResult<T>> _guard<T>(Future<T> Function() action) async {
    try {
      return ApiResult.success(await action());
    } on DioException catch (error) {
      return ApiResult.failure(ApiErrorHandler.handle(error));
    } catch (_) {
      return const ApiResult.failure(UnknownFailure('Could not update cart.'));
    }
  }
}
