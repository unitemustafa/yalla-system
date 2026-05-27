import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppPreferences {
  const AppPreferences({
    this.pushNotifications = true,
    this.safeMode = false,
    this.hdImages = false,
  });

  final bool pushNotifications;
  final bool safeMode;
  final bool hdImages;

  AppPreferences copyWith({
    bool? pushNotifications,
    bool? safeMode,
    bool? hdImages,
  }) {
    return AppPreferences(
      pushNotifications: pushNotifications ?? this.pushNotifications,
      safeMode: safeMode ?? this.safeMode,
      hdImages: hdImages ?? this.hdImages,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is AppPreferences &&
        other.pushNotifications == pushNotifications &&
        other.safeMode == safeMode &&
        other.hdImages == hdImages;
  }

  @override
  int get hashCode => Object.hash(pushNotifications, safeMode, hdImages);
}

class AppPreferencesController extends ValueNotifier<AppPreferences> {
  AppPreferencesController._() : super(const AppPreferences());

  static final AppPreferencesController instance = AppPreferencesController._();

  static const String _pushNotificationsKey =
      'app.preferences.push_notifications';
  static const String _safeModeKey = 'app.preferences.safe_mode';
  static const String _hdImagesKey = 'app.preferences.hd_images';

  Future<void> loadSavedPreferences() async {
    final preferences = await SharedPreferences.getInstance();
    value = AppPreferences(
      pushNotifications: preferences.getBool(_pushNotificationsKey) ?? true,
      safeMode: preferences.getBool(_safeModeKey) ?? false,
      hdImages: preferences.getBool(_hdImagesKey) ?? false,
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

  Future<void> setHdImages(bool enabled) {
    return _setPreference(
      key: _hdImagesKey,
      value: enabled,
      nextPreferences: value.copyWith(hdImages: enabled),
    );
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
}
