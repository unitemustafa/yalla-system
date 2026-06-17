import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:yalla_market/core/errors/failure.dart';
import 'package:yalla_market/features/auth/data/repositories/auth_repository_impl.dart';

void main() {
  group('AuthRepositoryImpl', () {
    late AuthRepositoryImpl repository;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      repository = AuthRepositoryImpl();
    });

    test('rejects invalid login credentials', () async {
      final result = await repository.login(
        email: 'm@example.com',
        password: 'wrong-password',
      );

      result.when(
        success: (_) => fail('Login should not succeed.'),
        failure: (failure) {
          expect(failure, isA<UnauthorizedFailure>());
          expect(failure.message, 'Invalid email or password.');
        },
      );
    });

    test('allows the seeded demo account with the right password', () async {
      final result = await repository.login(
        email: 'm@example.com',
        password: 'Password123!',
      );

      result.when(
        success: (session) {
          expect(session.user.email, 'm@example.com');
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test(
      'allows the seeded market account with the requested credentials',
      () async {
        final result = await repository.login(
          email: 'market@admin.com',
          password: '01266666610',
        );

        result.when(
          success: (session) {
            expect(session.user.email, 'market@admin.com');
            expect(session.user.phone, '01266666610');
          },
          failure: (failure) => fail(failure.message),
        );
      },
    );

    test('persists signed up users and validates their password', () async {
      await repository.signup(
        firstName: 'Mustafa',
        lastName: 'Ali',
        email: 'mustafa@example.com',
        password: 'Secret123!',
      );
      await repository.logout();

      final failedLogin = await repository.login(
        email: 'mustafa@example.com',
        password: 'wrong-password',
      );
      failedLogin.when(
        success: (_) => fail('Login should not succeed.'),
        failure: (failure) => expect(failure, isA<UnauthorizedFailure>()),
      );

      final successfulLogin = await repository.login(
        email: 'mustafa@example.com',
        password: 'Secret123!',
      );
      successfulLogin.when(
        success: (session) {
          expect(session.user.firstName, 'Mustafa');
          expect(session.user.lastName, 'Ali');
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('reports registered email and phone numbers', () async {
      await repository.signup(
        firstName: 'Mustafa',
        lastName: 'Ali',
        email: 'mustafa@example.com',
        phone: '+201000000000',
        password: 'Secret123!',
      );

      final emailResult = await repository.isEmailRegistered(
        'MUSTAFA@example.com',
      );
      emailResult.when(
        success: (isRegistered) => expect(isRegistered, isTrue),
        failure: (failure) => fail(failure.message),
      );

      final phoneResult = await repository.isPhoneRegistered(
        '+20 100 000 0000',
      );
      phoneResult.when(
        success: (isRegistered) => expect(isRegistered, isTrue),
        failure: (failure) => fail(failure.message),
      );
    });

    test('rejects duplicate phone numbers', () async {
      await repository.signup(
        firstName: 'Mustafa',
        lastName: 'Ali',
        email: 'mustafa@example.com',
        phone: '+201000000000',
        password: 'Secret123!',
      );

      final result = await repository.signup(
        firstName: 'Mona',
        lastName: 'Ali',
        email: 'mona@example.com',
        phone: '+20 100 000 0000',
        password: 'Secret123!',
      );

      result.when(
        success: (_) => fail('Signup should not allow duplicate phones.'),
        failure: (failure) {
          expect(failure, isA<ValidationFailure>());
          expect(failure.message, 'Phone number is already registered.');
        },
      );
    });
  });
}
