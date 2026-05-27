import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppLanguage {
  english('en', Locale('en'), 'English'),
  arabic('ar', Locale('ar'), 'العربية');

  const AppLanguage(this.code, this.locale, this.label);

  final String code;
  final Locale locale;
  final String label;

  bool get isArabic => this == AppLanguage.arabic;

  static AppLanguage fromCode(String? code) {
    return switch (code) {
      'en' => AppLanguage.english,
      'ar' => AppLanguage.arabic,
      _ => AppLanguage.arabic,
    };
  }
}

class AppLanguageController extends ValueNotifier<AppLanguage> {
  AppLanguageController._() : super(AppLanguage.arabic);

  static final AppLanguageController instance = AppLanguageController._();
  static const String _storageKey = 'app.language_code';

  Future<void> loadSavedLanguage() async {
    final preferences = await SharedPreferences.getInstance();
    value = AppLanguage.fromCode(preferences.getString(_storageKey));
  }

  Future<void> setLanguage(AppLanguage language) async {
    if (value == language) return;

    value = language;
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_storageKey, language.code);
  }

  Future<void> toggleLanguage() {
    return setLanguage(
      value.isArabic ? AppLanguage.english : AppLanguage.arabic,
    );
  }
}
