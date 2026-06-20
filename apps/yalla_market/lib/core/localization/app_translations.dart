import 'package:flutter/widgets.dart';

import 'app_language_controller.dart';

part 'app_translation_values.dart';
part 'app_translation_phrases.dart';

class AppTranslations {
  const AppTranslations._(this.language);

  final AppLanguage language;

  static const List<Locale> supportedLocales = [Locale('ar'), Locale('en')];

  static AppTranslations of(BuildContext context) {
    final locale = Localizations.localeOf(context);
    return AppTranslations._(AppLanguage.fromCode(locale.languageCode));
  }

  static AppTranslations get current {
    return AppTranslations._(AppLanguageController.instance.value);
  }

  String _text(String key) {
    return _translationValues[language.code]?[key] ??
        _translationValues['en']?[key] ??
        key;
  }

  String phrase(String value) {
    if (value.trim().isEmpty || !language.isArabic) return value;

    final direct =
        _translationPhrases['ar']?[value] ?? _translationValues['ar']?[value];
    if (direct != null) return direct;

    if (value.endsWith(' products')) {
      if (value.startsWith('View ')) {
        final brand = value.substring(5, value.length - 9);
        return 'اعرض منتجات $brand';
      }

      final count = value.replaceFirst(' products', '');
      if (int.tryParse(count) != null) return '$count منتج';
    }

    if (value.endsWith(' product')) {
      final count = value.replaceFirst(' product', '');
      if (int.tryParse(count) != null) return '$count منتج';
    }

    if (value.startsWith('Page ')) {
      return value.replaceFirst('Page ', 'صفحة ').replaceFirst(' of ', ' من ');
    }

    if (value.endsWith(' item') || value.endsWith(' items')) {
      final count = value.replaceFirst(' items', '').replaceFirst(' item', '');
      if (int.tryParse(count) != null) return '$count منتج';
    }

    if (value.endsWith(' item(s) added to cart')) {
      final count = value.replaceFirst(' item(s) added to cart', '');
      if (int.tryParse(count) != null) return 'تمت إضافة $count منتج للسلة';
    }

    if (value.startsWith('Remove ') &&
        value.endsWith(' from your saved delivery locations?')) {
      final name = value.substring(
        7,
        value.length - ' from your saved delivery locations?'.length,
      );
      return 'تحذف $name من عناوين التوصيل المحفوظة؟';
    }

    if (value.endsWith(' is selected for checkout.')) {
      final name = value.substring(0, value.length - 26);
      return '$name محدد للدفع.';
    }

    if (value.startsWith('Qty ')) {
      return value.replaceFirst('Qty ', 'الكمية ');
    }

    if (value.startsWith('No route defined for ')) {
      return value.replaceFirst('No route defined for ', 'مفيش مسار باسم ');
    }

    if (value.startsWith('You can change your username again on ')) {
      final date = value.substring(
        'You can change your username again on '.length,
      );
      return 'تقدر تغيّر اسم المستخدم تاني في $date.';
    }

    if (value.startsWith('Your ') && value.endsWith(' has been saved.')) {
      final field = value.substring(5, value.length - 16);
      return 'تم حفظ ${phrase(field)}.';
    }

    if (value.startsWith('No ') && value.endsWith(' products yet')) {
      final brand = value.substring(3, value.length - 13);
      return 'لسه مفيش منتجات من $brand';
    }

    if (value.startsWith('No ') && value.endsWith(' items yet')) {
      final category = value.substring(3, value.length - 10);
      return 'لسه مفيش عناصر في $category';
    }

    if (value.endsWith(' copied')) {
      return 'تم نسخ ${value.substring(0, value.length - 7)}';
    }

    if (value.startsWith('Fresh ') && value.endsWith(' picks')) {
      final title = phrase(value.substring(6, value.length - 6));
      return 'اختيارات جديدة من $title';
    }

    if (value.startsWith('No results for "')) {
      final query = value.substring(16, value.length - 1);
      return 'مفيش نتائج لـ "$query"';
    }

    return value;
  }

  String get appName => _text('appName');
  String get skip => _text('skip');
  String get continueText => _text('continueText');
  String get done => _text('done');
  String get startShopping => _text('startShopping');
  String get submit => _text('submit');
  String get resendEmail => _text('resendEmail');

  String get onboardingTitle1 => _text('onboardingTitle1');
  String get onboardingDesc1 => _text('onboardingDesc1');
  String get onboardingTitle2 => _text('onboardingTitle2');
  String get onboardingDesc2 => _text('onboardingDesc2');
  String get onboardingTitle3 => _text('onboardingTitle3');
  String get onboardingDesc3 => _text('onboardingDesc3');

  String get welcomeBack => _text('welcomeBack');
  String get loginSubtitle => _text('loginSubtitle');
  String get email => _text('email');
  String get loginIdentifier => _text('loginIdentifier');
  String get password => _text('password');
  String get rememberMe => _text('rememberMe');
  String get forgetPasswordLink => _text('forgetPasswordLink');
  String get signIn => _text('signIn');
  String get signInSuccessTitle => _text('signInSuccessTitle');
  String get signInSuccessMessage => _text('signInSuccessMessage');
  String get createAccount => _text('createAccount');
  String get languageTooltip => _text('languageTooltip');
  String get signInCreateAccountTitle => _text('signInCreateAccountTitle');
  String get signInCredentialsTitle => _text('signInCredentialsTitle');
  String get signInConnectionTitle => _text('signInConnectionTitle');
  String get signInFailureTitle => _text('signInFailureTitle');

  String get createYourAccount => _text('createYourAccount');
  String get firstName => _text('firstName');
  String get lastName => _text('lastName');
  String get username => _text('username');
  String get phoneNumber => _text('phoneNumber');
  String get iAgreeTo => _text('iAgreeTo');
  String get privacyPolicy => _text('privacyPolicy');
  String get and => _text('and');
  String get termsOfUse => _text('termsOfUse');

  String get forgetPasswordTitle => _text('forgetPasswordTitle');
  String get forgetPasswordDesc => _text('forgetPasswordDesc');
  String get verifyEmailTitle => _text('verifyEmailTitle');
  String get verifyEmailDesc => _text('verifyEmailDesc');
  String get passwordResetTitle => _text('passwordResetTitle');
  String get passwordResetDesc => _text('passwordResetDesc');
  String get successTitle => _text('successTitle');
  String get successDesc => _text('successDesc');

  String get fieldRequired => _text('fieldRequired');
  String get invalidEmail => _text('invalidEmail');
  String get passwordTooShort => _text('passwordTooShort');
  String get passwordTooLong => _text('passwordTooLong');
  String get passwordWeak => _text('passwordWeak');
  String get passwordMedium => _text('passwordMedium');
  String get invalidPhone => _text('invalidPhone');

  // ---------------------------------------------------------------------------
  // Typed interpolation methods — use these instead of dynamic phrase() calls
  // to avoid fragile string-pattern matching.
  // ---------------------------------------------------------------------------

  String productCount(int count) {
    return language.isArabic
        ? '$count منتج'
        : '$count product${count == 1 ? '' : 's'}';
  }

  String searchResults(int count, String query) {
    return language.isArabic
        ? '$count نتيجة لـ "$query"'
        : '$count result${count == 1 ? '' : 's'} for "$query"';
  }

  String savedLocations(int count) {
    return language.isArabic
        ? '$count عنوان محفوظ'
        : '$count saved location${count == 1 ? '' : 's'}';
  }
}

extension AppTranslationContext on BuildContext {
  AppTranslations get translations => AppTranslations.of(this);

  String tr(String value) => translations.phrase(value);

  bool get isArabicLanguage => translations.language.isArabic;

  String productCount(int count) => translations.productCount(count);

  String searchResults(int count, String query) =>
      translations.searchResults(count, query);

  String savedLocations(int count) => translations.savedLocations(count);
}
