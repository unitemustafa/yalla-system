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
      final source = RegionSource.fromString(
        await _preferences.getSelectedRegionSource(),
      );
      final customName = await _preferences.getSelectedCityName();
      final supportedCity = CityData.fromSlug(slug);
      if (supportedCity != null) {
        if (supportedCity.isGeneral &&
            customName != null &&
            customName.trim().isNotEmpty &&
            customName.trim() != CityData.general.name) {
          return ApiResult.success(
            CityData(
              name: customName.trim(),
              slug: CityData.generalSlug,
              source: RegionSource.general,
            ),
          );
        }
        return ApiResult.success(supportedCity.withSource(source));
      }

      if (slug == null || customName == null || customName.trim().isEmpty) {
        return const ApiResult.success(null);
      }

      return ApiResult.success(
        CityData(name: customName.trim(), slug: slug, source: source),
      );
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not load your selected city.'),
      );
    }
  }

  @override
  Future<ApiResult<CityData>> saveSelectedCity(CityData city) async {
    try {
      final savedCity = city;
      await _preferences.setSelectedCity(
        savedCity.slug,
        savedCity.name,
        source: savedCity.source.storageValue,
      );
      return ApiResult.success(savedCity);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not save your selected city.'),
      );
    }
  }

  @override
  Future<ApiResult<CityData>> detectCurrentLocation({
    bool requestPermission = true,
  }) async {
    try {
      return ApiResult.success(
        await _cityFromCurrentLocation(requestPermission: requestPermission),
      );
    } on LocationSelectionException catch (error) {
      return ApiResult.failure(ValidationFailure(error.message));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not use your current location.'),
      );
    }
  }

  @override
  Future<ApiResult<CityData>> useCurrentLocation() async {
    try {
      final city = await _cityFromCurrentLocation();

      await _preferences.setSelectedCity(
        city.slug,
        city.name,
        source: city.source.storageValue,
      );
      return ApiResult.success(city);
    } on LocationSelectionException catch (error) {
      return ApiResult.failure(ValidationFailure(error.message));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not use your current location.'),
      );
    }
  }

  Future<CityData> _cityFromCurrentLocation({
    bool requestPermission = true,
  }) async {
    final cityName = await _deviceLocation.resolveCurrentCityName(
      requestPermission: requestPermission,
    );
    final resolvedName = cityName?.trim();
    final city =
        CityData.fromName(resolvedName) ??
        (resolvedName == null || resolvedName.isEmpty
            ? CityData.general
            : CityData(
                name: resolvedName,
                slug: CityData.generalSlug,
                source: RegionSource.general,
              ));
    final source = city.isGeneral ? RegionSource.general : RegionSource.gps;
    return city.withSource(source);
  }

  @override
  Future<ApiResult<void>> openAppSettings() async {
    try {
      await _deviceLocation.openAppSettings();
      return const ApiResult.success(null);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not open app settings.'),
      );
    }
  }

  @override
  Future<ApiResult<void>> openLocationSettings() async {
    try {
      await _deviceLocation.openLocationSettings();
      return const ApiResult.success(null);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not open location settings.'),
      );
    }
  }
}
