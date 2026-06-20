import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StoredAuthTokens {
  const StoredAuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
    this.sessionExpiresAt,
    this.isSessionOnly = false,
  });

  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
  final DateTime? sessionExpiresAt;
  final bool isSessionOnly;

  bool get isExpired =>
      !(sessionExpiresAt ?? expiresAt).isAfter(DateTime.now());

  bool get expiresSoon {
    return expiresAt.isBefore(DateTime.now().add(const Duration(minutes: 2)));
  }

  StoredAuthTokens copyWith({
    String? accessToken,
    String? refreshToken,
    DateTime? expiresAt,
    DateTime? sessionExpiresAt,
    bool? isSessionOnly,
  }) {
    return StoredAuthTokens(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      expiresAt: expiresAt ?? this.expiresAt,
      sessionExpiresAt: sessionExpiresAt ?? this.sessionExpiresAt,
      isSessionOnly: isSessionOnly ?? this.isSessionOnly,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'expiresAt': expiresAt.toIso8601String(),
      'sessionExpiresAt': sessionExpiresAt?.toIso8601String(),
    };
  }

  factory StoredAuthTokens.fromJson(Map<String, dynamic> json) {
    return StoredAuthTokens(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresAt: DateTime.parse(json['expiresAt'] as String),
      sessionExpiresAt: _optionalDateFromJson(json['sessionExpiresAt']),
    );
  }
}

DateTime? _optionalDateFromJson(Object? value) {
  if (value is! String || value.trim().isEmpty) return null;
  return DateTime.tryParse(value);
}

abstract class TokenStore {
  Future<StoredAuthTokens?> read();

  Future<void> save(StoredAuthTokens tokens);

  Future<bool> consumeExpiredSessionMarker();

  Future<void> clear();
}

class SecureTokenStore implements TokenStore {
  SecureTokenStore({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const _tokensKey = 'auth.secure_tokens.v1';
  static const _sessionMarkerKey = 'auth.session_marker.v1';

  final FlutterSecureStorage _storage;
  StoredAuthTokens? _sessionTokens;

  @override
  Future<StoredAuthTokens?> read() async {
    if (_sessionTokens case final tokens?) return tokens;

    final rawTokens = await _storage.read(key: _tokensKey);
    if (rawTokens == null || rawTokens.trim().isEmpty) return null;

    try {
      return StoredAuthTokens.fromJson(
        jsonDecode(rawTokens) as Map<String, dynamic>,
      );
    } catch (_) {
      await clear();
      return null;
    }
  }

  @override
  Future<void> save(StoredAuthTokens tokens) async {
    await _saveSessionMarker(tokens);

    if (tokens.isSessionOnly) {
      _sessionTokens = tokens;
      await _storage.delete(key: _tokensKey);
      return;
    }

    _sessionTokens = null;
    await _storage.write(key: _tokensKey, value: jsonEncode(tokens.toJson()));
  }

  @override
  Future<bool> consumeExpiredSessionMarker() async {
    final rawMarker = await _storage.read(key: _sessionMarkerKey);
    if (rawMarker == null || rawMarker.trim().isEmpty) return false;

    await _storage.delete(key: _sessionMarkerKey);

    try {
      final marker = jsonDecode(rawMarker) as Map<String, dynamic>;
      final remembered = marker['remembered'] == true;
      if (!remembered) return true;

      final expiresAt = _optionalDateFromJson(marker['expiresAt']);
      return expiresAt == null || !expiresAt.isAfter(DateTime.now());
    } catch (_) {
      return false;
    }
  }

  @override
  Future<void> clear() async {
    _sessionTokens = null;
    await _storage.delete(key: _tokensKey);
    await _storage.delete(key: _sessionMarkerKey);
  }

  Future<void> _saveSessionMarker(StoredAuthTokens tokens) async {
    await _storage.write(
      key: _sessionMarkerKey,
      value: jsonEncode({
        'remembered': !tokens.isSessionOnly,
        'expiresAt': (tokens.sessionExpiresAt ?? tokens.expiresAt)
            .toIso8601String(),
      }),
    );
  }
}

class InMemoryTokenStore implements TokenStore {
  StoredAuthTokens? _tokens;

  @override
  Future<StoredAuthTokens?> read() async => _tokens;

  @override
  Future<void> save(StoredAuthTokens tokens) async {
    _tokens = tokens;
  }

  @override
  Future<bool> consumeExpiredSessionMarker() async => false;

  @override
  Future<void> clear() async {
    _tokens = null;
  }
}
