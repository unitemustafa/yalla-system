import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import '../../../../core/routing/auth_guard.dart';
import '../../../../core/session/session_expired_notifier.dart';
import '../../../../core/storage/token_store.dart';
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
  Timer? _sessionExpiryTimer;

  @override
  void onChange(Change<AuthState> change) {
    super.onChange(change);
    if (change.nextState is AuthAuthenticated) {
      AuthGuard.setAuthenticated();
    } else if (change.nextState is AuthInitial ||
        change.nextState is AuthSessionExpired ||
        change.nextState is AuthSignupSucceeded ||
        change.nextState is AuthEmailVerified) {
      AuthGuard.clearAuthentication();
    }
  }

  bool get hasPendingSignup => _pendingSignupSession != null;

  @override
  Future<void> close() {
    _sessionExpiryTimer?.cancel();
    _sessionExpiredNotifier.removeListener(_handleSessionExpired);
    return super.close();
  }

  void _handleSessionExpired() {
    _sessionExpiryTimer?.cancel();
    _pendingSignupSession = null;
    AuthGuard.clearAuthentication();
    if (!isClosed && state is! AuthSessionExpired) {
      emit(const AuthSessionExpired());
    }
  }

  void _scheduleSessionExpiry(Duration duration) {
    _sessionExpiryTimer?.cancel();
    _sessionExpiryTimer = Timer(duration, () async {
      await _authUseCases.logout();
      if (!isClosed) _handleSessionExpired();
    });
  }

  /// Hydrates auth state from an already-resolved session (e.g. from SplashCubit).
  void hydrate(AuthSession session) {
    _pendingSignupSession = null;
    _sessionExpiryTimer?.cancel();
    emit(AuthAuthenticated(session));
  }

  Future<bool> restoreSavedSession() async {
    if (state is AuthLoading) return false;

    _pendingSignupSession = null;
    _sessionExpiryTimer?.cancel();
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
        _scheduleSessionExpiry(
          rememberMe
              ? StoredAuthTokens.rememberedLifetime
              : StoredAuthTokens.sessionOnlyLifetime,
        );
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
      failure: (_) => false,
    );
  }

  Future<bool> isEmailRegistered(String email) async {
    final result = await _authUseCases.checkEmailRegistration(email.trim());
    return result.when(
      success: (isRegistered) => isRegistered,
      failure: (_) => false,
    );
  }

  Future<bool> isEmailAvailable(String email) async {
    final result = await _authUseCases.checkEmailRegistration(email.trim());
    return result.when(
      success: (isRegistered) => !isRegistered,
      failure: (_) => false,
    );
  }

  Future<bool> isPhoneAvailable(String phone) async {
    final result = await _authUseCases.checkPhoneRegistration(phone.trim());
    return result.when(
      success: (isRegistered) => !isRegistered,
      failure: (_) => false,
    );
  }

  Future<void> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? username,
    String? phone,
  }) async {
    if (state is AuthLoading) return;

    _pendingSignupSession = null;
    _sessionExpiryTimer?.cancel();
    emit(const AuthLoading());

    final result = await _authUseCases.signup(
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password,
      username: username?.trim(),
      phone: phone?.trim(),
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
      emit(AuthEmailVerified(session.user.email));
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
        emit(AuthEmailVerified(verifiedSession.user.email));
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

  Future<void> logout() async {
    _pendingSignupSession = null;
    _sessionExpiryTimer?.cancel();
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

  Future<bool> deleteAccountWithPassword(String password) {
    return _deleteAccount(
      () => _authUseCases.deleteAccountWithPassword(password),
    );
  }

  Future<AuthUser?> refreshProfile() async {
    if (state is! AuthAuthenticated) return null;

    final result = await _authUseCases.refreshProfile();
    return result.when(
      success: (user) {
        emit(AuthAuthenticated(AuthSession(user: user)));
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
        emit(AuthAuthenticated(AuthSession(user: user)));
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
