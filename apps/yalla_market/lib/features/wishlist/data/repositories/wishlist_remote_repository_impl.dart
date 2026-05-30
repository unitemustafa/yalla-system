import 'package:dio/dio.dart';

import '../../../../core/errors/api_error_handler.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/wishlist_item.dart';
import '../../domain/repositories/wishlist_repository.dart';

class WishlistRemoteRepositoryImpl implements WishlistRepository {
  WishlistRemoteRepositoryImpl(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<ApiResult<List<WishlistItem>>> getItems() {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>('/wishlist');
      return _itemsFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<WishlistItem>>> toggleItem(WishlistItem item) {
    return _guard(() async {
      final payload = await _apiClient.post<Object?>(
        '/wishlist/items/toggle',
        data: item.toJson(),
      );
      return _itemsFromPayload(payload);
    });
  }

  List<WishlistItem> _itemsFromPayload(Object? payload) {
    final rawItems = payload is Map<String, dynamic>
        ? payload['items'] ?? payload['wishlistItems']
        : payload;
    if (rawItems is! List) return const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(WishlistItem.fromJson)
        .toList(growable: false);
  }

  Future<ApiResult<T>> _guard<T>(Future<T> Function() action) async {
    try {
      return ApiResult.success(await action());
    } on DioException catch (error) {
      return ApiResult.failure(ApiErrorHandler.handle(error));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not update wishlist.'),
      );
    }
  }
}
