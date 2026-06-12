import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppPreferences {
  const AppPreferences({
    this.pushNotifications = true,
    this.safeMode = false,
    this.themeMode = ThemeMode.system,
  });

  final bool pushNotifications;
  final bool safeMode;
  final ThemeMode themeMode;

  AppPreferences copyWith({
    bool? pushNotifications,
    bool? safeMode,
    ThemeMode? themeMode,
  }) {
    return AppPreferences(
      pushNotifications: pushNotifications ?? this.pushNotifications,
      safeMode: safeMode ?? this.safeMode,
      themeMode: themeMode ?? this.themeMode,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is AppPreferences &&
        other.pushNotifications == pushNotifications &&
        other.safeMode == safeMode &&
        other.themeMode == themeMode;
  }

  @override
  int get hashCode => Object.hash(pushNotifications, safeMode, themeMode);
}

class AppPreferencesController extends ValueNotifier<AppPreferences> {
  AppPreferencesController._() : super(const AppPreferences());

  static final AppPreferencesController instance = AppPreferencesController._();

  static const String _pushNotificationsKey =
      'app.preferences.push_notifications';
  static const String _safeModeKey = 'app.preferences.safe_mode';
  static const String _themeModeKey = 'app.preferences.theme_mode';

  Future<void> loadSavedPreferences() async {
    final preferences = await SharedPreferences.getInstance();
    value = AppPreferences(
      pushNotifications: preferences.getBool(_pushNotificationsKey) ?? true,
      safeMode: preferences.getBool(_safeModeKey) ?? false,
      themeMode: _themeModeFromStorage(preferences.getString(_themeModeKey)),
    );
  }

  Future<void> setPushNotifications(bool enabled) {
    return _setPreference(
      key: _pushNotificationsKey,
      value: enabled,
      nextPreferences: value.copyWith(pushNotifications: enabled),
    );
  }

  Future<void> setSafeMode(bool enabled) {
    return _setPreference(
      key: _safeModeKey,
      value: enabled,
      nextPreferences: value.copyWith(safeMode: enabled),
    );
  }

  Future<void> setThemeMode(ThemeMode themeMode) async {
    final nextPreferences = value.copyWith(themeMode: themeMode);
    if (value == nextPreferences) return;

    value = nextPreferences;
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_themeModeKey, themeMode.name);
  }

  Future<void> _setPreference({
    required String key,
    required bool value,
    required AppPreferences nextPreferences,
  }) async {
    if (this.value == nextPreferences) return;

    this.value = nextPreferences;
    final preferences = await SharedPreferences.getInstance();
    await preferences.setBool(key, value);
  }

  ThemeMode _themeModeFromStorage(String? value) {
    return switch (value) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }
}
