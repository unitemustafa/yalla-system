import 'package:dio/dio.dart';
import 'package:yallamarket/core/network/api_client.dart';

class FakeApiRequest {
  const FakeApiRequest({
    required this.method,
    required this.path,
    this.data,
    this.queryParameters,
  });

  final String method;
  final String path;
  final Object? data;
  final Map<String, dynamic>? queryParameters;
}

class FakeApiClient implements ApiClient {
  FakeApiClient(this._handler);

  final Object? Function(FakeApiRequest request) _handler;
  final List<FakeApiRequest> requests = [];

  @override
  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _send<T>(
      FakeApiRequest(
        method: 'GET',
        path: path,
        queryParameters: queryParameters,
      ),
    );
  }

  @override
  Future<T> post<T>(String path, {Object? data, Options? options}) async {
    return _send<T>(FakeApiRequest(method: 'POST', path: path, data: data));
  }

  @override
  Future<T> patch<T>(String path, {Object? data, Options? options}) async {
    return _send<T>(FakeApiRequest(method: 'PATCH', path: path, data: data));
  }

  @override
  Future<T> put<T>(String path, {Object? data, Options? options}) async {
    return _send<T>(FakeApiRequest(method: 'PUT', path: path, data: data));
  }

  @override
  Future<T> delete<T>(String path, {Object? data, Options? options}) async {
    return _send<T>(FakeApiRequest(method: 'DELETE', path: path, data: data));
  }

  T _send<T>(FakeApiRequest request) {
    requests.add(request);
    return _handler(request) as T;
  }
}
