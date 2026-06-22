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

    test('extracts nested validation messages from field errors', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/auth/login'),
        response: Response<dynamic>(
          requestOptions: RequestOptions(path: '/auth/login'),
          statusCode: 400,
          data: const {
            'email': ['Enter a valid email.'],
          },
        ),
        type: DioExceptionType.badResponse,
      );

      final failure = ApiErrorHandler.handle(error);

      expect(failure, isA<ValidationFailure>());
      expect(failure.statusCode, 400);
      expect(failure.message, 'Enter a valid email.');
    });

    test('does not surface raw html error pages', () {
      final error = DioException(
        requestOptions: RequestOptions(path: '/products'),
        response: Response<dynamic>(
          requestOptions: RequestOptions(path: '/products'),
          statusCode: 404,
          data: '<!DOCTYPE html><html><head><title>Page not found</title>',
        ),
        type: DioExceptionType.badResponse,
      );

      final failure = ApiErrorHandler.handle(error);

      expect(failure.message, 'Server error.');
    });

    test('maps non-Dio errors to unknown failure', () {
      final failure = ApiErrorHandler.handle(Exception('boom'));

      expect(failure, isA<UnknownFailure>());
      expect(failure.message, 'Something went wrong.');
    });
  });
}
