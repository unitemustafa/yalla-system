import 'package:flutter/material.dart';
import 'package:yallamarket/core/localization/app_translations.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/formatters/app_currency.dart';
import '../../../../../core/localization/app_language_controller.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../../core/preferences/app_preferences_controller.dart';
import '../../../../../core/theme/app_theme_controller.dart';

part 'app_preferences_tiles.dart';
part 'app_preferences_sheet_widgets.dart';

class AppPreferencesView extends StatefulWidget {
  const AppPreferencesView({super.key});

  @override
  State<AppPreferencesView> createState() => _AppPreferencesViewState();
}

class _AppPreferencesViewState extends State<AppPreferencesView> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);
    final currentLanguage = AppLanguageController.instance.value;
    final languageLabel = currentLanguage.isArabic ? 'العربية' : 'English';
    final currentThemeMode = AppThemeController.instance.value;

    return ValueListenableBuilder<AppPreferences>(
      valueListenable: AppPreferencesController.instance,
      builder: (context, preferences, _) {
        return Scaffold(
          backgroundColor: backgroundColor,
          body: SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final maxWidth = constraints.maxWidth >= 760
                    ? 680.0
                    : constraints.maxWidth;

                return SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(maxWidth: maxWidth),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const PageTopBar(
                            title: 'App Preferences',
                            subtitle: 'Tune shopping, alerts and data usage',
                          ),
                          const SizedBox(height: 18),
                          _PreferencesHero(isDark: isDark),
                          const SizedBox(height: 18),
                          _PreferencesSection(
                            title: 'Shopping setup',
                            isDark: isDark,
                            children: [
                              _PreferenceInfoTile(
                                icon: AppIcons.global,
                                title: 'Language',
                                subtitle: languageLabel,
                                accentColor: AppColors.primary,
                                onTap: () => _showLanguageSheet(context),
                              ),
                              _PreferenceInfoTile(
                                icon: AppIcons.receipt_text,
                                title: 'Currency',
                                subtitle: 'Egyptian Pound',
                                accentColor: AppColors.success,
                                onTap: () => _showFixedPreferenceSheet(
                                  context: context,
                                  title: 'Currency',
                                  selectedTitle: 'Egyptian Pound',
                                  selectedSubtitle: AppCurrency.symbol,
                                  icon: AppIcons.receipt_text,
                                  accentColor: AppColors.success,
                                  snackTitle: 'Currency saved',
                                ),
                              ),
                              _PreferenceInfoTile(
                                icon: AppIcons.global,
                                title: 'Region',
                                subtitle: 'Egypt',
                                accentColor: AppColors.warning,
                                onTap: () => _showFixedPreferenceSheet(
                                  context: context,
                                  title: 'Region',
                                  selectedTitle: 'Egypt',
                                  selectedSubtitle: 'Local prices and delivery',
                                  icon: AppIcons.global,
                                  accentColor: AppColors.warning,
                                  snackTitle: 'Region saved',
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          _PreferencesSection(
                            title: 'Quick controls',
                            isDark: isDark,
                            children: [
                              _PreferenceInfoTile(
                                icon: _themeIcon(currentThemeMode),
                                title: 'Theme',
                                subtitle: _themeLabel(currentThemeMode),
                                accentColor: const Color(0xFF8B5CF6),
                                onTap: () => _showThemeSheet(context),
                              ),
                              _PreferenceSwitchTile(
                                icon: AppIcons.notification,
                                title: 'Push notifications',
                                subtitle:
                                    'Deals, order updates and account alerts.',
                                value: preferences.pushNotifications,
                                accentColor: AppColors.primary,
                                onChanged: AppPreferencesController
                                    .instance
                                    .setPushNotifications,
                              ),
                              _PreferenceSwitchTile(
                                icon: AppIcons.security_user,
                                title: 'Safe mode',
                                subtitle:
                                    'Keep search results family friendly.',
                                value: preferences.safeMode,
                                accentColor: AppColors.warning,
                                onChanged: AppPreferencesController
                                    .instance
                                    .setSafeMode,
                              ),
                              _PreferenceSwitchTile(
                                icon: AppIcons.image,
                                title: 'HD image quality',
                                subtitle: 'Use sharper product images.',
                                value: preferences.hdImages,
                                accentColor: const Color(0xFF06B6D4),
                                onChanged: AppPreferencesController
                                    .instance
                                    .setHdImages,
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: () {
                                CustomSnackBar.showInfo(
                                  context: context,
                                  title: 'Temporary cache cleared',
                                );
                              },
                              icon: const Icon(AppIcons.trash, size: 18),
                              label: Text(context.tr('Clear temporary cache')),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.error,
                                side: BorderSide(
                                  color: AppColors.error.withValues(
                                    alpha: 0.35,
                                  ),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  IconData _themeIcon(ThemeMode themeMode) {
    return switch (themeMode) {
      ThemeMode.dark => AppIcons.moon,
      ThemeMode.light => AppIcons.sun_1,
      ThemeMode.system => AppIcons.setting_2,
    };
  }

  String _themeLabel(ThemeMode themeMode) {
    return switch (themeMode) {
      ThemeMode.dark => 'Dark theme is active',
      ThemeMode.light => 'Light theme is active',
      ThemeMode.system => 'Follows system theme',
    };
  }

  void _showLanguageSheet(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentLanguage = AppLanguageController.instance.value;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (sheetContext) {
        return _PreferenceSelectionSheet(
          title: 'Language',
          children: [
            _PreferenceOptionTile(
              title: 'العربية',
              subtitle: 'واجهة عربية بالكامل',
              icon: AppIcons.global,
              accentColor: AppColors.primary,
              isSelected: currentLanguage == AppLanguage.arabic,
              onTap: () {
                Navigator.pop(sheetContext);
                AppLanguageController.instance.setLanguage(AppLanguage.arabic);
                CustomSnackBar.showSuccess(
                  context: context,
                  title: 'Language updated',
                );
              },
            ),
            const SizedBox(height: 10),
            _PreferenceOptionTile(
              title: 'English',
              subtitle: 'English interface',
              icon: AppIcons.global,
              accentColor: AppColors.primary,
              isSelected: currentLanguage == AppLanguage.english,
              onTap: () {
                Navigator.pop(sheetContext);
                AppLanguageController.instance.setLanguage(AppLanguage.english);
                CustomSnackBar.showSuccess(
                  context: context,
                  title: 'Language updated',
                );
              },
            ),
          ],
        );
      },
    );
  }

  void _showThemeSheet(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentThemeMode = AppThemeController.instance.value;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (sheetContext) {
        return _PreferenceSelectionSheet(
          title: 'Theme',
          children: [
            _PreferenceOptionTile(
              title: 'System theme',
              subtitle: 'Follow device appearance automatically',
              icon: AppIcons.setting_2,
              accentColor: const Color(0xFF8B5CF6),
              isSelected: currentThemeMode == ThemeMode.system,
              onTap: () => _selectThemeMode(
                context: context,
                sheetContext: sheetContext,
                mode: ThemeMode.system,
              ),
            ),
            const SizedBox(height: 10),
            _PreferenceOptionTile(
              title: 'Light theme',
              subtitle: 'Keep the app in light mode',
              icon: AppIcons.sun_1,
              accentColor: const Color(0xFF8B5CF6),
              isSelected: currentThemeMode == ThemeMode.light,
              onTap: () => _selectThemeMode(
                context: context,
                sheetContext: sheetContext,
                mode: ThemeMode.light,
              ),
            ),
            const SizedBox(height: 10),
            _PreferenceOptionTile(
              title: 'Dark theme',
              subtitle: 'Keep the app in dark mode',
              icon: AppIcons.moon,
              accentColor: const Color(0xFF8B5CF6),
              isSelected: currentThemeMode == ThemeMode.dark,
              onTap: () => _selectThemeMode(
                context: context,
                sheetContext: sheetContext,
                mode: ThemeMode.dark,
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _selectThemeMode({
    required BuildContext context,
    required BuildContext sheetContext,
    required ThemeMode mode,
  }) async {
    Navigator.pop(sheetContext);
    await AppThemeController.instance.setThemeMode(mode);
    if (!context.mounted) return;

    CustomSnackBar.showSuccess(context: context, title: 'Theme saved');
  }

  void _showFixedPreferenceSheet({
    required BuildContext context,
    required String title,
    required String selectedTitle,
    required String selectedSubtitle,
    required IconData icon,
    required Color accentColor,
    required String snackTitle,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (sheetContext) {
        return _PreferenceSelectionSheet(
          title: title,
          children: [
            _PreferenceOptionTile(
              title: selectedTitle,
              subtitle: selectedSubtitle,
              icon: icon,
              accentColor: accentColor,
              isSelected: true,
              onTap: () {
                Navigator.pop(sheetContext);
                CustomSnackBar.showSuccess(context: context, title: snackTitle);
              },
            ),
          ],
        );
      },
    );
  }
}
