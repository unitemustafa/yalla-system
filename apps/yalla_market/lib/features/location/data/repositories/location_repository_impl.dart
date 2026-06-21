import 'package:dio/dio.dart';

import '../../../../core/errors/api_error_handler.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/city_data.dart';
import '../../domain/repositories/location_repository.dart';
import '../datasources/device_location_data_source.dart';
import '../datasources/location_preferences.dart';

class LocationRepositoryImpl implements LocationRepository {
  const LocationRepositoryImpl(
    this._preferences,
    this._deviceLocation,
    this._apiClient,
  );

  final LocationPreferences _preferences;
  final DeviceLocationDataSource _deviceLocation;
  final ApiClient _apiClient;

  @override
  Future<ApiResult<List<CityData>>> getCities() {
    return _guard(() async {
      final payload = await _apiClient.get<Object?>('/cities');
      final rawCities = payload is List
          ? payload
          : payload is Map<String, dynamic>
          ? payload['cities'] ?? payload['results']
          : null;
      final cities = rawCities is List
          ? rawCities
                .whereType<Map>()
                .map(
                  (item) => CityData.fromJson(Map<String, dynamic>.from(item)),
                )
                .toList(growable: false)
          : const <CityData>[];
      CityData.replaceSupported(cities);
      return cities;
    });
  }

  @override
  Future<ApiResult<CityData?>> getSelectedCity() {
    return _guard(() async {
      await getCities();
      final payload = await _apiClient.get<Map<String, dynamic>>('/auth/me');
      final rawUser = payload['user'];
      final rawCity = rawUser is Map ? rawUser['current_city'] : null;
      if (rawCity is Map) {
        final city = CityData.fromJson(Map<String, dynamic>.from(rawCity));
        await _savePreference(city);
        return city;
      }
      return null;
    });
  }

  @override
  Future<ApiResult<CityData>> saveSelectedCity(CityData city) {
    return _guard(() async {
      final payload = await _apiClient.post<Map<String, dynamic>>(
        '/location/select',
        data: {'city_id': city.slug},
      );
      final selected = _cityFromResolution(payload, RegionSource.manual);
      await _savePreference(selected);
      return selected;
    });
  }

  @override
  Future<ApiResult<CityData>> detectCurrentLocation({
    bool requestPermission = true,
  }) {
    return _guard(() async {
      final coordinates = await _deviceLocation.currentCoordinates(
        requestPermission: requestPermission,
      );
      final payload = await _apiClient.post<Map<String, dynamic>>(
        '/location/resolve',
        data: {
          'latitude': coordinates.latitude,
          'longitude': coordinates.longitude,
        },
      );
      final city = _cityFromResolution(payload, RegionSource.gps);
      await _savePreference(city);
      return city;
    });
  }

  @override
  Future<ApiResult<CityData>> useCurrentLocation() {
    return detectCurrentLocation();
  }

  @override
  Future<ApiResult<void>> openAppSettings() {
    return _guard(() async => _deviceLocation.openAppSettings());
  }

  @override
  Future<ApiResult<void>> openLocationSettings() {
    return _guard(() async => _deviceLocation.openLocationSettings());
  }

  CityData _cityFromResolution(
    Map<String, dynamic> payload,
    RegionSource fallbackSource,
  ) {
    final rawCity = payload['city'];
    if (rawCity is! Map) {
      throw const FormatException('Location response did not include a city.');
    }
    return CityData.fromJson(
      Map<String, dynamic>.from(rawCity),
      source: RegionSource.fromString(
        payload['source']?.toString() ?? fallbackSource.name,
      ),
      cityChanged: payload['city_changed'] == true,
    );
  }

  Future<void> _savePreference(CityData city) {
    return _preferences.setSelectedCity(
      city.slug,
      city.name,
      source: city.source.storageValue,
    );
  }

  Future<ApiResult<T>> _guard<T>(Future<T> Function() action) async {
    try {
      return ApiResult.success(await action());
    } on LocationSelectionException catch (error) {
      return ApiResult.failure(ValidationFailure(error.message));
    } on DioException catch (error) {
      return ApiResult.failure(ApiErrorHandler.handle(error));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not resolve your city.'),
      );
    }
  }
}
