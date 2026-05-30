import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/localization/app_language_controller.dart';
import 'package:yalla_market/core/utils/validators.dart';

void main() {
  setUp(() {
    AppLanguageController.instance.value = AppLanguage.english;
  });

  group('Validators', () {
    test('required rejects blank values', () {
      expect(Validators.required(null), 'This field is required');
      expect(Validators.required('   '), 'This field is required');
      expect(Validators.required('Yalla'), isNull);
    });

    test('email validates required, invalid, and valid addresses', () {
      expect(Validators.email(''), 'This field is required');
      expect(Validators.email('not-an-email'), 'Please enter a valid email');
      expect(Validators.email(' shopper@yallamarket.com '), isNull);
    });

    test(
      'password strength classifies empty, weak, medium, and strong input',
      () {
        expect(Validators.passwordStrength(''), PasswordStrength.empty);
        expect(Validators.passwordStrength('abc'), PasswordStrength.weak);
        expect(
          Validators.passwordStrength('Abcdefgh'),
          PasswordStrength.medium,
        );
        expect(
          Validators.passwordStrength('Abcdef1!'),
          PasswordStrength.strong,
        );
      },
    );

    test('password validator enforces length and strength rules', () {
      expect(Validators.password(''), 'This field is required');
      expect(
        Validators.password('Abc1!'),
        'Password must be at least 8 characters',
      );
      final tooLongPassword = List.filled(73, 'a').join();
      expect(
        Validators.password(tooLongPassword),
        'Password must be 72 characters or fewer.',
      );
      expect(
        Validators.password('abcdefgh'),
        'Weak password. Use uppercase, lowercase, a number, and a symbol.',
      );
      expect(
        Validators.password('Abcdefgh'),
        'Medium password. Add more variety to make it strong.',
      );
      expect(Validators.password('Abcdef1!'), isNull);
    });

    test('phone validates required and minimum length', () {
      expect(Validators.phone(''), 'This field is required');
      expect(Validators.phone('12345'), 'Please enter a valid phone number');
      expect(Validators.phone('01012345678'), isNull);
    });
  });
}
