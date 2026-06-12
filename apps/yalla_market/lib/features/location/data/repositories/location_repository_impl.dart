import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/city_data.dart';
import '../../domain/repositories/location_repository.dart';
import '../datasources/device_location_data_source.dart';
import '../datasources/location_preferences.dart';

class LocationRepositoryImpl implements LocationRepository {
  const LocationRepositoryImpl(this._preferences, this._deviceLocation);

  final LocationPreferences _preferences;
  final DeviceLocationDataSource _deviceLocation;

  @override
  Future<ApiResult<CityData?>> getSelectedCity() async {
    try {
      final slug = await _preferences.getSelectedCitySlug();
      final supportedCity = CityData.fromSlug(slug);
      if (supportedCity != null) return ApiResult.success(supportedCity);

      final customName = await _preferences.getSelectedCityName();
      if (slug == null || customName == null || customName.trim().isEmpty) {
        return const ApiResult.success(null);
      }

      return ApiResult.success(CityData(name: customName.trim(), slug: slug));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not load your selected city.'),
      );
    }
  }

  @override
  Future<ApiResult<CityData>> saveSelectedCity(CityData city) async {
    try {
      await _preferences.setSelectedCity(city.slug, city.name);
      return ApiResult.success(city);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not save your selected city.'),
      );
    }
  }

  @override
  Future<ApiResult<CityData>> useCurrentLocation() async {
    try {
      final cityName = await _deviceLocation.resolveCurrentCityName();
      final city = CityData.fromName(cityName);
      if (city == null) {
        return const ApiResult.failure(
          ValidationFailure(
            'We could not detect a supported city. Choose one manually.',
          ),
        );
      }

      await _preferences.setSelectedCity(city.slug, city.name);
      return ApiResult.success(city);
    } on LocationSelectionException catch (error) {
      return ApiResult.failure(ValidationFailure(error.message));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not use your current location.'),
      );
    }
  }
}
