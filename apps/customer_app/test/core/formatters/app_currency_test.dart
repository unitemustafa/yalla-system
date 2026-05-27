import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/formatters/app_currency.dart';

void main() {
  group('AppCurrency', () {
    test('formats numeric values with the shared Egyptian pound label', () {
      expect(AppCurrency.format(120), 'EGP 120');
      expect(AppCurrency.format(84.5, fractionDigits: 2), 'EGP 84.50');
    });

    test('normalizes EGP and Arabic currency text from product prices', () {
      expect(
        AppCurrency.formatPriceText('EGP 120.00 - EGP 180.00'),
        'EGP 120 - EGP 180',
      );
      expect(AppCurrency.formatPriceText('35 ج.م'), 'EGP 35');
    });

    test('extracts numeric parts for rich currency widgets', () {
      expect(AppCurrency.priceNumbers('EGP 24.50 - EGP 32.00'), [
        '24.50',
        '32.00',
      ]);
    });
  });
}
