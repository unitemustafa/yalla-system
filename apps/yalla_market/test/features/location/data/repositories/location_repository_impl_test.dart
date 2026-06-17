import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:yalla_market/features/location/data/datasources/device_location_data_source.dart';
import 'package:yalla_market/features/location/data/datasources/location_preferences.dart';
import 'package:yalla_market/features/location/data/repositories/location_repository_impl.dart';
import 'package:yalla_market/features/location/domain/entities/city_data.dart';

void main() {
  group('LocationRepositoryImpl', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('saves and loads the selected city from preferences', () async {
      final repository = LocationRepositoryImpl(
        LocationPreferences(),
        _FakeDeviceLocationDataSource(),
      );

      final saveResult = await repository.saveSelectedCity(
        const CityData(name: 'Hurghada', slug: 'hurghada'),
      );
      final loadResult = await repository.getSelectedCity();

      saveResult.when(
        success: (city) => expect(city.slug, 'hurghada'),
        failure: (failure) => fail(failure.message),
      );
      loadResult.when(
        success: (city) => expect(city?.name, 'Hurghada'),
        failure: (failure) => fail(failure.message),
      );
    });

    test('saves and loads a custom selected city from preferences', () async {
      final repository = LocationRepositoryImpl(
        LocationPreferences(),
        _FakeDeviceLocationDataSource(),
      );

      final saveResult = await repository.saveSelectedCity(
        const CityData(name: 'Aswan', slug: 'aswan'),
      );
      final loadResult = await repository.getSelectedCity();

      saveResult.when(
        success: (city) => expect(city.name, 'Aswan'),
        failure: (failure) => fail(failure.message),
      );
      loadResult.when(
        success: (city) {
          expect(city?.name, 'Aswan');
          expect(city?.slug, 'aswan');
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test(
      'uses current location and normalizes it to a supported city',
      () async {
        final repository = LocationRepositoryImpl(
          LocationPreferences(),
          _FakeDeviceLocationDataSource(cityName: 'Al Qahirah Governorate'),
        );

        final result = await repository.useCurrentLocation();

        result.when(
          success: (city) => expect(city.slug, 'cairo'),
          failure: (failure) => fail(failure.message),
        );
      },
    );

    test('detects current location without saving it', () async {
      final repository = LocationRepositoryImpl(
        LocationPreferences(),
        _FakeDeviceLocationDataSource(cityName: 'Al Qahirah Governorate'),
      );

      final detectResult = await repository.detectCurrentLocation();
      final loadResult = await repository.getSelectedCity();

      detectResult.when(
        success: (city) => expect(city.slug, 'cairo'),
        failure: (failure) => fail(failure.message),
      );
      loadResult.when(
        success: (city) => expect(city, isNull),
        failure: (failure) => fail(failure.message),
      );
    });

    test(
      'falls back to general when current location is outside supported regions',
      () async {
        final repository = LocationRepositoryImpl(
          LocationPreferences(),
          _FakeDeviceLocationDataSource(cityName: 'Aswan'),
        );

        final result = await repository.useCurrentLocation();

        result.when(
          success: (city) {
            expect(city.name, 'Aswan');
            expect(city.slug, CityData.generalSlug);
            expect(city.source, RegionSource.general);
          },
          failure: (failure) => fail(failure.message),
        );

        final loadResult = await repository.getSelectedCity();
        loadResult.when(
          success: (city) {
            expect(city?.name, 'Aswan');
            expect(city?.slug, CityData.generalSlug);
          },
          failure: (failure) => fail(failure.message),
        );
      },
    );
  });
}

class _FakeDeviceLocationDataSource implements DeviceLocationDataSource {
  const _FakeDeviceLocationDataSource({this.cityName});

  final String? cityName;

  @override
  Future<String?> resolveCurrentCityName({
    bool requestPermission = true,
  }) async {
    return cityName;
  }

  @override
  Future<void> openAppSettings() async {}

  @override
  Future<void> openLocationSettings() async {}
}
