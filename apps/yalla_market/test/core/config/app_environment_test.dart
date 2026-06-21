import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/config/app_environment.dart';

void main() {
  test('uses the local API origin by default in debug builds', () {
    expect(AppEnvironment.hasApiBaseUrl, isTrue);
    expect(AppEnvironment.useDemoRepositories, isFalse);
    expect(AppEnvironment.validate, returnsNormally);
  });
}
