import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/errors/api_error_handler.dart';
import 'package:yalla_market/core/errors/failure.dart';

void main() {
  group('ApiErrorHandler', () {
    test('maps connection errors to network failure', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/products'),
        type: DioExceptionType.connectionError,
      );

      final failure = ApiErrorHandler.handle(error);

      expect(failure, isA<NetworkFailure>());
      expect(failure.message, 'No internet connection.');
    });

    test('maps unauthorized responses to unauthorized failure', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/profile'),
        response: Response<dynamic>(
          requestOptions: RequestOptions(path: '/profile'),
          statusCode: 401,
          data: const {'message': 'Please sign in again.'},
        ),
        type: DioExceptionType.badResponse,
      );

      final failure = ApiErrorHandler.handle(error);

      expect(failure, isA<UnauthorizedFailure>());
      expect(failure.statusCode, 401);
      expect(failure.message, 'Please sign in again.');
    });

    test('maps non-Dio errors to unknown failure', () {
      final failure = ApiErrorHandler.handle(Exception('boom'));

      expect(failure, isA<UnknownFailure>());
      expect(failure.message, 'Something went wrong.');
    });
  });
}
