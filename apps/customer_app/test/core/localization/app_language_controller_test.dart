import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:yallamarket/core/localization/app_language_controller.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    AppLanguageController.instance.value = AppLanguage.arabic;
  });

  group('AppLanguage', () {
    test('falls back to Arabic for unknown language codes', () {
      expect(AppLanguage.fromCode('en'), AppLanguage.english);
      expect(AppLanguage.fromCode('ar'), AppLanguage.arabic);
      expect(AppLanguage.fromCode('fr'), AppLanguage.arabic);
      expect(AppLanguage.fromCode(null), AppLanguage.arabic);
    });
  });

  group('AppLanguageController', () {
    test('loads saved language from preferences', () async {
      SharedPreferences.setMockInitialValues({'app.language_code': 'en'});

      await AppLanguageController.instance.loadSavedLanguage();

      expect(AppLanguageController.instance.value, AppLanguage.english);
    });

    test(
      'persists language changes and toggles the current language',
      () async {
        await AppLanguageController.instance.setLanguage(AppLanguage.english);
        var preferences = await SharedPreferences.getInstance();

        expect(AppLanguageController.instance.value, AppLanguage.english);
        expect(preferences.getString('app.language_code'), 'en');

        await AppLanguageController.instance.toggleLanguage();
        preferences = await SharedPreferences.getInstance();

        expect(AppLanguageController.instance.value, AppLanguage.arabic);
        expect(preferences.getString('app.language_code'), 'ar');
      },
    );
  });
}
