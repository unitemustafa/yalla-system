import 'dart:async';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/network/api_client.dart';
import 'package:yalla_market/core/session/session_expired_notifier.dart';
import 'package:yalla_market/core/storage/token_store.dart';

void main() {
  test('clears tokens and notifies when refresh recovery fails', () async {
    final tokenStore = InMemoryTokenStore();
    await tokenStore.save(
      StoredAuthTokens(
        accessToken: 'expired-access',
        refreshToken: 'expired-refresh',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      ),
    );

    final notifier = SessionExpiredNotifier();
    var expirationEvents = 0;
    notifier.addListener(() => expirationEvents += 1);

    final dio = Dio()
      ..httpClientAdapter = _Adapter((options) {
        return ResponseBody.fromString(
          '{"message":"Unauthorized"}',
          401,
          headers: {
            Headers.contentTypeHeader: [Headers.jsonContentType],
          },
        );
      });
    final refreshDio = Dio()
      ..httpClientAdapter = _Adapter((options) {
        expect(options.path, '/auth/refresh');
        return ResponseBody.fromString(
          '{"message":"Refresh token expired"}',
          401,
          headers: {
            Headers.contentTypeHeader: [Headers.jsonContentType],
          },
        );
      });
    final client = ApiClient(
      dio: dio,
      refreshDio: refreshDio,
      tokenStore: tokenStore,
      sessionExpiredNotifier: notifier,
    );

    await expectLater(
      client.get<Map<String, dynamic>>('/protected'),
      throwsA(isA<DioException>()),
    );

    expect(await tokenStore.read(), isNull);
    expect(expirationEvents, 1);
  });

  test('uses the rotated refresh token in logout requests', () async {
    final tokenStore = InMemoryTokenStore();
    await tokenStore.save(
      StoredAuthTokens(
        accessToken: 'old-access',
        refreshToken: 'old-refresh',
        expiresAt: DateTime.now().add(const Duration(minutes: 1)),
      ),
    );

    final dio = Dio()
      ..httpClientAdapter = _Adapter((options) {
        expect(options.path, '/auth/logout');
        expect(options.headers['Authorization'], 'Bearer next-access');
        expect(options.data, {'refreshToken': 'next-refresh'});
        return ResponseBody.fromString(
          '{"detail":"Logout successful."}',
          200,
          headers: {
            Headers.contentTypeHeader: [Headers.jsonContentType],
          },
        );
      });
    final refreshDio = Dio()
      ..httpClientAdapter = _Adapter((options) {
        expect(options.path, '/auth/refresh');
        expect(options.data, {'refreshToken': 'old-refresh'});
        return ResponseBody.fromString(
          '{"accessToken":"next-access","refreshToken":"next-refresh",'
          '"expiresIn":3600}',
          200,
          headers: {
            Headers.contentTypeHeader: [Headers.jsonContentType],
          },
        );
      });
    final client = ApiClient(
      dio: dio,
      refreshDio: refreshDio,
      tokenStore: tokenStore,
    );

    await client.post<Object?>(
      '/auth/logout',
      data: {'refreshToken': 'old-refresh'},
    );

    expect((await tokenStore.read())?.refreshToken, 'next-refresh');
  });
}

class _Adapter implements HttpClientAdapter {
  _Adapter(this._handler);

  final ResponseBody Function(RequestOptions options) _handler;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    return _handler(options);
  }

  @override
  void close({bool force = false}) {}
}
