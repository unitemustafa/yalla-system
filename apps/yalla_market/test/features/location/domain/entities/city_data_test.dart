import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/location/domain/entities/city_data.dart';

void main() {
  group('CityData', () {
    setUp(() {
      CityData.replaceSupported(const [
        CityData(name: 'Cairo', slug: 'cairo'),
        CityData(name: 'Sharm El Sheikh', slug: 'sharm-el-sheikh'),
      ]);
    });
    test('normalizes supported city names to stable slugs', () {
      expect(CityData.fromName('cairo')?.slug, 'cairo');
      expect(CityData.fromName('Sharm El Sheikh')?.slug, 'sharm-el-sheikh');
      expect(CityData.fromName('Sharm El Shaykh')?.slug, 'sharm-el-sheikh');
      expect(CityData.fromName('Al Qahirah Governorate')?.slug, 'cairo');
      expect(CityData.fromName('Cairo Governorate')?.slug, 'cairo');
      expect(
        CityData.fromName('South Sinai Governorate')?.slug,
        'sharm-el-sheikh',
      );
    });

    test('maps supported governorate districts to their region', () {
      expect(CityData.fromName('Nasr City')?.slug, 'cairo');
      expect(CityData.fromName('New Cairo')?.slug, 'cairo');
      expect(CityData.fromName('Fifth Settlement')?.slug, 'cairo');
      expect(CityData.fromName('Al Ehsaneyah')?.slug, 'cairo');
      expect(CityData.fromName('Naama Bay')?.slug, 'sharm-el-sheikh');
      expect(CityData.fromName('Nabq')?.slug, 'sharm-el-sheikh');
    });

    test('normalizes supported Arabic city names to stable slugs', () {
      expect(CityData.fromName('القاهرة')?.slug, 'cairo');
      expect(CityData.fromName('شرم الشيخ')?.slug, 'sharm-el-sheikh');
      expect(CityData.fromName('جنوب سيناء')?.slug, 'sharm-el-sheikh');
    });

    test('returns null for unsupported city names', () {
      expect(CityData.fromName('Al Iskandariyah'), isNull);
      expect(CityData.fromName('Aswan'), isNull);
      expect(CityData.fromName('الغردقة'), isNull);
      expect(CityData.fromSlug('aswan'), isNull);
      expect(CityData.fromName('قع'), isNull);
    });

    test('creates stable custom cities from typed names', () {
      expect(CityData.fromCustomName('Aswan')?.slug, 'aswan');
      expect(CityData.fromCustomName('  Port Said  ')?.name, 'Port Said');
      expect(CityData.fromCustomName('القليوبية')?.slug, 'القليوبية');
      expect(CityData.fromCustomName('')?.slug, isNull);
    });

    test('cleans governorate suffixes from display names', () {
      expect(CityData.cleanRegionName('Dakahlia Governorate'), 'Dakahlia');
      expect(CityData.cleanRegionName('محافظة الدقهلية'), 'الدقهلية');
    });

    test('shows Egyptian regions in Arabic when requested', () {
      const dakahlia = CityData(
        name: 'Dakahlia Governorate',
        slug: CityData.generalSlug,
        source: RegionSource.general,
      );
      const mansoura = CityData(
        name: 'Mansoura',
        slug: CityData.generalSlug,
        source: RegionSource.general,
      );

      expect(dakahlia.displayName(arabic: true), 'الدقهلية');
      expect(mansoura.displayName(arabic: true), 'المنصورة');
      expect(dakahlia.displayName(arabic: false), 'Dakahlia');
    });
  });
}
