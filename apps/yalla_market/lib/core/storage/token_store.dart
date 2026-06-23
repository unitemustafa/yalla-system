import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StoredAuthTokens {
  const StoredAuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
    this.isSessionOnly = false,
    this.sessionExpiresAt,
  });

  static const sessionOnlyLifetime = Duration(minutes: 1);
  static const rememberedLifetime = Duration(days: 30);

  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
  final bool isSessionOnly;
  final DateTime? sessionExpiresAt;

  bool get isExpired {
    final expiry = sessionExpiresAt;
    return expiry != null && !expiry.isAfter(DateTime.now());
  }

  bool get expiresSoon {
    return expiresAt.isBefore(DateTime.now().add(const Duration(minutes: 2)));
  }

  StoredAuthTokens copyWith({
    String? accessToken,
    String? refreshToken,
    DateTime? expiresAt,
    bool? isSessionOnly,
    DateTime? sessionExpiresAt,
  }) {
    return StoredAuthTokens(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      expiresAt: expiresAt ?? this.expiresAt,
      isSessionOnly: isSessionOnly ?? this.isSessionOnly,
      sessionExpiresAt: sessionExpiresAt ?? this.sessionExpiresAt,
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
      sessionExpiresAt: _dateFromJson(json['sessionExpiresAt']),
    );
  }

  static DateTime? _dateFromJson(Object? value) {
    if (value is! String || value.trim().isEmpty) return null;
    return DateTime.tryParse(value);
  }
}

abstract final class SessionLifecycleStore {
  static const _closedSessionNoticeKey = 'auth.session_only_closed_notice.v1';

  static Future<void> markSessionOnlyActive() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setBool(_closedSessionNoticeKey, true);
  }

  static Future<void> clearSessionOnlyNotice() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_closedSessionNoticeKey);
  }

  static Future<bool> consumeClosedSessionNotice() async {
    final preferences = await SharedPreferences.getInstance();
    final shouldShow = preferences.getBool(_closedSessionNoticeKey) ?? false;
    if (shouldShow) {
      await preferences.remove(_closedSessionNoticeKey);
    }
    return shouldShow;
  }
}

abstract class TokenStore {
  Future<StoredAuthTokens?> read();

  Future<void> save(StoredAuthTokens tokens);

  Future<void> clear();
}

class SecureTokenStore implements TokenStore {
  SecureTokenStore({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const _tokensKey = 'auth.secure_tokens.v1';

  final FlutterSecureStorage _storage;
  StoredAuthTokens? _sessionTokens;

  @override
  Future<StoredAuthTokens?> read() async {
    if (_sessionTokens case final tokens?) {
      if (tokens.isExpired) {
        await clear();
        return null;
      }
      return tokens;
    }

    final rawTokens = await _storage.read(key: _tokensKey);
    if (rawTokens == null || rawTokens.trim().isEmpty) return null;

    try {
      final tokens = StoredAuthTokens.fromJson(
        jsonDecode(rawTokens) as Map<String, dynamic>,
      );
      if (tokens.isExpired) {
        await clear();
        return null;
      }
      return tokens;
    } catch (_) {
      await clear();
      return null;
    }
  }

  @override
  Future<void> save(StoredAuthTokens tokens) async {
    if (tokens.isSessionOnly) {
      _sessionTokens = tokens;
      await _storage.delete(key: _tokensKey);
      await SessionLifecycleStore.markSessionOnlyActive();
      return;
    }

    _sessionTokens = null;
    await SessionLifecycleStore.clearSessionOnlyNotice();
    await _storage.write(key: _tokensKey, value: jsonEncode(tokens.toJson()));
  }

  @override
  Future<void> clear() async {
    _sessionTokens = null;
    await SessionLifecycleStore.clearSessionOnlyNotice();
    await _storage.delete(key: _tokensKey);
  }
}

class InMemoryTokenStore implements TokenStore {
  StoredAuthTokens? _tokens;

  @override
  Future<StoredAuthTokens?> read() async {
    final tokens = _tokens;
    if (tokens == null) return null;
    if (tokens.isExpired) {
      await clear();
      return null;
    }
    return tokens;
  }

  @override
  Future<void> save(StoredAuthTokens tokens) async {
    _tokens = tokens;
  }

  @override
  Future<void> clear() async {
    _tokens = null;
  }
}
