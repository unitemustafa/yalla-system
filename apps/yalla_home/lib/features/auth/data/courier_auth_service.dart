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
    this.courierProfile,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String role;
  final CourierProfileData? courierProfile;

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
      courierProfile: json['courier_profile'] is Map
          ? CourierProfileData.fromJson(
              Map<String, dynamic>.from(json['courier_profile'] as Map),
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'first_name': firstName,
    'last_name': lastName,
    'email': email,
    'phone': phone,
    'role': role,
    'courier_profile': courierProfile?.toJson(),
  };
}

class CourierProfileData {
  const CourierProfileData({
    required this.region,
    required this.vehicleType,
    required this.vehiclePlate,
    required this.status,
    required this.activeOrders,
    required this.deliveredOrders,
    this.profilePhotoUrl,
  });

  final String region;
  final String vehicleType;
  final String vehiclePlate;
  final String status;
  final int activeOrders;
  final int deliveredOrders;
  final String? profilePhotoUrl;

  factory CourierProfileData.fromJson(Map<String, dynamic> json) {
    return CourierProfileData(
      region: '${json['region'] ?? ''}',
      vehicleType: '${json['vehicle_type'] ?? ''}',
      vehiclePlate: '${json['vehicle_plate'] ?? ''}',
      status: '${json['status'] ?? ''}',
      activeOrders: _intValue(json['active_orders']),
      deliveredOrders: _intValue(json['delivered_orders']),
      profilePhotoUrl: json['profile_photo_url']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'region': region,
    'vehicle_type': vehicleType,
    'vehicle_plate': vehiclePlate,
    'status': status,
    'active_orders': activeOrders,
    'delivered_orders': deliveredOrders,
    'profile_photo_url': profilePhotoUrl,
  };
}

int _intValue(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse('$value') ?? 0;
}

class CourierSession {
  const CourierSession({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    required this.rememberMe,
  });

  final CourierUser user;
  final String accessToken;
  final String refreshToken;
  final bool rememberMe;

  factory CourierSession.fromJson(Map<String, dynamic> json) {
    return CourierSession(
      user: CourierUser.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      rememberMe: json['rememberMe'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'user': user.toJson(),
    'accessToken': accessToken,
    'refreshToken': refreshToken,
    'rememberMe': rememberMe,
  };

  CourierSession copyWith({
    CourierUser? user,
    String? accessToken,
    String? refreshToken,
    bool? rememberMe,
  }) {
    return CourierSession(
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      rememberMe: rememberMe ?? this.rememberMe,
    );
  }
}

class CourierAuthException implements Exception {
  const CourierAuthException(this.message);

  final String message;

  @override
  String toString() => message;
}

abstract class CourierSessionStorage {
  Future<String?> read();

  Future<void> write(String value);

  Future<void> clear();
}

class SecureCourierSessionStorage implements CourierSessionStorage {
  SecureCourierSessionStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const _storageKey = 'yalla_home.courier_session.v1';

  final FlutterSecureStorage _storage;

  @override
  Future<String?> read() => _storage.read(key: _storageKey);

  @override
  Future<void> write(String value) {
    return _storage.write(key: _storageKey, value: value);
  }

  @override
  Future<void> clear() => _storage.delete(key: _storageKey);
}

class CourierAuthService {
  CourierAuthService({
    http.Client? client,
    CourierSessionStorage? sessionStorage,
    String? apiBaseUrl,
  }) : _client = client ?? http.Client(),
       _sessionStorage = sessionStorage ?? SecureCourierSessionStorage(),
       _apiBaseUrl = _buildApiBaseUrl(apiBaseUrl ?? _configuredApiOrigin);

  static final CourierAuthService instance = CourierAuthService();
  static const _configuredApiOrigin = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8000',
  );

  final http.Client _client;
  final CourierSessionStorage _sessionStorage;
  final String _apiBaseUrl;
  CourierSession? _session;
  Future<CourierSession?>? _refreshingSession;

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
      final session = CourierSession.fromJson({
        ...data,
        'rememberMe': rememberMe,
      });
      if (session.user.role != 'representative') {
        throw const CourierAuthException('هذا الحساب ليس حساب مندوب توصيل.');
      }
      _session = session;
      if (rememberMe) {
        await _sessionStorage.write(jsonEncode(session.toJson()));
      } else {
        await _sessionStorage.clear();
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
      final stored = await _sessionStorage.read();
      if (stored == null || stored.trim().isEmpty) return null;
      var session = CourierSession.fromJson(
        jsonDecode(stored) as Map<String, dynamic>,
      );
      _session = session;
      final currentSession = await _loadCurrentSession();
      if (currentSession == null) await clearSession();
      return currentSession;
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
      await _sessionStorage.clear();
    } catch (_) {
      // Some test/desktop environments do not expose a secure-storage plugin.
    }
  }

  Future<CourierSession?> _loadCurrentSession() async {
    final response = await _authorizedRequest(
      (token) => _get('/auth/me', accessToken: token),
    );
    if (response.statusCode != 200) return null;

    final data = _decodeObject(response);
    final rawUser = data['user'];
    if (rawUser is! Map) {
      throw const CourierAuthException('استجابة بيانات المندوب غير مكتملة.');
    }

    final user = CourierUser.fromJson(Map<String, dynamic>.from(rawUser));
    if (user.role != 'representative') {
      throw const CourierAuthException('هذا الحساب ليس حساب مندوب توصيل.');
    }

    final session = _session;
    if (session == null) return null;
    final updated = session.copyWith(user: user);
    _session = updated;
    if (updated.rememberMe) {
      await _sessionStorage.write(jsonEncode(updated.toJson()));
    }
    return updated;
  }

  Future<http.Response> _authorizedRequest(
    Future<http.Response> Function(String accessToken) request,
  ) async {
    final session = _session;
    if (session == null) {
      throw const CourierAuthException('جلسة المندوب غير متاحة.');
    }
    var response = await request(session.accessToken);
    if (response.statusCode != 401) return response;

    final refreshed = await _refreshSessionOnce();
    if (refreshed == null) return response;
    return request(refreshed.accessToken);
  }

  Future<CourierSession?> _refreshSessionOnce() {
    final activeRefresh = _refreshingSession;
    if (activeRefresh != null) return activeRefresh;
    final refresh = _performRefresh();
    _refreshingSession = refresh;
    return refresh.whenComplete(() => _refreshingSession = null);
  }

  Future<CourierSession?> _performRefresh() async {
    final session = _session;
    if (session == null) return null;
    final response = await _post(
      '/auth/refresh',
      body: {'refreshToken': session.refreshToken},
    );
    if (response.statusCode != 200) return null;
    final data = _decodeObject(response);
    final accessToken = data['accessToken']?.toString();
    if (accessToken == null || accessToken.isEmpty) return null;
    final updated = session.copyWith(
      accessToken: accessToken,
      refreshToken: data['refreshToken']?.toString() ?? session.refreshToken,
    );
    _session = updated;
    if (updated.rememberMe) {
      await _sessionStorage.write(jsonEncode(updated.toJson()));
    }
    return updated;
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

  static String _buildApiBaseUrl(String origin) {
    final normalized = origin.trim().replaceAll(RegExp(r'/+$'), '');
    if (normalized.isEmpty) {
      throw StateError(
        'API_BASE_URL is required. Example: http://127.0.0.1:8000',
      );
    }
    return '$normalized/api/v1';
  }
}
