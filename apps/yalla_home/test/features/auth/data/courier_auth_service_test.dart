import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:yalla_home/features/auth/data/courier_auth_service.dart';

void main() {
  group('CourierAuthService', () {
    test('logs in a courier and remembers the session', () async {
      final storage = _MemorySessionStorage();
      final requests = <http.Request>[];
      final service = CourierAuthService(
        apiBaseUrl: 'http://api.test',
        sessionStorage: storage,
        client: MockClient((request) async {
          requests.add(request);
          return _jsonResponse(200, _sessionPayload);
        }),
      );

      final session = await service.login(
        identifier: '+201001234567',
        password: 'Password123!',
        rememberMe: true,
      );

      expect(session.user.role, 'representative');
      expect(session.rememberMe, isTrue);
      expect(storage.value, isNotNull);
      expect(requests.single.url.toString(),
          'http://api.test/api/v1/auth/courier-login');
    });

    test('rejects a non-courier account', () async {
      final service = CourierAuthService(
        apiBaseUrl: 'http://api.test',
        sessionStorage: _MemorySessionStorage(),
        client: MockClient((_) async {
          return _jsonResponse(200, {
            ..._sessionPayload,
            'user': {..._userPayload, 'role': 'client'},
          });
        }),
      );

      await expectLater(
        service.login(
          identifier: 'customer@example.com',
          password: 'Password123!',
          rememberMe: false,
        ),
        throwsA(isA<CourierAuthException>()),
      );
    });

    test('refreshes an expired access token and reloads the courier', () async {
      final storage = _MemorySessionStorage()
        ..value = jsonEncode({
          ..._sessionPayload,
          'rememberMe': true,
        });
      var meCalls = 0;
      final service = CourierAuthService(
        apiBaseUrl: 'http://api.test',
        sessionStorage: storage,
        client: MockClient((request) async {
          if (request.url.path.endsWith('/auth/me')) {
            meCalls += 1;
            if (meCalls == 1) {
              return _jsonResponse(401, {'detail': 'Token is invalid.'});
            }
            expect(request.headers['authorization'], 'Bearer next-access');
            return _jsonResponse(200, {
              'user': {..._userPayload, 'first_name': 'Updated'},
            });
          }
          if (request.url.path.endsWith('/auth/refresh')) {
            return _jsonResponse(200, {
              'accessToken': 'next-access',
              'refreshToken': 'next-refresh',
            });
          }
          fail('Unexpected request: ${request.url}');
        }),
      );

      final session = await service.restoreSession();

      expect(session?.accessToken, 'next-access');
      expect(session?.refreshToken, 'next-refresh');
      expect(session?.user.firstName, 'Updated');
      expect(jsonDecode(storage.value!)['accessToken'], 'next-access');
    });

    test('clears the local session when refresh fails', () async {
      final storage = _MemorySessionStorage()
        ..value = jsonEncode({
          ..._sessionPayload,
          'rememberMe': true,
        });
      final service = CourierAuthService(
        apiBaseUrl: 'http://api.test',
        sessionStorage: storage,
        client: MockClient((request) async {
          if (request.url.path.endsWith('/auth/me')) {
            return _jsonResponse(401, {'detail': 'Token is invalid.'});
          }
          return _jsonResponse(401, {'detail': 'Token is invalid.'});
        }),
      );

      expect(await service.restoreSession(), isNull);
      expect(storage.value, isNull);
    });

    test('logout sends the refresh token and always clears storage', () async {
      final storage = _MemorySessionStorage();
      late Map<String, dynamic> logoutBody;
      final service = CourierAuthService(
        apiBaseUrl: 'http://api.test',
        sessionStorage: storage,
        client: MockClient((request) async {
          if (request.url.path.endsWith('/auth/courier-login')) {
            return _jsonResponse(200, _sessionPayload);
          }
          logoutBody = jsonDecode(request.body) as Map<String, dynamic>;
          return _jsonResponse(200, {'detail': 'Logout successful.'});
        }),
      );
      await service.login(
        identifier: 'courier@example.com',
        password: 'Password123!',
        rememberMe: true,
      );

      await service.logout();

      expect(logoutBody, {'refreshToken': 'refresh-token'});
      expect(storage.value, isNull);
      expect(service.currentSession, isNull);
    });
  });
}

class _MemorySessionStorage implements CourierSessionStorage {
  String? value;

  @override
  Future<void> clear() async => value = null;

  @override
  Future<String?> read() async => value;

  @override
  Future<void> write(String value) async => this.value = value;
}

http.Response _jsonResponse(int statusCode, Map<String, dynamic> body) {
  return http.Response(
    jsonEncode(body),
    statusCode,
    headers: {'content-type': 'application/json; charset=utf-8'},
  );
}

const _userPayload = <String, dynamic>{
  'id': 'courier-1',
  'first_name': 'Courier',
  'last_name': 'One',
  'email': 'courier@example.com',
  'phone': '+201001234567',
  'role': 'representative',
};

const _sessionPayload = <String, dynamic>{
  'user': _userPayload,
  'accessToken': 'access-token',
  'refreshToken': 'refresh-token',
};
