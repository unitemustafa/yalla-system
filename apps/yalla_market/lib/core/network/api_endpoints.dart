abstract final class ApiEndpoints {
  static const baseUrl = String.fromEnvironment('API_BASE_URL');
  static const apiVersion = 'v1';

  static String get rootBaseUrl =>
      baseUrl.trim().replaceFirst(RegExp(r'/+$'), '');

  static String get apiBaseUrl {
    if (rootBaseUrl.isEmpty) return '';
    return '$rootBaseUrl/api/$apiVersion';
  }

  static const refreshToken = '/auth/refresh';
}
