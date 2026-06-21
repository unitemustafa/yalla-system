import 'package:dio/dio.dart';

import '../../../core/errors/api_error_handler.dart';
import '../../../core/errors/failure.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_result.dart';
import '../domain/home_data.dart';

class HomeRepository {
  const HomeRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<ApiResult<HomeData>> load() async {
    try {
      final payload = await _apiClient.get<Map<String, dynamic>>('/home/');
      return ApiResult.success(HomeData.fromJson(payload));
    } on DioException catch (error) {
      if (error.response?.statusCode == 428) {
        return const ApiResult.failure(
          ValidationFailure('location_required', statusCode: 428),
        );
      }
      return ApiResult.failure(ApiErrorHandler.handle(error));
    } catch (_) {
      return const ApiResult.failure(UnknownFailure('Could not load Home.'));
    }
  }
}
