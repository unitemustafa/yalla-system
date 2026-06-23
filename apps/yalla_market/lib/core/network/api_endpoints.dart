import 'package:flutter/foundation.dart';

abstract final class ApiEndpoints {
  static const configuredBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const developmentBaseUrl = 'http://127.0.0.1:8000';
  static const apiVersion = 'v1';

  static bool get hasConfiguredBaseUrl => configuredBaseUrl.trim().isNotEmpty;

  static String get rootBaseUrl {
    final baseUrl = hasConfiguredBaseUrl
        ? configuredBaseUrl
        : (kDebugMode ? developmentBaseUrl : '');
    return baseUrl.trim().replaceFirst(RegExp(r'/+$'), '');
  }

  static String get apiBaseUrl {
    if (rootBaseUrl.isEmpty) return '';
    return '$rootBaseUrl/api/$apiVersion';
  }

  static const refreshToken = '/auth/refresh';
}
