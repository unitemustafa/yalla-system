import 'package:dio/dio.dart';

import '../storage/token_store.dart';
import '../session/session_expired_notifier.dart';
import 'api_endpoints.dart';
import 'dio_factory.dart';

class ApiClient {
  ApiClient({
    Dio? dio,
    Dio? refreshDio,
    SessionExpiredNotifier? sessionExpiredNotifier,
    required TokenStore tokenStore,
  }) : _dio = dio ?? DioFactory.create(),
       _tokenStore = tokenStore,
       _sessionExpiredNotifier =
           sessionExpiredNotifier ?? SessionExpiredNotifier.instance,
       _refreshDio = refreshDio ?? Dio(DioFactory.baseOptions()) {
    _dio.interceptors.add(
      QueuedInterceptorsWrapper(onRequest: _onRequest, onError: _onError),
    );
  }

  final Dio _dio;
  final Dio _refreshDio;
  final TokenStore _tokenStore;
  final SessionExpiredNotifier _sessionExpiredNotifier;

  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    final response = await _dio.get<Object?>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
    return _unwrap<T>(response.data);
  }

  Future<T> post<T>(String path, {Object? data, Options? options}) async {
    final response = await _dio.post<Object?>(
      path,
      data: data,
      options: options,
    );
    return _unwrap<T>(response.data);
  }

  Future<T> patch<T>(String path, {Object? data, Options? options}) async {
    final response = await _dio.patch<Object?>(
      path,
      data: data,
      options: options,
    );
    return _unwrap<T>(response.data);
  }

  Future<T> put<T>(String path, {Object? data, Options? options}) async {
    final response = await _dio.put<Object?>(
      path,
      data: data,
      options: options,
    );
    return _unwrap<T>(response.data);
  }

  Future<T> delete<T>(String path, {Object? data, Options? options}) async {
    final response = await _dio.delete<Object?>(
      path,
      data: data,
      options: options,
    );
    return _unwrap<T>(response.data);
  }

  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    try {
      final tokens = await _tokenStore.read();
      if (tokens != null) {
        final refreshed = tokens.expiresSoon && !_isRefreshRequest(options)
            ? await _refreshTokens(tokens)
            : tokens;
        options.headers['Authorization'] = 'Bearer ${refreshed.accessToken}';
      }
    } catch (error) {
      await _expireSession();
      handler.reject(
        error is DioException
            ? error
            : DioException(
                requestOptions: options,
                error: error,
                type: DioExceptionType.unknown,
              ),
      );
      return;
    }

    handler.next(options);
  }

  Future<void> _onError(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    final alreadyRetried = error.requestOptions.extra['authRetried'] == true;
    if (error.response?.statusCode != 401 ||
        alreadyRetried ||
        _isRefreshRequest(error.requestOptions)) {
      handler.next(error);
      return;
    }

    final tokens = await _tokenStore.read();
    if (tokens == null) {
      handler.next(error);
      return;
    }

    try {
      final refreshed = await _refreshTokens(tokens);
      final request = error.requestOptions;
      request.extra['authRetried'] = true;
      request.headers['Authorization'] = 'Bearer ${refreshed.accessToken}';
      final retryResponse = await _dio.fetch<Object?>(request);
      handler.resolve(retryResponse);
    } catch (_) {
      await _expireSession();
      handler.next(error);
    }
  }

  Future<StoredAuthTokens> _refreshTokens(StoredAuthTokens current) async {
    final response = await _refreshDio.post<Object?>(
      ApiEndpoints.refreshToken,
      data: {'refreshToken': current.refreshToken},
      options: Options(extra: const {'skipAuth': true}),
    );
    final payload = _unwrap<Map<String, dynamic>>(response.data);
    final next = _tokensFromJson(
      payload,
      fallbackRefreshToken: current.refreshToken,
    ).copyWith(isSessionOnly: current.isSessionOnly);
    await _tokenStore.save(next);
    return next;
  }

  bool _isRefreshRequest(RequestOptions options) {
    return options.path.endsWith(ApiEndpoints.refreshToken) ||
        options.extra['skipAuth'] == true;
  }

  Future<void> _expireSession() async {
    await _tokenStore.clear();
    _sessionExpiredNotifier.notifyExpired();
  }

  T _unwrap<T>(Object? data) {
    final unwrapped = data is Map<String, dynamic> && data.containsKey('data')
        ? data['data']
        : data;
    return unwrapped as T;
  }
}

StoredAuthTokens tokensFromApiPayload(Map<String, dynamic> json) {
  return _tokensFromJson(json);
}

StoredAuthTokens _tokensFromJson(
  Map<String, dynamic> json, {
  String? fallbackRefreshToken,
}) {
  final expiresAt = _dateFromJson(json['expiresAt'] ?? json['expires_at']);
  final expiresIn = json['expiresIn'] ?? json['expires_in'];
  return StoredAuthTokens(
    accessToken: (json['accessToken'] ?? json['access_token']) as String,
    refreshToken:
        (json['refreshToken'] ?? json['refresh_token'] ?? fallbackRefreshToken)
            as String,
    expiresAt:
        expiresAt ??
        DateTime.now().add(Duration(seconds: _intFromJson(expiresIn) ?? 3600)),
  );
}

DateTime? _dateFromJson(Object? value) {
  if (value is! String || value.trim().isEmpty) return null;
  return DateTime.tryParse(value);
}

int? _intFromJson(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value);
  return null;
}
