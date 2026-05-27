import 'package:dio/dio.dart';

import 'failure.dart';

abstract final class ApiErrorHandler {
  static Failure handle(Object error) {
    if (error is DioException) {
      return _handleDioException(error);
    }

    return const UnknownFailure('Something went wrong.');
  }

  static Failure _handleDioException(DioException error) {
    final statusCode = error.response?.statusCode;
    final message =
        _messageFromResponse(error.response) ?? _fallbackMessage(error);

    return switch (error.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout ||
      DioExceptionType.connectionError ||
      DioExceptionType.badCertificate => NetworkFailure(
        message,
        statusCode: statusCode,
      ),
      DioExceptionType.cancel => const NetworkFailure('Request was cancelled.'),
      DioExceptionType.badResponse => _failureFromStatusCode(
        statusCode,
        message,
      ),
      DioExceptionType.unknown => UnknownFailure(
        message,
        statusCode: statusCode,
      ),
    };
  }

  static Failure _failureFromStatusCode(int? statusCode, String message) {
    if (statusCode == null) {
      return ServerFailure(message);
    }

    return switch (statusCode) {
      400 || 422 => ValidationFailure(message, statusCode: statusCode),
      401 || 403 => UnauthorizedFailure(message, statusCode: statusCode),
      >= 500 => ServerFailure(message, statusCode: statusCode),
      _ => ServerFailure(message, statusCode: statusCode),
    };
  }

  static String? _messageFromResponse(Response<dynamic>? response) {
    final data = response?.data;
    if (data is Map<String, dynamic>) {
      final message = data['message'];
      if (message is String && message.trim().isNotEmpty) {
        return message;
      }

      final error = data['error'];
      if (error is String && error.trim().isNotEmpty) {
        return error;
      }
    }

    return null;
  }

  static String _fallbackMessage(DioException error) {
    return switch (error.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout => 'Connection timed out.',
      DioExceptionType.connectionError => 'No internet connection.',
      DioExceptionType.badCertificate => 'Unable to verify the server.',
      DioExceptionType.badResponse => 'Server error.',
      DioExceptionType.cancel => 'Request was cancelled.',
      DioExceptionType.unknown => 'Something went wrong.',
    };
  }
}
