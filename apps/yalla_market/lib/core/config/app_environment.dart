import '../network/api_endpoints.dart';

abstract final class AppEnvironment {
  static bool get hasApiBaseUrl => ApiEndpoints.rootBaseUrl.isNotEmpty;

  static bool get useDemoRepositories => !hasApiBaseUrl;

  static void validate() {
    if (!ApiEndpoints.hasConfiguredBaseUrl && !hasApiBaseUrl) {
      throw StateError(
        'API_BASE_URL is required for authentication. '
        'Provide it with --dart-define=API_BASE_URL=<url> or '
        '--dart-define-from-file=env/production.json.',
      );
    }
  }
}
