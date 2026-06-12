import 'package:flutter/material.dart';

import 'core/config/app_environment.dart';
import 'core/di/service_locator.dart';
import 'core/localization/app_language_controller.dart';
import 'core/preferences/app_preferences_controller.dart';
import 'yalla_market_app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  AppEnvironment.validate();
  initServiceLocator();
  await AppLanguageController.instance.loadSavedLanguage();
  await AppPreferencesController.instance.loadSavedPreferences();
  runApp(const YallaMarketApp());
}
