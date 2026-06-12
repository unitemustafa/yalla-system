import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/location/domain/entities/city_data.dart';

void main() {
  group('CityData', () {
    test('normalizes supported city names to stable slugs', () {
      expect(CityData.fromName('Sharm El Sheikh')?.slug, 'sharm-el-sheikh');
      expect(CityData.fromName('Al Qahirah Governorate')?.slug, 'cairo');
      expect(CityData.fromName('Al Iskandariyah')?.slug, 'alexandria');
      expect(CityData.fromName('Gharbia')?.slug, 'tanta');
    });

    test('normalizes supported Arabic city names to stable slugs', () {
      expect(CityData.fromName('القاهرة')?.slug, 'cairo');
      expect(CityData.fromName('إسكندرية')?.slug, 'alexandria');
      expect(CityData.fromName('شرم الشيخ')?.slug, 'sharm-el-sheikh');
      expect(CityData.fromName('الغردقة')?.slug, 'hurghada');
      expect(CityData.fromName('المنصورة')?.slug, 'mansoura');
      expect(CityData.fromName('الغربية')?.slug, 'tanta');
    });

    test('returns null for unsupported city names', () {
      expect(CityData.fromName('Aswan'), isNull);
      expect(CityData.fromSlug('aswan'), isNull);
      expect(CityData.fromName('قع'), isNull);
    });

    test('creates stable custom cities from typed names', () {
      expect(CityData.fromCustomName('Aswan')?.slug, 'aswan');
      expect(CityData.fromCustomName('  Port Said  ')?.name, 'Port Said');
      expect(CityData.fromCustomName('القليوبية')?.slug, 'القليوبية');
      expect(CityData.fromCustomName('')?.slug, isNull);
    });
  });
}
