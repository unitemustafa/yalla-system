import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/errors/failure.dart';
import 'package:yallamarket/core/network/api_result.dart';

void main() {
  group('ApiResult', () {
    test('calls success callback when result is success', () {
      const result = ApiResult<int>.success(7);

      final value = result.when(success: (data) => data * 2, failure: (_) => 0);

      expect(value, 14);
    });

    test('calls failure callback when result is failure', () {
      const result = ApiResult<int>.failure(
        NetworkFailure('No internet connection.'),
      );

      final value = result.when(
        success: (_) => 'success',
        failure: (failure) => failure.message,
      );

      expect(value, 'No internet connection.');
    });
  });
}
