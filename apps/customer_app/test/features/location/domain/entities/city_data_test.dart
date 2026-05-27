import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/features/location/domain/entities/city_data.dart';

void main() {
  group('CityData', () {
    test('normalizes supported city names to stable slugs', () {
      expect(CityData.fromName('Sharm El Sheikh')?.slug, 'sharm-el-sheikh');
      expect(CityData.fromName('Al Qahirah Governorate')?.slug, 'cairo');
      expect(CityData.fromName('Al Iskandariyah')?.slug, 'alexandria');
      expect(CityData.fromName('Gharbia')?.slug, 'tanta');
    });

    test('returns null for unsupported city names', () {
      expect(CityData.fromName('Aswan'), isNull);
      expect(CityData.fromSlug('aswan'), isNull);
    });
  });
}
