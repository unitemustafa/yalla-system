import 'package:dio/dio.dart';

import 'api_endpoints.dart';

abstract final class DioFactory {
  static BaseOptions baseOptions() {
    return BaseOptions(
      baseUrl: ApiEndpoints.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      responseType: ResponseType.json,
      headers: const {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    );
  }

  static Dio create() {
    return Dio(baseOptions());
  }
}
