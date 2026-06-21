import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/errors/failure.dart';
import 'package:yalla_market/core/network/api_result.dart';
import 'package:yalla_market/core/routing/auth_guard.dart';
import 'package:yalla_market/core/session/session_expired_notifier.dart';
import 'package:yalla_market/features/auth/domain/entities/auth_session.dart';
import 'package:yalla_market/features/auth/domain/entities/auth_user.dart';
import 'package:yalla_market/features/auth/domain/repositories/auth_repository.dart';
import 'package:yalla_market/features/auth/domain/usecases/auth_usecases.dart';
import 'package:yalla_market/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:yalla_market/features/auth/presentation/cubit/auth_state.dart';

import '../../../../helpers/domain_fixtures.dart';

void main() {
  group('AuthCubit', () {
    setUp(() {
      AuthGuard.clearAuthentication();
    });

    test('restores an existing saved session', () async {
      final repository = _FakeAuthRepository(restoreResult: sampleSession);
      final cubit = AuthCubit(_authUseCases(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<AuthLoading>(), isA<AuthAuthenticated>()]),
      );

      final restored = await cubit.restoreSavedSession();

      expect(restored, isTrue);
      expect(
        (cubit.state as AuthAuthenticated).session.user.email,
        sampleUser.email,
      );
      await expectedStates;
      await cubit.close();
    });

    test('returns to initial when no saved session exists', () async {
      final repository = _FakeAuthRepository();
      final cubit = AuthCubit(_authUseCases(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<AuthLoading>(), isA<AuthInitial>()]),
      );

      final restored = await cubit.restoreSavedSession();

      expect(restored, isFalse);
      expect(cubit.state, isA<AuthInitial>());
      await expectedStates;
      await cubit.close();
    });

    test('emits authenticated state after login succeeds', () async {
      final repository = _FakeAuthRepository(loginResult: sampleSession);
      final cubit = AuthCubit(_authUseCases(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<AuthLoading>(), isA<AuthAuthenticated>()]),
      );

      await cubit.login(
        email: ' mustafa@example.com ',
        password: 'password',
        rememberMe: true,
      );

      expect(repository.lastLoginEmail, 'mustafa@example.com');
      expect(repository.lastRememberMe, isTrue);
      expect((cubit.state as AuthAuthenticated).session, sampleSession);
      await expectedStates;
      await cubit.close();
    });

    test('emits failure state after login fails', () async {
      final repository = _FakeAuthRepository(
        loginFailure: const UnauthorizedFailure('Invalid email or password.'),
      );
      final cubit = AuthCubit(_authUseCases(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<AuthLoading>(), isA<AuthFailure>()]),
      );

      await cubit.login(email: 'mustafa@example.com', password: 'wrong');

      expect(
        (cubit.state as AuthFailure).message,
        'Invalid email or password.',
      );
      await expectedStates;
      await cubit.close();
    });

    test('emits signup success without authenticating the user', () async {
      final repository = _FakeAuthRepository(loginResult: sampleSession);
      final cubit = AuthCubit(_authUseCases(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<AuthLoading>(), isA<AuthSignupSucceeded>()]),
      );

      await cubit.signup(
        firstName: 'Mustafa',
        lastName: 'Ali',
        email: ' mustafa@example.com ',
        phone: '+201000000000',
        password: 'Password123!',
      );

      expect((cubit.state as AuthSignupSucceeded).email, sampleUser.email);
      expect(AuthGuard.isAuthenticated, isFalse);
      await expectedStates;
      await cubit.close();
    });

    test('returns to login after verification completes', () async {
      final repository = _FakeAuthRepository(loginResult: sampleSession);
      final cubit = AuthCubit(_authUseCases(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([
          isA<AuthLoading>(),
          isA<AuthSignupSucceeded>(),
          isA<AuthEmailVerified>(),
        ]),
      );

      await cubit.signup(
        firstName: 'Mustafa',
        lastName: 'Ali',
        email: 'mustafa@example.com',
        phone: '+201000000000',
        password: 'Password123!',
      );
      final completed = await cubit.completeSignupVerification('123456');

      expect(completed, isTrue);
      expect(cubit.state, isA<AuthEmailVerified>());
      expect(AuthGuard.isAuthenticated, isFalse);
      await expectedStates;
      await cubit.close();
    });

    test(
      'verifies a pending signup without tokens before returning to login',
      () async {
        const pendingSession = AuthSession(user: sampleUser);
        final repository = _FakeAuthRepository(
          loginResult: pendingSession,
          verifyEmailResult: sampleSession,
        );
        final cubit = AuthCubit(_authUseCases(repository));
        final expectedStates = expectLater(
          cubit.stream,
          emitsInOrder([
            isA<AuthLoading>(),
            isA<AuthSignupSucceeded>(),
            isA<AuthLoading>(),
            isA<AuthEmailVerified>(),
          ]),
        );

        await cubit.signup(
          firstName: 'Mustafa',
          lastName: 'Ali',
          email: 'mustafa@example.com',
          phone: '+201000000000',
          password: 'Password123!',
        );
        final completed = await cubit.completeSignupVerification('123456');

        expect(completed, isTrue);
        expect(repository.lastVerificationCode, '123456');
        expect(cubit.state, isA<AuthEmailVerified>());
        expect(AuthGuard.isAuthenticated, isFalse);
        await expectedStates;
        await cubit.close();
      },
    );

    test('updates the current authenticated user profile', () async {
      final updatedUser = sampleUser.copyWith(firstName: 'Mona');
      final repository = _FakeAuthRepository(
        loginResult: sampleSession,
        updateProfileResult: updatedUser,
      );
      final cubit = AuthCubit(_authUseCases(repository));
      await cubit.login(email: sampleUser.email, password: 'password');

      final expectedStates = expectLater(
        cubit.stream,
        emits(isA<AuthAuthenticated>()),
      );
      final user = await cubit.updateProfile(firstName: 'Mona');

      expect(user?.firstName, 'Mona');
      final updatedSession = (cubit.state as AuthAuthenticated).session;
      expect(updatedSession.user.firstName, 'Mona');
      expect(updatedSession.accessToken, sampleSession.accessToken);
      expect(updatedSession.refreshToken, sampleSession.refreshToken);
      expect(updatedSession.expiresAt, sampleSession.expiresAt);
      await expectedStates;
      await cubit.close();
    });

    test('keeps auth guard active when profile update fails', () async {
      final repository = _FakeAuthRepository(
        loginResult: sampleSession,
        updateProfileFailure: const ValidationFailure('Email is already used.'),
      );
      final cubit = AuthCubit(_authUseCases(repository));
      await cubit.login(email: sampleUser.email, password: 'password');

      final user = await cubit.updateProfile(email: 'taken@example.com');

      expect(user, isNull);
      expect(cubit.state, isA<AuthFailure>());
      expect(AuthGuard.isAuthenticated, isTrue);
      await cubit.close();
    });

    test('emits session expired when the global session expires', () async {
      final notifier = SessionExpiredNotifier();
      final repository = _FakeAuthRepository(loginResult: sampleSession);
      final cubit = AuthCubit(
        _authUseCases(repository),
        sessionExpiredNotifier: notifier,
      );
      await cubit.login(email: sampleUser.email, password: 'password');
      expect(cubit.state, isA<AuthAuthenticated>());
      expect(AuthGuard.isAuthenticated, isTrue);

      final expectedStates = expectLater(
        cubit.stream,
        emits(isA<AuthSessionExpired>()),
      );
      notifier.notifyExpired();

      expect(cubit.state, isA<AuthSessionExpired>());
      expect(AuthGuard.isAuthenticated, isFalse);
      await expectedStates;
      await cubit.close();
    });
  });
}

AuthUseCases _authUseCases(AuthRepository repository) {
  return AuthUseCases(
    restoreSavedSession: RestoreSavedSessionUseCase(repository),
    login: LoginUseCase(repository),
    checkUsernameAvailability: CheckUsernameAvailabilityUseCase(repository),
    checkEmailRegistration: CheckEmailRegistrationUseCase(repository),
    checkPhoneRegistration: CheckPhoneRegistrationUseCase(repository),
    signup: SignupUseCase(repository),
    verifyEmail: VerifyEmailUseCase(repository),
    resendVerificationCode: ResendVerificationCodeUseCase(repository),
    requestPasswordReset: RequestPasswordResetUseCase(repository),
    resetPassword: ResetPasswordUseCase(repository),
    refreshProfile: RefreshProfileUseCase(repository),
    updateProfile: UpdateProfileUseCase(repository),
    logout: LogoutUseCase(repository),
    deleteAccountWithPassword: DeleteAccountWithPasswordUseCase(repository),
  );
}

class _FakeAuthRepository implements AuthRepository {
  _FakeAuthRepository({
    this.restoreResult,
    this.loginResult,
    this.loginFailure,
    this.verifyEmailResult,
    this.updateProfileResult,
    this.updateProfileFailure,
  });

  final AuthSession? restoreResult;
  final AuthSession? loginResult;
  final Failure? loginFailure;
  final AuthSession? verifyEmailResult;
  final AuthUser? updateProfileResult;
  final Failure? updateProfileFailure;
  String? lastLoginEmail;
  bool? lastRememberMe;
  String? lastVerificationCode;

  @override
  Future<ApiResult<AuthSession?>> restoreSavedSession() async {
    return ApiResult.success(restoreResult);
  }

  @override
  Future<ApiResult<AuthSession>> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    lastLoginEmail = email;
    lastRememberMe = rememberMe;

    if (loginFailure case final failure?) {
      return ApiResult.failure(failure);
    }

    return ApiResult.success(loginResult ?? sampleSession);
  }

  @override
  Future<ApiResult<bool>> isUsernameAvailable(String username) async {
    return const ApiResult.success(true);
  }

  @override
  Future<ApiResult<bool>> isEmailRegistered(String email) async {
    return const ApiResult.success(false);
  }

  @override
  Future<ApiResult<bool>> isPhoneRegistered(String phone) async {
    return const ApiResult.success(false);
  }

  @override
  Future<ApiResult<AuthSession>> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phone,
    String? username,
  }) async {
    return ApiResult.success(loginResult ?? sampleSession);
  }

  @override
  Future<ApiResult<AuthSession>> verifyEmail({
    required String email,
    required String code,
  }) async {
    lastVerificationCode = code;
    return ApiResult.success(verifyEmailResult ?? sampleSession);
  }

  @override
  Future<ApiResult<bool>> resendVerificationCode(String email) async {
    return const ApiResult.success(true);
  }

  @override
  Future<ApiResult<bool>> requestPasswordReset(String email) async {
    return const ApiResult.success(true);
  }

  @override
  Future<ApiResult<bool>> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    return const ApiResult.success(true);
  }

  @override
  Future<ApiResult<AuthUser>> me() async {
    return const ApiResult.success(sampleUser);
  }

  @override
  Future<ApiResult<AuthUser>> updateProfile({
    String? firstName,
    String? lastName,
    String? username,
    String? email,
    String? phone,
    String? gender,
    DateTime? birthDate,
  }) async {
    if (updateProfileFailure case final failure?) {
      return ApiResult.failure(failure);
    }

    return ApiResult.success(updateProfileResult ?? sampleUser);
  }

  @override
  Future<ApiResult<bool>> logout() async {
    return const ApiResult.success(true);
  }

  @override
  Future<ApiResult<bool>> deleteAccountWithPassword(String password) async {
    return const ApiResult.success(true);
  }
}
