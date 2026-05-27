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

  Future<ApiResult<CityData>> call(CityData city) {
    return _repository.saveSelectedCity(city);
  }
}

class UseCurrentLocationUseCase {
  const UseCurrentLocationUseCase(this._repository);

  final LocationRepository _repository;

  Future<ApiResult<CityData>> call() {
    return _repository.useCurrentLocation();
  }
}

class LocationUseCases {
  const LocationUseCases({
    required this.getSelectedCity,
    required this.saveSelectedCity,
    required this.useCurrentLocation,
  });

  final GetSelectedCityUseCase getSelectedCity;
  final SaveSelectedCityUseCase saveSelectedCity;
  final UseCurrentLocationUseCase useCurrentLocation;
}
