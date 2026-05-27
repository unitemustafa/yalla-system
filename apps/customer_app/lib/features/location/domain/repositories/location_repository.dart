import '../../../../core/network/api_result.dart';
import '../entities/city_data.dart';

abstract class LocationRepository {
  Future<ApiResult<CityData?>> getSelectedCity();

  Future<ApiResult<CityData>> saveSelectedCity(CityData city);

  Future<ApiResult<CityData>> useCurrentLocation();
}
