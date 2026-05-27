import '../../domain/entities/auth_session.dart';

sealed class AuthState {
  const AuthState();
}

final class AuthInitial extends AuthState {
  const AuthInitial();
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

final class AuthFailure extends AuthState {
  const AuthFailure(this.message);

  final String message;
}
