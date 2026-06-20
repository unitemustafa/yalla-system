import '../localization/app_translations.dart';

enum PasswordStrength { empty, weak, medium, strong }

/// Reusable form validators for the entire application.
class Validators {
  Validators._();

  static String? required(String? value) {
    final strings = AppTranslations.current;
    if (value == null || value.trim().isEmpty) {
      return strings.fieldRequired;
    }
    return null;
  }

  static String? email(String? value) {
    final strings = AppTranslations.current;
    if (value == null || value.trim().isEmpty) {
      return strings.fieldRequired;
    }
    final emailRegex = RegExp(r'^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$');
    if (!emailRegex.hasMatch(value.trim())) {
      return strings.invalidEmail;
    }
    return null;
  }

  static String? loginIdentifier(String? value) {
    final strings = AppTranslations.current;
    if (value == null || value.trim().isEmpty) {
      return strings.fieldRequired;
    }
    return null;
  }

  static String? password(String? value) {
    final strings = AppTranslations.current;
    final password = value ?? '';

    if (password.isEmpty) {
      return strings.fieldRequired;
    }
    if (password.length < 8) {
      return strings.passwordTooShort;
    }
    if (password.length > 72) {
      return strings.passwordTooLong;
    }
    final strength = passwordStrength(password);
    if (strength == PasswordStrength.weak) {
      return strings.passwordWeak;
    }
    if (strength == PasswordStrength.medium) {
      return strings.passwordMedium;
    }
    return null;
  }

  static String? passwordRequired(String? value) {
    final strings = AppTranslations.current;
    if (value == null || value.isEmpty) {
      return strings.fieldRequired;
    }
    return null;
  }

  static PasswordStrength passwordStrength(String? value) {
    final password = value ?? '';
    if (password.isEmpty) return PasswordStrength.empty;

    var score = 0;
    if (password.length >= 8) score++;
    if (RegExp(r'[a-z]').hasMatch(password)) score++;
    if (RegExp(r'[A-Z]').hasMatch(password)) score++;
    if (RegExp(r'\d').hasMatch(password)) score++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(password)) score++;

    if (score <= 2) return PasswordStrength.weak;
    if (score <= 4) return PasswordStrength.medium;
    return PasswordStrength.strong;
  }

  static String? phone(String? value) {
    final strings = AppTranslations.current;
    if (value == null || value.trim().isEmpty) {
      return strings.fieldRequired;
    }
    if (value.length < 10) {
      return strings.invalidPhone;
    }
    return null;
  }

  static String? egyptianMobile(String? value) {
    final strings = AppTranslations.current;
    if (value == null || value.trim().isEmpty) {
      return strings.fieldRequired;
    }
    if (!isEgyptianMobileNumber(value)) {
      return strings.invalidPhone;
    }
    return null;
  }

  static bool isEgyptianMobileNumber(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    var nationalNumber = digits;

    if (nationalNumber.startsWith('0020')) {
      nationalNumber = nationalNumber.substring(4);
    } else if (nationalNumber.startsWith('20')) {
      nationalNumber = nationalNumber.substring(2);
    }

    if (nationalNumber.length == 10 && nationalNumber.startsWith('1')) {
      nationalNumber = '0$nationalNumber';
    }

    return RegExp(r'^01[0125]\d{8}$').hasMatch(nationalNumber);
  }
}
