import '../../domain/entities/auth_session.dart';

sealed class AuthState {
  const AuthState();
}

final class AuthInitial extends AuthState {
  const AuthInitial();
}

final class AuthSessionExpired extends AuthState {
  const AuthSessionExpired([
    this.message =
        'Your session has expired. Please sign in again. To keep your session longer, turn on Remember Me when signing in.',
  ]);

  final String message;
}

final class AuthLoading extends AuthState {
  const AuthLoading();
}

final class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.session);

  final AuthSession session;
}

final class AuthSignupSucceeded extends AuthState {
  const AuthSignupSucceeded(this.email);

  final String email;
}

final class AuthPasswordResetRequested extends AuthState {
  const AuthPasswordResetRequested(this.email);

  final String email;
}

final class AuthPasswordResetSucceeded extends AuthState {
  const AuthPasswordResetSucceeded();
}

final class AuthEmailVerified extends AuthState {
  const AuthEmailVerified();
}

final class AuthFailure extends AuthState {
  const AuthFailure(this.message);

  final String message;
}
