import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import '../../../../core/routing/auth_guard.dart';
import '../../../../core/session/session_expired_notifier.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/usecases/auth_usecases.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit(
    this._authUseCases, {
    SessionExpiredNotifier? sessionExpiredNotifier,
  }) : _sessionExpiredNotifier =
           sessionExpiredNotifier ?? SessionExpiredNotifier.instance,
       super(const AuthInitial()) {
    _sessionExpiredNotifier.addListener(_handleSessionExpired);
  }

  final AuthUseCases _authUseCases;
  final SessionExpiredNotifier _sessionExpiredNotifier;
  AuthSession? _pendingSignupSession;

  @override
  void onChange(Change<AuthState> change) {
    super.onChange(change);
    if (change.nextState is AuthAuthenticated) {
      AuthGuard.setAuthenticated();
    } else if (change.nextState is AuthInitial ||
        change.nextState is AuthSignupSucceeded ||
        change.nextState is AuthPasswordResetSucceeded ||
        change.nextState is AuthSessionExpired ||
        change.nextState is AuthEmailVerified) {
      AuthGuard.clearAuthentication();
    }
  }

  bool get hasPendingSignup => _pendingSignupSession != null;

  @override
  Future<void> close() {
    _sessionExpiredNotifier.removeListener(_handleSessionExpired);
    return super.close();
  }

  void _handleSessionExpired() {
    _pendingSignupSession = null;
    AuthGuard.clearAuthentication();
    if (!isClosed) {
      emit(const AuthSessionExpired());
    }
  }

  /// Hydrates auth state from an already-resolved session (e.g. from SplashCubit).
  void hydrate(AuthSession session) {
    _pendingSignupSession = null;
    emit(AuthAuthenticated(session));
  }

  Future<bool> restoreSavedSession() async {
    if (state is AuthLoading) return false;

    _pendingSignupSession = null;
    emit(const AuthLoading());

    final result = await _authUseCases.restoreSavedSession();
    return result.when(
      success: (session) {
        if (session == null) {
          emit(const AuthInitial());
          return false;
        }

        emit(AuthAuthenticated(session));
        return true;
      },
      failure: (_) {
        emit(const AuthInitial());
        return false;
      },
    );
  }

  Future<void> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    if (state is AuthLoading) return;

    _pendingSignupSession = null;
    emit(const AuthLoading());

    final result = await _authUseCases.login(
      email: email.trim(),
      password: password,
      rememberMe: rememberMe,
    );
    result.when(
      success: (session) {
        emit(AuthAuthenticated(session));
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
      },
    );
  }

  Future<bool> isUsernameAvailable(String username) async {
    final result = await _authUseCases.checkUsernameAvailability(
      username.trim(),
    );
    return result.when(
      success: (isAvailable) => isAvailable,
      failure: (failure) => throw StateError(failure.message),
    );
  }

  Future<bool> isEmailRegistered(String email) async {
    final result = await _authUseCases.checkEmailRegistration(email.trim());
    return result.when(
      success: (isRegistered) => isRegistered,
      failure: (failure) => throw StateError(failure.message),
    );
  }

  Future<bool> isEmailAvailable(String email) async {
    final result = await _authUseCases.checkEmailRegistration(email.trim());
    return result.when(
      success: (isRegistered) => !isRegistered,
      failure: (failure) => throw StateError(failure.message),
    );
  }

  Future<bool> isPhoneAvailable(String phone) async {
    final result = await _authUseCases.checkPhoneRegistration(phone.trim());
    return result.when(
      success: (isRegistered) => !isRegistered,
      failure: (failure) => throw StateError(failure.message),
    );
  }

  Future<void> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phone,
    String? username,
  }) async {
    if (state is AuthLoading) return;

    _pendingSignupSession = null;
    emit(const AuthLoading());

    final result = await _authUseCases.signup(
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password,
      phone: phone.trim(),
      username: username?.trim(),
    );
    result.when(
      success: (session) {
        _pendingSignupSession = session;
        final createdEmail = session.user.email.trim();
        emit(
          AuthSignupSucceeded(
            createdEmail.isEmpty ? email.trim() : createdEmail,
          ),
        );
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
      },
    );
  }

  Future<bool> completeSignupVerification(String code) async {
    final session = _pendingSignupSession;
    if (session == null) return false;

    if (session.accessToken != null && session.refreshToken != null) {
      _pendingSignupSession = null;
      emit(AuthAuthenticated(session));
      return true;
    }

    emit(const AuthLoading());
    final result = await _authUseCases.verifyEmail(
      email: session.user.email,
      code: code.trim(),
    );
    return result.when(
      success: (verifiedSession) {
        _pendingSignupSession = null;
        emit(AuthAuthenticated(verifiedSession));
        return true;
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
        return false;
      },
    );
  }

  Future<bool> resendSignupVerificationCode() async {
    final session = _pendingSignupSession;
    if (session == null) return false;

    final result = await _authUseCases.resendVerificationCode(
      session.user.email,
    );
    return result.when(
      success: (sent) => sent,
      failure: (failure) {
        emit(AuthFailure(failure.message));
        return false;
      },
    );
  }

  Future<bool> requestPasswordReset(String email) async {
    if (state is AuthLoading) return false;

    emit(const AuthLoading());

    final result = await _authUseCases.requestPasswordReset(email.trim());
    return result.when(
      success: (sent) {
        emit(AuthPasswordResetRequested(email.trim()));
        return sent;
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
        return false;
      },
    );
  }

  Future<bool> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) async {
    if (state is AuthLoading) return false;

    emit(const AuthLoading());
    final result = await _authUseCases.resetPassword(
      email: email.trim(),
      code: code.trim(),
      password: password,
      passwordConfirmation: passwordConfirmation,
    );
    return result.when(
      success: (reset) {
        emit(const AuthPasswordResetSucceeded());
        return reset;
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
        return false;
      },
    );
  }

  Future<void> logout() async {
    _pendingSignupSession = null;
    final result = await _authUseCases.logout();
    result.when(
      success: (_) => emit(const AuthInitial()),
      failure: (_) {
        // Cannot show the old session without emitting — go to initial so
        // the UI is consistent. A snackbar is shown at the call site.
        emit(const AuthInitial());
      },
    );
  }

  Future<void> expireSession() async {
    if (state is AuthSessionExpired) return;

    _pendingSignupSession = null;
    AuthGuard.clearAuthentication();
    await _authUseCases.logout();
    if (!isClosed) {
      emit(const AuthSessionExpired());
    }
  }

  Future<bool> deleteAccountWithPassword(String password) {
    return _deleteAccount(
      () => _authUseCases.deleteAccountWithPassword(password),
    );
  }

  Future<AuthUser?> refreshProfile() async {
    final currentState = state;
    if (currentState is! AuthAuthenticated) return null;

    final result = await _authUseCases.refreshProfile();
    return result.when(
      success: (user) {
        emit(AuthAuthenticated(currentState.session.copyWith(user: user)));
        return user;
      },
      failure: (_) => null,
    );
  }

  Future<AuthUser?> updateProfile({
    String? firstName,
    String? lastName,
    String? username,
    String? email,
    String? phone,
    String? gender,
    DateTime? birthDate,
  }) async {
    final currentSession = state is AuthAuthenticated
        ? (state as AuthAuthenticated).session
        : null;
    final result = await _authUseCases.updateProfile(
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      phone: phone,
      gender: gender,
      birthDate: birthDate,
    );
    return result.when(
      success: (user) {
        emit(
          AuthAuthenticated(
            currentSession?.copyWith(user: user) ?? AuthSession(user: user),
          ),
        );
        return user;
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
        return null;
      },
    );
  }

  Future<AuthUser?> updateAvatar(Uint8List bytes) async {
    final currentSession = state is AuthAuthenticated
        ? (state as AuthAuthenticated).session
        : null;
    final result = await _authUseCases.updateAvatar(bytes);
    return result.when(
      success: (user) {
        emit(
          AuthAuthenticated(
            currentSession?.copyWith(user: user) ?? AuthSession(user: user),
          ),
        );
        return user;
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
        return null;
      },
    );
  }

  Future<bool> _deleteAccount(
    Future<ApiResult<bool>> Function() deleteAccount,
  ) async {
    if (state is AuthLoading) return false;

    emit(const AuthLoading());

    final result = await deleteAccount();
    return result.when(
      success: (_) {
        emit(const AuthInitial());
        return true;
      },
      failure: (failure) {
        emit(AuthFailure(failure.message));
        return false;
      },
    );
  }
}
