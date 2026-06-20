import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class CourierUser {
  const CourierUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.role,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String role;

  String get name =>
      [firstName, lastName].where((part) => part.trim().isNotEmpty).join(' ');

  factory CourierUser.fromJson(Map<String, dynamic> json) {
    return CourierUser(
      id: '${json['id'] ?? ''}',
      firstName: '${json['first_name'] ?? json['firstName'] ?? ''}',
      lastName: '${json['last_name'] ?? json['lastName'] ?? ''}',
      email: '${json['email'] ?? ''}',
      phone: '${json['phone'] ?? ''}',
      role: '${json['role'] ?? ''}',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'first_name': firstName,
    'last_name': lastName,
    'email': email,
    'phone': phone,
    'role': role,
  };
}

class CourierSession {
  const CourierSession({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  final CourierUser user;
  final String accessToken;
  final String refreshToken;

  factory CourierSession.fromJson(Map<String, dynamic> json) {
    return CourierSession(
      user: CourierUser.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'user': user.toJson(),
    'accessToken': accessToken,
    'refreshToken': refreshToken,
  };

  CourierSession copyWith({String? accessToken, String? refreshToken}) {
    return CourierSession(
      user: user,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }
}

class CourierAuthException implements Exception {
  const CourierAuthException(this.message);

  final String message;

  @override
  String toString() => message;
}

class CourierAuthService {
  CourierAuthService({
    http.Client? client,
    FlutterSecureStorage? storage,
    String? apiBaseUrl,
  }) : _client = client ?? http.Client(),
       _storage = storage ?? const FlutterSecureStorage(),
       _apiBaseUrl = (apiBaseUrl ?? _configuredApiBaseUrl).replaceAll(
         RegExp(r'/+$'),
         '',
       );

  static final CourierAuthService instance = CourierAuthService();
  static const _storageKey = 'yalla_home.courier_session.v1';
  static const _configuredApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8000/api/v1',
  );

  final http.Client _client;
  final FlutterSecureStorage _storage;
  final String _apiBaseUrl;
  CourierSession? _session;

  CourierSession? get currentSession => _session;

  Future<CourierSession> login({
    required String identifier,
    required String password,
    required bool rememberMe,
  }) async {
    final response = await _post(
      '/auth/courier-login',
      body: {
        'identifier': identifier.trim(),
        'password': password,
        'rememberMe': rememberMe,
      },
    );
    final data = _decodeObject(response);

    if (response.statusCode != 200) {
      throw CourierAuthException(_errorMessage(data, response.statusCode));
    }

    try {
      final session = CourierSession.fromJson(data);
      if (session.user.role != 'representative') {
        throw const CourierAuthException('هذا الحساب ليس حساب مندوب توصيل.');
      }
      _session = session;
      if (rememberMe) {
        await _storage.write(
          key: _storageKey,
          value: jsonEncode(session.toJson()),
        );
      } else {
        await _storage.delete(key: _storageKey);
      }
      return session;
    } on CourierAuthException {
      rethrow;
    } catch (_) {
      throw const CourierAuthException('استجابة تسجيل الدخول غير مكتملة.');
    }
  }

  Future<CourierSession?> restoreSession() async {
    if (_session case final session?) return session;

    try {
      final stored = await _storage.read(key: _storageKey);
      if (stored == null || stored.trim().isEmpty) return null;
      var session = CourierSession.fromJson(
        jsonDecode(stored) as Map<String, dynamic>,
      );

      final profileResponse = await _get(
        '/auth/me',
        accessToken: session.accessToken,
      );
      if (profileResponse.statusCode == 200) {
        _session = session;
        return session;
      }

      final refreshResponse = await _post(
        '/auth/refresh',
        body: {'refreshToken': session.refreshToken},
      );
      final refreshData = _decodeObject(refreshResponse);
      if (refreshResponse.statusCode != 200) {
        await clearSession();
        return null;
      }

      session = session.copyWith(
        accessToken: refreshData['accessToken'] as String?,
        refreshToken: refreshData['refreshToken'] as String?,
      );
      _session = session;
      await _storage.write(
        key: _storageKey,
        value: jsonEncode(session.toJson()),
      );
      return session;
    } catch (_) {
      await clearSession();
      return null;
    }
  }

  Future<void> logout() async {
    final session = _session;
    if (session != null) {
      try {
        await _post(
          '/auth/logout',
          body: {'refreshToken': session.refreshToken},
          accessToken: session.accessToken,
        );
      } catch (_) {
        // Local logout must still succeed when the server is unreachable.
      }
    }
    await clearSession();
  }

  Future<void> clearSession() async {
    _session = null;
    try {
      await _storage.delete(key: _storageKey);
    } catch (_) {
      // Some test/desktop environments do not expose a secure-storage plugin.
    }
  }

  Future<http.Response> _get(String path, {required String accessToken}) {
    return _client
        .get(
          Uri.parse('$_apiBaseUrl$path'),
          headers: {'authorization': 'Bearer $accessToken'},
        )
        .timeout(const Duration(seconds: 15));
  }

  Future<http.Response> _post(
    String path, {
    required Map<String, dynamic> body,
    String? accessToken,
  }) {
    return _client
        .post(
          Uri.parse('$_apiBaseUrl$path'),
          headers: {
            'content-type': 'application/json; charset=UTF-8',
            if (accessToken != null) 'authorization': 'Bearer $accessToken',
          },
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));
  }

  Map<String, dynamic> _decodeObject(http.Response response) {
    try {
      final decoded = jsonDecode(utf8.decode(response.bodyBytes));
      return decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
    } catch (_) {
      return <String, dynamic>{};
    }
  }

  String _errorMessage(Map<String, dynamic> data, int statusCode) {
    final serverMessage = _firstMessage(data);
    if (serverMessage != null) {
      if (serverMessage == 'Invalid login credentials.') {
        return 'رقم الموبايل أو الإيميل أو كلمة المرور غير صحيحة.';
      }
      if (serverMessage == 'This account is not a courier account.') {
        return 'هذا الحساب ليس حساب مندوب توصيل.';
      }
      return serverMessage;
    }
    if (statusCode == 403) {
      return 'هذا الحساب غير مسموح له بدخول تطبيق المندوب.';
    }
    return 'تعذر تسجيل الدخول. تأكد من الاتصال وحاول مرة أخرى.';
  }

  String? _firstMessage(Object? value) {
    if (value is String && value.trim().isNotEmpty) return value;
    if (value is List) {
      for (final item in value) {
        final result = _firstMessage(item);
        if (result != null) return result;
      }
    }
    if (value is Map) {
      for (final item in value.values) {
        final result = _firstMessage(item);
        if (result != null) return result;
      }
    }
    return null;
  }
}
