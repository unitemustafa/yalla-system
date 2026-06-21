import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:yalla_market/features/location/data/datasources/device_location_data_source.dart';
import 'package:yalla_market/features/location/data/datasources/location_preferences.dart';
import 'package:yalla_market/features/location/data/repositories/location_repository_impl.dart';
import 'package:yalla_market/features/location/domain/entities/city_data.dart';

import '../../../../helpers/fake_api_client.dart';

void main() {
  group('LocationRepositoryImpl', () {
    setUp(() => SharedPreferences.setMockInitialValues({}));

    test('loads cities from the backend', () async {
      final repository = LocationRepositoryImpl(
        LocationPreferences(),
        const _FakeDeviceLocationDataSource(),
        FakeApiClient((request) {
          expect(request.path, '/cities');
          return [
            {'id': 'tripoli', 'slug': 'tripoli', 'name': 'Tripoli'},
          ];
        }),
      );

      final result = await repository.getCities();
      result.when(
        success: (cities) => expect(cities.single.slug, 'tripoli'),
        failure: (failure) => fail(failure.message),
      );
    });

    test(
      'sends coordinates to backend resolution without reverse geocoding',
      () async {
        final apiClient = FakeApiClient((request) {
          expect(request.path, '/location/resolve');
          expect(request.data, {'latitude': 32.88, 'longitude': 13.19});
          return {
            'city': {'id': 'tripoli', 'slug': 'tripoli', 'name': 'Tripoli'},
            'source': 'gps',
            'city_changed': true,
          };
        });
        final repository = LocationRepositoryImpl(
          LocationPreferences(),
          const _FakeDeviceLocationDataSource(),
          apiClient,
        );

        final result = await repository.useCurrentLocation();
        result.when(
          success: (city) {
            expect(city.slug, 'tripoli');
            expect(city.cityChanged, isTrue);
          },
          failure: (failure) => fail(failure.message),
        );
      },
    );

    test('manual selection sends backend city id', () async {
      final apiClient = FakeApiClient((request) {
        expect(request.path, '/location/select');
        expect(request.data, {'city_id': 'tripoli'});
        return {
          'city': {'id': 'tripoli', 'slug': 'tripoli', 'name': 'Tripoli'},
          'source': 'manual',
          'city_changed': false,
        };
      });
      final repository = LocationRepositoryImpl(
        LocationPreferences(),
        const _FakeDeviceLocationDataSource(),
        apiClient,
      );

      final result = await repository.saveSelectedCity(
        const CityData(name: 'Tripoli', slug: 'tripoli'),
      );
      result.when(
        success: (city) => expect(city.slug, 'tripoli'),
        failure: (failure) => fail(failure.message),
      );
    });
  });
}

class _FakeDeviceLocationDataSource implements DeviceLocationDataSource {
  const _FakeDeviceLocationDataSource();

  @override
  Future<DeviceCoordinates> currentCoordinates({
    bool requestPermission = true,
  }) async {
    return const DeviceCoordinates(latitude: 32.88, longitude: 13.19);
  }

  @override
  Future<void> openAppSettings() async {}

  @override
  Future<void> openLocationSettings() async {}
}
