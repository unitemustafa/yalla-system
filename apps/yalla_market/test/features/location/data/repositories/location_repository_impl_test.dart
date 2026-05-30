import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:yalla_market/core/errors/failure.dart';
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

    test(
      'returns validation failure when current location is unsupported',
      () async {
        final repository = LocationRepositoryImpl(
          LocationPreferences(),
          _FakeDeviceLocationDataSource(cityName: 'Aswan'),
        );

        final result = await repository.useCurrentLocation();

        result.when(
          success: (_) => fail('Unsupported city should not resolve.'),
          failure: (failure) {
            expect(failure, isA<ValidationFailure>());
            expect(failure.message, contains('supported city'));
          },
        );
      },
    );
  });
}

class _FakeDeviceLocationDataSource implements DeviceLocationDataSource {
  const _FakeDeviceLocationDataSource({this.cityName});

  final String? cityName;

  @override
  Future<String?> resolveCurrentCityName() async {
    return cityName;
  }
}
