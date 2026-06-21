import 'package:dio/dio.dart';

import '../../../../core/errors/api_error_handler.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/address.dart';
import '../../domain/repositories/address_repository.dart';

class AddressRemoteRepositoryImpl implements AddressRepository {
  AddressRemoteRepositoryImpl(this._apiClient);

  final ApiClient _apiClient;

  @override
  Future<ApiResult<List<AddressData>>> getAddresses() {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>('/addresses');
      return _addressesFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<AddressData?>> getSelectedAddress() {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>('/addresses/default');
      if (payload is! Map<String, dynamic>) return null;
      return AddressData.fromJson(payload);
    });
  }

  @override
  Future<ApiResult<List<AddressData>>> saveAddress(AddressData address) {
    return _guard(() async {
      if (address.latitude == null || address.longitude == null) {
        throw const ValidationFailure(
          'GPS coordinates are required to save an address.',
        );
      }
      final hasServerId = address.id.trim().isNotEmpty;
      final payload = hasServerId
          ? await _apiClient.patch<Object?>(
              '/addresses/${address.id}',
              data: address.toApiJson(),
            )
          : await _apiClient.post<Object?>(
              '/addresses',
              data: address.toApiJson(),
            );
      return _addressesFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<AddressData>>> deleteAddress(String id) {
    return _guard(() async {
      final payload = await _apiClient.delete<Object?>('/addresses/$id');
      return _addressesFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<List<AddressData>>> selectAddress(String id) {
    return _guard(() async {
      final payload = await _apiClient.patch<Object?>('/addresses/$id/default');
      return _addressesFromPayload(payload);
    });
  }

  List<AddressData> _addressesFromPayload(Object? payload) {
    final rawItems = payload is Map<String, dynamic>
        ? payload['items'] ?? payload['addresses']
        : payload;
    if (rawItems is! List) return const [];
    return rawItems
        .whereType<Map<String, dynamic>>()
        .map(AddressData.fromJson)
        .toList(growable: false);
  }

  Future<ApiResult<T>> _guard<T>(Future<T> Function() action) async {
    try {
      return ApiResult.success(await action());
    } on DioException catch (error) {
      return ApiResult.failure(ApiErrorHandler.handle(error));
    } on Failure catch (failure) {
      return ApiResult.failure(failure);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not update addresses.'),
      );
    }
  }
}
