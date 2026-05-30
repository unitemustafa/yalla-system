import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

class AppTheme {
  AppTheme._();

  static const String fontFamily = 'Cairo';

  static TextTheme get _lightTextTheme => const TextTheme(
    headlineLarge: TextStyle(
      color: AppColors.lightTextPrimary,
      fontSize: 28,
      fontWeight: FontWeight.bold,
    ),
    titleLarge: TextStyle(
      color: AppColors.lightTextPrimary,
      fontSize: 24,
      fontWeight: FontWeight.bold,
    ),
    titleMedium: TextStyle(
      color: AppColors.lightTextPrimary,
      fontSize: 18,
      fontWeight: FontWeight.w600,
    ),
    bodyLarge: TextStyle(color: AppColors.lightTextPrimary, fontSize: 16),
    bodyMedium: TextStyle(color: AppColors.lightTextSecondary, fontSize: 14),
    bodySmall: TextStyle(color: AppColors.lightTextSecondary, fontSize: 12),
  ).apply(fontFamily: fontFamily);

  static TextTheme get _darkTextTheme => const TextTheme(
    headlineLarge: TextStyle(
      color: AppColors.darkTextPrimary,
      fontSize: 28,
      fontWeight: FontWeight.bold,
    ),
    titleLarge: TextStyle(
      color: AppColors.darkTextPrimary,
      fontSize: 24,
      fontWeight: FontWeight.bold,
    ),
    titleMedium: TextStyle(
      color: AppColors.darkTextPrimary,
      fontSize: 18,
      fontWeight: FontWeight.w600,
    ),
    bodyLarge: TextStyle(color: AppColors.darkTextPrimary, fontSize: 16),
    bodyMedium: TextStyle(color: AppColors.darkTextSecondary, fontSize: 14),
    bodySmall: TextStyle(color: AppColors.darkTextSecondary, fontSize: 12),
  ).apply(fontFamily: fontFamily);

  static DatePickerThemeData _datePickerTheme({required bool isDark}) {
    final surface = isDark ? const Color(0xFF202124) : Colors.white;
    final onSurface = isDark
        ? AppColors.darkTextPrimary
        : AppColors.lightTextPrimary;
    final muted = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return DatePickerThemeData(
      backgroundColor: surface,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      headerBackgroundColor: AppColors.primary,
      headerForegroundColor: Colors.white,
      headerHeadlineStyle: const TextStyle(
        fontFamily: fontFamily,
        color: Colors.white,
        fontSize: 26,
        fontWeight: FontWeight.w900,
      ),
      headerHelpStyle: const TextStyle(
        fontFamily: fontFamily,
        color: Colors.white70,
        fontSize: 13,
        fontWeight: FontWeight.w800,
      ),
      weekdayStyle: TextStyle(
        fontFamily: fontFamily,
        color: muted,
        fontSize: 13,
        fontWeight: FontWeight.w900,
      ),
      dayStyle: TextStyle(
        fontFamily: fontFamily,
        color: onSurface,
        fontSize: 15,
        fontWeight: FontWeight.w800,
      ),
      dayForegroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return Colors.white;
        if (states.contains(WidgetState.disabled)) {
          return muted.withValues(alpha: 0.35);
        }
        return onSurface;
      }),
      dayBackgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return AppColors.primary;
        return Colors.transparent;
      }),
      todayForegroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return Colors.white;
        return AppColors.primary;
      }),
      todayBorder: const BorderSide(color: AppColors.primary, width: 1.3),
      yearStyle: TextStyle(
        fontFamily: fontFamily,
        color: onSurface,
        fontWeight: FontWeight.w800,
      ),
      confirmButtonStyle: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        textStyle: const TextStyle(
          fontFamily: fontFamily,
          fontWeight: FontWeight.w900,
        ),
      ),
      cancelButtonStyle: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        textStyle: const TextStyle(
          fontFamily: fontFamily,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }

  static ThemeData get lightTheme => ThemeData(
    fontFamily: fontFamily,
    brightness: Brightness.light,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.lightBackground,
    cardColor: AppColors.lightCardColor,
    colorScheme: const ColorScheme.light(
      primary: AppColors.primary,
      onPrimary: Colors.white,
      surface: AppColors.lightBackground,
      onSurface: AppColors.lightTextPrimary,
      secondary: AppColors.primary,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: AppColors.lightTextPrimary),
    ),
    datePickerTheme: _datePickerTheme(isDark: false),
    textTheme: _lightTextTheme,
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 0,
        textStyle: const TextStyle(
          fontFamily: fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.lightTextPrimary,
        padding: const EdgeInsets.symmetric(vertical: 16),
        side: BorderSide(color: Colors.grey[300]!),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(
          fontFamily: fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return AppColors.primary;
        return Colors.transparent;
      }),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      floatingLabelBehavior: FloatingLabelBehavior.never,
      labelStyle: TextStyle(
        color: Colors.grey[600],
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red, width: 1.5),
      ),
    ),
  );

  static ThemeData get darkTheme => ThemeData(
    fontFamily: fontFamily,
    brightness: Brightness.dark,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.darkBackground,
    cardColor: AppColors.darkCardColor,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.primary,
      onPrimary: Colors.white,
      surface: AppColors.darkBackground,
      onSurface: AppColors.darkTextPrimary,
      secondary: AppColors.primary,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: AppColors.darkTextPrimary),
    ),
    datePickerTheme: _datePickerTheme(isDark: true),
    textTheme: _darkTextTheme,
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 0,
        textStyle: const TextStyle(
          fontFamily: fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.darkTextPrimary,
        padding: const EdgeInsets.symmetric(vertical: 16),
        side: BorderSide(color: Colors.grey[700]!),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(
          fontFamily: fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return AppColors.primary;
        return Colors.transparent;
      }),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      floatingLabelBehavior: FloatingLabelBehavior.never,
      labelStyle: TextStyle(
        color: Colors.grey[400],
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[700]!),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red, width: 1.5),
      ),
    ),
  );
}
