import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:yalla_market/core/storage/token_store.dart';
import 'package:yalla_market/features/auth/data/repositories/auth_remote_repository_impl.dart';

import '../../../../helpers/fake_api_client.dart';

void main() {
  group('AuthRemoteRepositoryImpl', () {
    test('login stores secure tokens when remember me is enabled', () async {
      final tokenStore = InMemoryTokenStore();
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'POST');
        expect(request.path, '/auth/login');
        expect(request.data, {
          'identifier': 'm@example.com',
          'password': 'Password123!',
          'rememberMe': true,
        });
        return _sessionPayload;
      });
      final repository = AuthRemoteRepositoryImpl(apiClient, tokenStore);

      final result = await repository.login(
        email: 'm@example.com',
        password: 'Password123!',
        rememberMe: true,
      );

      result.when(
        success: (session) {
          expect(session.user.email, 'm@example.com');
          expect(session.accessToken, 'access-token');
        },
        failure: (failure) => fail(failure.message),
      );
      expect((await tokenStore.read())?.refreshToken, 'refresh-token');
      expect((await tokenStore.read())?.isSessionOnly, isFalse);
      expect((await tokenStore.read())?.sessionExpiresAt, isNotNull);
    });

    test(
      'login keeps tokens session-only when remember me is disabled',
      () async {
        final tokenStore = InMemoryTokenStore();
        final apiClient = FakeApiClient((request) {
          expect(request.method, 'POST');
          expect(request.path, '/auth/login');
          expect(request.data, {
            'identifier': 'm@example.com',
            'password': 'Password123!',
            'rememberMe': false,
          });
          return _sessionPayload;
        });
        final repository = AuthRemoteRepositoryImpl(apiClient, tokenStore);

        final result = await repository.login(
          email: 'm@example.com',
          password: 'Password123!',
        );

        result.when(
          success: (session) {
            expect(session.user.email, 'm@example.com');
            expect(session.accessToken, 'access-token');
          },
          failure: (failure) => fail(failure.message),
        );
        expect((await tokenStore.read())?.refreshToken, 'refresh-token');
        expect((await tokenStore.read())?.isSessionOnly, isTrue);
        expect((await tokenStore.read())?.sessionExpiresAt, isNotNull);
      },
    );

    test(
      'signup accepts verification-only responses without storing tokens',
      () async {
        final tokenStore = InMemoryTokenStore();
        await tokenStore.save(
          StoredAuthTokens(
            accessToken: 'old-access-token',
            refreshToken: 'old-refresh-token',
            expiresAt: DateTime.now().add(const Duration(hours: 1)),
          ),
        );
        final apiClient = FakeApiClient((request) {
          expect(request.method, 'POST');
          expect(request.path, '/auth/signup');
          expect(request.data, containsPair('username', 'mustafa_ali'));
          return {
            'email': 'mustafa@example.com',
            'message': 'Verification email sent',
          };
        });
        final repository = AuthRemoteRepositoryImpl(apiClient, tokenStore);

        final result = await repository.signup(
          firstName: 'Mustafa',
          lastName: 'Ali',
          username: 'mustafa_ali',
          email: 'mustafa@example.com',
          password: 'Password123!',
          phone: '',
        );

        result.when(
          success: (session) {
            expect(session.user.email, 'mustafa@example.com');
            expect(session.accessToken, isNull);
          },
          failure: (failure) => fail(failure.message),
        );
        expect(await tokenStore.read(), isNull);
      },
    );

    test(
      'restoreSavedSession clears legacy auth and loads current user',
      () async {
        SharedPreferences.setMockInitialValues({
          'auth.local_session': '{}',
          'auth.local_accounts': '[]',
        });
        final tokenStore = InMemoryTokenStore();
        await tokenStore.save(
          StoredAuthTokens(
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresAt: DateTime.now().add(const Duration(hours: 1)),
          ),
        );
        final apiClient = FakeApiClient((request) {
          expect(request.path, '/auth/me');
          return {'user': _userPayload};
        });
        final repository = AuthRemoteRepositoryImpl(apiClient, tokenStore);

        final result = await repository.restoreSavedSession();

        result.when(
          success: (session) => expect(session?.user.email, 'm@example.com'),
          failure: (failure) => fail(failure.message),
        );
        final preferences = await SharedPreferences.getInstance();
        expect(preferences.containsKey('auth.local_session'), isFalse);
        expect(preferences.containsKey('auth.local_accounts'), isFalse);
      },
    );

    test('verifyEmail posts the code without storing tokens', () async {
      final tokenStore = InMemoryTokenStore();
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'POST');
        expect(request.path, '/auth/verify-email');
        expect(request.data, {'email': 'm@example.com', 'code': '123456'});
        return _sessionPayload;
      });
      final repository = AuthRemoteRepositoryImpl(apiClient, tokenStore);

      final result = await repository.verifyEmail(
        email: 'm@example.com',
        code: '123456',
      );

      result.when(
        success: (session) {
          expect(session.user.email, 'm@example.com');
          expect(session.accessToken, isNull);
        },
        failure: (failure) => fail(failure.message),
      );
      expect(await tokenStore.read(), isNull);
    });

    test('logout posts stored refresh token and clears token store', () async {
      final tokenStore = InMemoryTokenStore();
      await tokenStore.save(
        StoredAuthTokens(
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: DateTime.now().add(const Duration(hours: 1)),
        ),
      );
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'POST');
        expect(request.path, '/auth/logout');
        expect(request.data, {'refreshToken': 'refresh-token'});
        return {'message': 'Logout successful.'};
      });
      final repository = AuthRemoteRepositoryImpl(apiClient, tokenStore);

      final result = await repository.logout();

      result.when(
        success: (loggedOut) => expect(loggedOut, isTrue),
        failure: (failure) => fail(failure.message),
      );
      expect(await tokenStore.read(), isNull);
    });
  });
}

final _sessionPayload = {
  'user': _userPayload,
  'accessToken': 'access-token',
  'refreshToken': 'refresh-token',
  'expiresIn': 3600,
};

const _userPayload = {
  'id': 'user-1',
  'email': 'm@example.com',
  'firstName': 'Mustafa',
  'lastName': 'Ali',
  'role': 'CUSTOMER',
};
