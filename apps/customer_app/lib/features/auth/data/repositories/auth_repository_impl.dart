import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  static const String _sessionKey = 'auth.local_session';
  static const String _accountsKey = 'auth.local_accounts';
  static const String _demoEmail = 'm@example.com';
  static const String _demoPassword = 'Password123!';
  static const Set<String> _reservedUsernames = {
    'admin',
    'support',
    'yallamarket',
    'taken_user',
  };

  AuthSession? _session;

  @override
  Future<ApiResult<AuthSession?>> restoreSavedSession() {
    return _guard(_restoreSavedSession, 'Could not restore your session.');
  }

  @override
  Future<ApiResult<AuthSession>> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) {
    return _guard(
      () => _login(email: email, password: password, rememberMe: rememberMe),
      'Could not sign you in.',
    );
  }

  @override
  Future<ApiResult<bool>> isUsernameAvailable(String username) {
    return _guard(
      () => _isUsernameAvailable(username),
      'Could not check this username.',
    );
  }

  @override
  Future<ApiResult<bool>> isEmailRegistered(String email) {
    return _guard(
      () => _isEmailRegistered(email),
      'Could not check this email.',
    );
  }

  @override
  Future<ApiResult<bool>> isPhoneRegistered(String phone) {
    return _guard(
      () => _isPhoneRegistered(phone),
      'Could not check this phone number.',
    );
  }

  @override
  Future<ApiResult<AuthSession>> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? username,
    String? phone,
  }) {
    return _guard(
      () => _signup(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        username: username,
        phone: phone,
      ),
      'Could not create your account.',
    );
  }

  @override
  Future<ApiResult<AuthSession>> verifyEmail({
    required String email,
    required String code,
  }) {
    return _guard(
      () => _verifyEmail(email: email, code: code),
      'Could not verify your email.',
    );
  }

  @override
  Future<ApiResult<bool>> resendVerificationCode(String email) {
    return _guard(
      () => _resendVerificationCode(email),
      'Could not send a new verification code.',
    );
  }

  @override
  Future<ApiResult<AuthUser>> me() {
    return _guard(_me, 'Could not load your profile.');
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
  }) {
    return _guard(
      () => _updateProfile(
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        phone: phone,
        gender: gender,
        birthDate: birthDate,
      ),
      'Could not update your profile.',
    );
  }

  @override
  Future<ApiResult<bool>> logout() {
    return _guard(_logout, 'Could not sign you out.');
  }

  @override
  Future<ApiResult<bool>> deleteAccountWithPassword(String password) {
    return _guard(
      () => _deleteAccountWithPassword(password),
      'Could not delete your account.',
    );
  }

  Future<ApiResult<T>> _guard<T>(
    Future<T> Function() action,
    String fallbackMessage,
  ) async {
    try {
      return ApiResult.success(await action());
    } catch (error) {
      return ApiResult.failure(_failureFrom(error, fallbackMessage));
    }
  }

  Failure _failureFrom(Object error, String fallbackMessage) {
    if (error is _AuthRepositoryException) return error.failure;
    if (error is FormatException) {
      return ValidationFailure(error.message);
    }
    if (error is ArgumentError || error is StateError) {
      final message = error.toString().replaceFirst(RegExp(r'^[^:]+:\s*'), '');
      return ValidationFailure(message);
    }

    return UnknownFailure(fallbackMessage);
  }

  Future<AuthSession?> _restoreSavedSession() async {
    if (_session != null) return _session;

    final preferences = await SharedPreferences.getInstance();
    final rawSession = preferences.getString(_sessionKey);
    if (rawSession == null || rawSession.trim().isEmpty) return null;

    final decoded = jsonDecode(rawSession) as Map<String, dynamic>;
    final savedUser = _userFromJson(decoded);
    final account = (await _loadAccounts())._byUserId(savedUser.id);
    if (account == null) {
      await _clearSession();
      return null;
    }

    _session = AuthSession(user: account.user);
    return _session;
  }

  Future<AuthSession> _login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    final normalizedEmail = _normalizeEmail(email);
    if (normalizedEmail.isEmpty || password.isEmpty) {
      throw const _AuthRepositoryException(
        ValidationFailure('Email and password are required.'),
      );
    }

    final account = (await _loadAccounts())._byEmail(normalizedEmail);
    if (account == null ||
        account.passwordDigest != _passwordDigest(normalizedEmail, password)) {
      throw const _AuthRepositoryException(
        UnauthorizedFailure('Invalid email or password.'),
      );
    }

    return _startSession(account.user, rememberSession: rememberMe);
  }

  Future<bool> _isUsernameAvailable(String username) async {
    final normalized = _normalizeUsername(username);
    if (normalized.isEmpty) return true;
    if (_reservedUsernames.contains(normalized)) return false;

    final currentUserId = _session?.user.id;
    return !(await _loadAccounts()).any(
      (account) =>
          account.user.id != currentUserId &&
          _normalizeUsername(account.user.username ?? '') == normalized,
    );
  }

  Future<bool> _isEmailRegistered(String email) async {
    final normalized = _normalizeEmail(email);
    if (normalized.isEmpty) return false;

    return (await _loadAccounts())._byEmail(normalized) != null;
  }

  Future<bool> _isPhoneRegistered(String phone) async {
    final normalized = _normalizePhone(phone);
    if (normalized.isEmpty) return false;

    return (await _loadAccounts()).any(
      (account) => _normalizePhone(account.user.phone ?? '') == normalized,
    );
  }

  Future<AuthSession> _signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? username,
    String? phone,
  }) async {
    final normalizedEmail = _normalizeEmail(email);
    final normalizedUsername = _normalizeUsername(username ?? '');
    final cleanFirstName = firstName.trim();
    final cleanLastName = lastName.trim();

    if (cleanFirstName.isEmpty ||
        cleanLastName.isEmpty ||
        normalizedEmail.isEmpty ||
        password.isEmpty) {
      throw const _AuthRepositoryException(
        ValidationFailure('Name, email, and password are required.'),
      );
    }

    final accounts = await _loadAccounts();
    if (accounts._byEmail(normalizedEmail) != null) {
      throw const _AuthRepositoryException(
        ValidationFailure('Email is already registered.'),
      );
    }

    if (phone != null &&
        _normalizePhone(phone).isNotEmpty &&
        await _isPhoneRegistered(phone)) {
      throw const _AuthRepositoryException(
        ValidationFailure('Phone number is already registered.'),
      );
    }

    if (normalizedUsername.isNotEmpty &&
        (!await _isUsernameAvailable(normalizedUsername))) {
      throw const _AuthRepositoryException(
        ValidationFailure('Username is not available.'),
      );
    }

    final user = AuthUser(
      id: _localId(normalizedEmail),
      email: normalizedEmail,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      username: normalizedUsername.isEmpty ? null : normalizedUsername,
      phone: phone?.trim().isEmpty ?? true ? null : phone?.trim(),
      role: 'CUSTOMER',
    );

    await _saveAccounts([
      ...accounts,
      _LocalAuthAccount(
        user: user,
        passwordDigest: _passwordDigest(normalizedEmail, password),
      ),
    ]);
    return _startSession(user, rememberSession: false);
  }

  Future<AuthSession> _verifyEmail({
    required String email,
    required String code,
  }) async {
    final normalizedEmail = _normalizeEmail(email);
    final normalizedCode = code.trim();
    if (normalizedEmail.isEmpty ||
        !RegExp(r'^\d{6}$').hasMatch(normalizedCode)) {
      throw const _AuthRepositoryException(
        ValidationFailure('Enter the 6-digit verification code.'),
      );
    }

    final currentSession = _session;
    if (currentSession != null &&
        _normalizeEmail(currentSession.user.email) == normalizedEmail) {
      return currentSession;
    }

    final account = (await _loadAccounts())._byEmail(normalizedEmail);
    if (account == null) {
      throw const _AuthRepositoryException(
        UnauthorizedFailure('No local user session.'),
      );
    }

    return _startSession(account.user, rememberSession: false);
  }

  Future<bool> _resendVerificationCode(String email) async {
    if (_normalizeEmail(email).isEmpty) {
      throw const _AuthRepositoryException(
        ValidationFailure('Email is required.'),
      );
    }
    return true;
  }

  Future<AuthUser> _me() async {
    final session = _session ?? await _restoreSavedSession();
    if (session == null) {
      throw const _AuthRepositoryException(
        UnauthorizedFailure('No local user session.'),
      );
    }

    return session.user;
  }

  Future<AuthUser> _updateProfile({
    String? firstName,
    String? lastName,
    String? username,
    String? email,
    String? phone,
    String? gender,
    DateTime? birthDate,
  }) async {
    final currentUser = await _me();
    final accounts = await _loadAccounts();
    final currentIndex = accounts.indexWhere(
      (account) => account.user.id == currentUser.id,
    );
    if (currentIndex < 0) {
      throw const _AuthRepositoryException(
        UnauthorizedFailure('No local user session.'),
      );
    }

    final normalizedEmail = email == null ? null : _normalizeEmail(email);
    final normalizedUsername = username == null
        ? null
        : _normalizeUsername(username);

    if (normalizedEmail != null &&
        normalizedEmail != currentUser.email &&
        accounts._byEmail(normalizedEmail) != null) {
      throw const _AuthRepositoryException(
        ValidationFailure('Email is already registered.'),
      );
    }

    if (phone != null) {
      final normalizedPhone = _normalizePhone(phone);
      final currentPhone = _normalizePhone(currentUser.phone ?? '');
      final isUsedByAnotherAccount =
          normalizedPhone.isNotEmpty &&
          normalizedPhone != currentPhone &&
          accounts.any(
            (account) =>
                account.user.id != currentUser.id &&
                _normalizePhone(account.user.phone ?? '') == normalizedPhone,
          );

      if (isUsedByAnotherAccount) {
        throw const _AuthRepositoryException(
          ValidationFailure('Phone number is already registered.'),
        );
      }
    }

    if (normalizedUsername != null &&
        normalizedUsername != _normalizeUsername(currentUser.username ?? '') &&
        (!await _isUsernameAvailable(normalizedUsername))) {
      throw const _AuthRepositoryException(
        ValidationFailure('Username is not available.'),
      );
    }

    final usernameChanged =
        normalizedUsername != null &&
        normalizedUsername != currentUser.username;
    final updatedUser = currentUser.copyWith(
      email: normalizedEmail,
      firstName: firstName?.trim().isEmpty ?? true ? null : firstName?.trim(),
      lastName: lastName?.trim().isEmpty ?? true ? null : lastName?.trim(),
      username: normalizedUsername,
      phone: phone?.trim().isEmpty ?? true ? null : phone?.trim(),
      gender: gender?.trim().isEmpty ?? true ? null : gender?.trim(),
      birthDate: birthDate,
      usernameChangedAt: usernameChanged
          ? DateTime.now()
          : currentUser.usernameChangedAt,
    );

    final updatedAccounts = [...accounts];
    updatedAccounts[currentIndex] = accounts[currentIndex].copyWith(
      user: updatedUser,
      passwordDigest: normalizedEmail == null
          ? null
          : _rekeyPasswordDigest(
              oldEmail: currentUser.email,
              newEmail: normalizedEmail,
              digest: accounts[currentIndex].passwordDigest,
            ),
    );
    await _saveAccounts(updatedAccounts);

    final updatedSession = AuthSession(user: updatedUser);
    _session = updatedSession;
    await _saveSession(updatedSession);
    return updatedUser;
  }

  Future<bool> _logout() async {
    await _clearSession();
    return true;
  }

  Future<bool> _deleteAccountWithPassword(String password) async {
    final currentUser = await _me();
    final accounts = await _loadAccounts();
    final account = accounts._byUserId(currentUser.id);
    if (account == null ||
        account.passwordDigest !=
            _passwordDigest(currentUser.email, password)) {
      throw const _AuthRepositoryException(
        UnauthorizedFailure('Invalid email or password.'),
      );
    }

    await _saveAccounts(
      accounts.where((account) => account.user.id != currentUser.id).toList(),
    );
    await _clearSession();
    return true;
  }

  Future<AuthSession> _startSession(
    AuthUser user, {
    required bool rememberSession,
  }) async {
    final session = AuthSession(user: user);
    _session = session;

    if (rememberSession) {
      await _saveSession(session);
    } else {
      final preferences = await SharedPreferences.getInstance();
      await preferences.remove(_sessionKey);
    }

    return session;
  }

  Future<List<_LocalAuthAccount>> _loadAccounts() async {
    final preferences = await SharedPreferences.getInstance();
    final rawAccounts = preferences.getString(_accountsKey);
    if (rawAccounts == null || rawAccounts.trim().isEmpty) {
      return [_seedAccount()];
    }

    final decoded = jsonDecode(rawAccounts) as List<dynamic>;
    final accounts = decoded
        .whereType<Map<String, dynamic>>()
        .map(_LocalAuthAccount.fromJson)
        .toList(growable: true);

    return accounts;
  }

  Future<void> _saveAccounts(List<_LocalAuthAccount> accounts) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(
      _accountsKey,
      jsonEncode(accounts.map((account) => account.toJson()).toList()),
    );
  }

  Future<void> _saveSession(AuthSession session) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(
      _sessionKey,
      jsonEncode(_userToJson(session.user)),
    );
  }

  Future<void> _clearSession() async {
    _session = null;
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_sessionKey);
  }

  _LocalAuthAccount _seedAccount() {
    const user = AuthUser(
      id: 'local-demo-shopper',
      email: _demoEmail,
      firstName: 'Yalla',
      lastName: 'Buyer',
      username: 'demo_buyer',
      role: 'CUSTOMER',
    );
    return _LocalAuthAccount(
      user: user,
      passwordDigest: _passwordDigest(_demoEmail, _demoPassword),
    );
  }

  String _passwordDigest(String email, String password) {
    final seed = password;
    var hash = 2166136261;
    for (final unit in seed.codeUnits) {
      hash ^= unit;
      hash = (hash * 16777619) & 0xFFFFFFFF;
    }
    return hash.toRadixString(16).padLeft(8, '0');
  }

  String _rekeyPasswordDigest({
    required String oldEmail,
    required String newEmail,
    required String digest,
  }) {
    // Without the original plaintext password we cannot re-derive the digest
    // under the new key. Preserve the existing digest; a real backend would
    // invalidate the session and issue a fresh token on email change.
    return digest;
  }

  String _normalizeEmail(String value) => value.trim().toLowerCase();

  String _normalizeUsername(String value) => value.trim().toLowerCase();

  String _normalizePhone(String value) => value.replaceAll(RegExp(r'\D'), '');

  String _localId(String seed) {
    final normalized = seed
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    return 'local-${normalized.isEmpty ? 'user' : normalized}';
  }

  Map<String, Object?> _userToJson(AuthUser user) => _authUserToJson(user);

  AuthUser _userFromJson(Map<String, dynamic> json) => _authUserFromJson(json);
}

class _AuthRepositoryException implements Exception {
  const _AuthRepositoryException(this.failure);

  final Failure failure;
}

class _LocalAuthAccount {
  const _LocalAuthAccount({required this.user, required this.passwordDigest});

  final AuthUser user;
  final String passwordDigest;

  _LocalAuthAccount copyWith({AuthUser? user, String? passwordDigest}) {
    return _LocalAuthAccount(
      user: user ?? this.user,
      passwordDigest: passwordDigest ?? this.passwordDigest,
    );
  }

  factory _LocalAuthAccount.fromJson(Map<String, dynamic> json) {
    return _LocalAuthAccount(
      user: _authUserFromJson(json['user'] as Map<String, dynamic>),
      passwordDigest: json['passwordDigest'] as String,
    );
  }

  Map<String, Object?> toJson() {
    return {'user': _authUserToJson(user), 'passwordDigest': passwordDigest};
  }
}

// Top-level helpers so _LocalAuthAccount.fromJson/toJson don't need to
// instantiate AuthRepositoryImpl just to reach a private JSON method.
Map<String, Object?> _authUserToJson(AuthUser user) {
  return {
    'id': user.id,
    'email': user.email,
    'firstName': user.firstName,
    'lastName': user.lastName,
    'role': user.role,
    'avatarUrl': user.avatarUrl,
    'hasPassword': user.hasPassword,
    'username': user.username,
    'phone': user.phone,
    'gender': user.gender,
    'birthDate': user.birthDate?.toIso8601String(),
    'usernameChangedAt': user.usernameChangedAt?.toIso8601String(),
  };
}

AuthUser _authUserFromJson(Map<String, dynamic> json) {
  return AuthUser(
    id: json['id'] as String,
    email: json['email'] as String,
    firstName: json['firstName'] as String,
    lastName: json['lastName'] as String,
    role: json['role'] as String? ?? 'CUSTOMER',
    avatarUrl: json['avatarUrl'] as String?,
    hasPassword: json['hasPassword'] as bool? ?? true,
    username: json['username'] as String?,
    phone: json['phone'] as String?,
    gender: json['gender'] as String?,
    birthDate: _dateFromString(json['birthDate']),
    usernameChangedAt: _dateFromString(json['usernameChangedAt']),
  );
}

DateTime? _dateFromString(Object? value) {
  if (value is! String || value.trim().isEmpty) return null;
  return DateTime.tryParse(value);
}

extension _LocalAuthAccountsLookup on List<_LocalAuthAccount> {
  _LocalAuthAccount? _byEmail(String email) {
    final normalized = email.trim().toLowerCase();
    for (final account in this) {
      if (account.user.email.trim().toLowerCase() == normalized) {
        return account;
      }
    }
    return null;
  }

  _LocalAuthAccount? _byUserId(String id) {
    for (final account in this) {
      if (account.user.id == id) return account;
    }
    return null;
  }
}
