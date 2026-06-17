import '../../../../core/network/api_result.dart';
import '../entities/city_data.dart';
import '../repositories/location_repository.dart';

class GetSelectedCityUseCase {
  const GetSelectedCityUseCase(this._repository);

  final LocationRepository _repository;

  Future<ApiResult<CityData?>> call() {
    return _repository.getSelectedCity();
  }
}

class SaveSelectedCityUseCase {
  const SaveSelectedCityUseCase(this._repository);

  final LocationRepository _repository;

  Future<ApiResult<CityData>> call(
    CityData city, {
    RegionSource source = RegionSource.manual,
  }) {
    return _repository.saveSelectedCity(city.withSource(source));
  }
}

class UseCurrentLocationUseCase {
  const UseCurrentLocationUseCase(this._repository);

  final LocationRepository _repository;

  Future<ApiResult<CityData>> call() {
    return _repository.useCurrentLocation();
  }
}

class DetectCurrentLocationUseCase {
  const DetectCurrentLocationUseCase(this._repository);

  final LocationRepository _repository;

  Future<ApiResult<CityData>> call({bool requestPermission = true}) {
    return _repository.detectCurrentLocation(
      requestPermission: requestPermission,
    );
  }
}

class OpenLocationAppSettingsUseCase {
  const OpenLocationAppSettingsUseCase(this._repository);

  final LocationRepository _repository;

  Future<ApiResult<void>> call() {
    return _repository.openAppSettings();
  }
}

class OpenDeviceLocationSettingsUseCase {
  const OpenDeviceLocationSettingsUseCase(this._repository);

  final LocationRepository _repository;

  Future<ApiResult<void>> call() {
    return _repository.openLocationSettings();
  }
}

class LocationUseCases {
  const LocationUseCases({
    required this.getSelectedCity,
    required this.saveSelectedCity,
    required this.detectCurrentLocation,
    required this.useCurrentLocation,
    required this.openAppSettings,
    required this.openLocationSettings,
  });

  final GetSelectedCityUseCase getSelectedCity;
  final SaveSelectedCityUseCase saveSelectedCity;
  final DetectCurrentLocationUseCase detectCurrentLocation;
  final UseCurrentLocationUseCase useCurrentLocation;
  final OpenLocationAppSettingsUseCase openAppSettings;
  final OpenDeviceLocationSettingsUseCase openLocationSettings;
}
