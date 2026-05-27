/// Lightweight in-memory auth flag used for synchronous route guards.
///
/// Updated by [AuthCubit] via [onChange] whenever auth state changes,
/// so [AppRouter] can perform a synchronous check without async storage calls.
class AuthGuard {
  AuthGuard._();

  static bool _isAuthenticated = false;

  static bool get isAuthenticated => _isAuthenticated;

  static void setAuthenticated() => _isAuthenticated = true;

  static void clearAuthentication() => _isAuthenticated = false;
}
