import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/errors/api_error_handler.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/storage/token_store.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRemoteRepositoryImpl implements AuthRepository {
  AuthRemoteRepositoryImpl(this._apiClient, this._tokenStore);

  static const _legacySessionKey = 'auth.local_session';
  static const _legacyAccountsKey = 'auth.local_accounts';

  final ApiClient _apiClient;
  final TokenStore _tokenStore;

  @override
  Future<ApiResult<AuthSession?>> restoreSavedSession() {
    return _guard(() async {
      await _clearLegacyLocalAuth();
      final tokens = await _tokenStore.read();
      if (tokens == null || tokens.isExpired) {
        await _tokenStore.clear();
        return null;
      }

      final user = await _loadMe();
      return AuthSession(
        user: user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      );
    });
  }

  @override
  Future<ApiResult<AuthSession>> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) {
    return _guard(() async {
      final payload = await _apiClient.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'identifier': email,
          'password': password,
          'rememberMe': rememberMe,
        },
      );
      return _sessionFromPayload(payload, persistTokens: rememberMe);
    });
  }

  @override
  Future<ApiResult<bool>> isUsernameAvailable(String username) {
    return _guard(() async {
      final payload = await _apiClient.get<Map<String, dynamic>>(
        '/auth/check-username',
        queryParameters: {'username': username},
      );
      return _availabilityFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<bool>> isEmailRegistered(String email) {
    return _guard(() async {
      final payload = await _apiClient.get<Map<String, dynamic>>(
        '/auth/check-email',
        queryParameters: {'email': email},
      );
      return _registrationFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<bool>> isPhoneRegistered(String phone) {
    return _guard(() async {
      final payload = await _apiClient.get<Map<String, dynamic>>(
        '/auth/check-phone',
        queryParameters: {'phone': phone},
      );
      return _registrationFromPayload(payload);
    });
  }

  @override
  Future<ApiResult<AuthSession>> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phone,
    String? username,
  }) {
    return _guard(() async {
      await _tokenStore.clear();
      final payload = await _apiClient.post<Map<String, dynamic>>(
        '/auth/signup',
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'username': username?.trim() ?? '',
          if (phone.trim().isNotEmpty) 'phone': phone,
        },
      );
      return _signupSessionFromPayload(
        payload,
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        phone: phone,
      );
    });
  }

  @override
  Future<ApiResult<AuthUser>> me() {
    return _guard(_loadMe);
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
    return _guard(() {
      return _apiClient
          .patch<Map<String, dynamic>>(
            '/auth/me',
            data: {
              'firstName': ?firstName,
              'lastName': ?lastName,
              'username': ?username,
              'email': ?email,
              'phone': ?phone,
              'gender': ?gender,
              'birthDate': ?birthDate?.toIso8601String(),
            },
          )
          .then(_userFromPayload);
    });
  }

  @override
  Future<ApiResult<bool>> logout() {
    return _guard(() async {
      final tokens = await _tokenStore.read();
      try {
        await _apiClient.post<Object?>(
          '/auth/logout',
          data: {
            if (tokens?.refreshToken.trim().isNotEmpty == true)
              'refreshToken': tokens!.refreshToken,
          },
        );
      } finally {
        await _tokenStore.clear();
      }
      return true;
    });
  }

  @override
  Future<ApiResult<bool>> deleteAccountWithPassword(String password) {
    return _guard(() async {
      await _apiClient.delete<Object?>(
        '/auth/me',
        data: {'password': password},
      );
      await _tokenStore.clear();
      return true;
    });
  }

  Future<AuthUser> _loadMe() async {
    final payload = await _apiClient.get<Map<String, dynamic>>('/auth/me');
    return _userFromPayload(payload);
  }

  Future<AuthSession> _sessionFromPayload(
    Map<String, dynamic> payload, {
    required bool persistTokens,
  }) async {
    final user = _userFromPayload(payload);
    final tokensPayload = _asJsonMap(payload['tokens']) ?? payload;
    final now = DateTime.now();
    final tokens = tokensFromApiPayload(tokensPayload).copyWith(
      isSessionOnly: !persistTokens,
      sessionExpiresAt: now.add(
        persistTokens
            ? StoredAuthTokens.rememberedLifetime
            : StoredAuthTokens.sessionOnlyLifetime,
      ),
    );
    await _tokenStore.save(tokens);
    return AuthSession(
      user: user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    );
  }

  Future<AuthSession> _signupSessionFromPayload(
    Map<String, dynamic> payload, {
    required String firstName,
    required String lastName,
    required String email,
    String? username,
    String? phone,
  }) async {
    final user = _signupUserFromPayload(
      payload,
      firstName: firstName,
      lastName: lastName,
      email: email,
      username: username,
      phone: phone,
    );
    final tokens = _optionalTokensFromPayload(payload);
    if (tokens != null) {
      await _tokenStore.save(tokens.copyWith(isSessionOnly: true));
    }

    return AuthSession(
      user: user,
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
      expiresAt: tokens?.expiresAt,
    );
  }

  @override
  Future<ApiResult<AuthSession>> verifyEmail({
    required String email,
    required String code,
  }) {
    return _guard(() async {
      final payload = await _apiClient.post<Map<String, dynamic>>(
        '/auth/verify-email',
        data: {'email': email, 'code': code},
      );
      return AuthSession(user: _userFromPayload(payload));
    });
  }

  @override
  Future<ApiResult<bool>> resendVerificationCode(String email) {
    return _guard(() async {
      final payload = await _apiClient.post<Object?>(
        '/auth/resend-verification',
        data: {'email': email},
      );
      return payload is bool ? payload : true;
    });
  }

  @override
  Future<ApiResult<bool>> requestPasswordReset(String email) {
    return _guard(() async {
      final payload = await _apiClient.post<Object?>(
        '/auth/forgot-password',
        data: {'email': email},
      );
      return payload is bool ? payload : true;
    });
  }

  @override
  Future<ApiResult<bool>> resetPassword({
    required String email,
    required String code,
    required String password,
    required String passwordConfirmation,
  }) {
    return _guard(() async {
      final payload = await _apiClient.post<Object?>(
        '/auth/reset-password',
        data: {
          'email': email,
          'otp': code,
          'password': password,
          'password_confirm': passwordConfirmation,
        },
      );
      return payload is bool ? payload : true;
    });
  }

  AuthUser _signupUserFromPayload(
    Map<String, dynamic> payload, {
    required String firstName,
    required String lastName,
    required String email,
    String? username,
    String? phone,
  }) {
    final rawUser = _asJsonMap(payload['user']);
    if (rawUser != null) return AuthUser.fromJson(rawUser);

    final fallbackEmail = _stringFromPayload(payload, 'email') ?? email;
    final normalizedEmail = fallbackEmail.trim().toLowerCase();
    return AuthUser(
      id:
          _stringFromPayload(payload, 'id') ??
          _signupFallbackId(normalizedEmail),
      email: normalizedEmail,
      firstName:
          _stringFromPayload(payload, 'firstName') ??
          _stringFromPayload(payload, 'first_name') ??
          firstName.trim(),
      lastName:
          _stringFromPayload(payload, 'lastName') ??
          _stringFromPayload(payload, 'last_name') ??
          lastName.trim(),
      role: _stringFromPayload(payload, 'role') ?? 'CUSTOMER',
      username: _stringFromPayload(payload, 'username') ?? username?.trim(),
      phone: _stringFromPayload(payload, 'phone') ?? phone?.trim(),
    );
  }

  AuthUser _userFromPayload(Map<String, dynamic> payload) {
    final rawUser = payload['user'] ?? payload;
    return AuthUser.fromJson(_asJsonMap(rawUser) ?? const <String, dynamic>{});
  }

  StoredAuthTokens? _optionalTokensFromPayload(Map<String, dynamic> payload) {
    final tokensPayload = _asJsonMap(payload['tokens']) ?? payload;
    final hasAccessToken =
        tokensPayload['accessToken'] != null ||
        tokensPayload['access_token'] != null;
    final hasRefreshToken =
        tokensPayload['refreshToken'] != null ||
        tokensPayload['refresh_token'] != null;

    if (!hasAccessToken || !hasRefreshToken) return null;

    try {
      return tokensFromApiPayload(tokensPayload);
    } catch (_) {
      return null;
    }
  }

  Map<String, dynamic>? _asJsonMap(Object? value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) return Map<String, dynamic>.from(value);
    return null;
  }

  String? _stringFromPayload(Map<String, dynamic> payload, String key) {
    final value = payload[key];
    if (value is String && value.trim().isNotEmpty) return value.trim();
    return null;
  }

  String _signupFallbackId(String email) {
    final normalized = email
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    return 'pending-${normalized.isEmpty ? 'user' : normalized}';
  }

  bool _availabilityFromPayload(Map<String, dynamic> payload) {
    final value = payload['available'] ?? payload['isAvailable'];
    if (value is bool) return value;
    final registered = payload['registered'] ?? payload['isRegistered'];
    if (registered is bool) return !registered;
    return false;
  }

  bool _registrationFromPayload(Map<String, dynamic> payload) {
    final value = payload['registered'] ?? payload['isRegistered'];
    if (value is bool) return value;
    final available = payload['available'] ?? payload['isAvailable'];
    if (available is bool) return !available;
    return false;
  }

  Future<ApiResult<T>> _guard<T>(Future<T> Function() action) async {
    try {
      return ApiResult.success(await action());
    } on DioException catch (error) {
      return ApiResult.failure(ApiErrorHandler.handle(error));
    } on Failure catch (failure) {
      return ApiResult.failure(failure);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not complete the request.'),
      );
    }
  }

  Future<void> _clearLegacyLocalAuth() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_legacySessionKey);
    await preferences.remove(_legacyAccountsKey);
  }
}
