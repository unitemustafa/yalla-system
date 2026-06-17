import 'package:get_it/get_it.dart';

import '../../../features/location/data/datasources/device_location_data_source.dart';
import '../../../features/location/data/datasources/location_preferences.dart';
import '../../../features/location/data/repositories/location_repository_impl.dart';
import '../../../features/location/domain/repositories/location_repository.dart';
import '../../../features/location/domain/usecases/location_usecases.dart';
import '../../../features/location/presentation/cubit/location_cubit.dart';

void registerLocationDependencies(GetIt sl) {
  if (!sl.isRegistered<LocationPreferences>()) {
    sl.registerLazySingleton(LocationPreferences.new);
  }
  if (!sl.isRegistered<DeviceLocationDataSource>()) {
    sl.registerLazySingleton<DeviceLocationDataSource>(
      GeolocatorLocationDataSource.new,
    );
  }
  if (!sl.isRegistered<LocationRepository>()) {
    sl.registerLazySingleton<LocationRepository>(
      () => LocationRepositoryImpl(
        sl<LocationPreferences>(),
        sl<DeviceLocationDataSource>(),
      ),
    );
  }
  if (!sl.isRegistered<GetSelectedCityUseCase>()) {
    sl.registerLazySingleton(
      () => GetSelectedCityUseCase(sl<LocationRepository>()),
    );
  }
  if (!sl.isRegistered<SaveSelectedCityUseCase>()) {
    sl.registerLazySingleton(
      () => SaveSelectedCityUseCase(sl<LocationRepository>()),
    );
  }
  if (!sl.isRegistered<UseCurrentLocationUseCase>()) {
    sl.registerLazySingleton(
      () => UseCurrentLocationUseCase(sl<LocationRepository>()),
    );
  }
  if (!sl.isRegistered<DetectCurrentLocationUseCase>()) {
    sl.registerLazySingleton(
      () => DetectCurrentLocationUseCase(sl<LocationRepository>()),
    );
  }
  if (!sl.isRegistered<OpenLocationAppSettingsUseCase>()) {
    sl.registerLazySingleton(
      () => OpenLocationAppSettingsUseCase(sl<LocationRepository>()),
    );
  }
  if (!sl.isRegistered<OpenDeviceLocationSettingsUseCase>()) {
    sl.registerLazySingleton(
      () => OpenDeviceLocationSettingsUseCase(sl<LocationRepository>()),
    );
  }
  if (!sl.isRegistered<LocationUseCases>()) {
    sl.registerLazySingleton(
      () => LocationUseCases(
        getSelectedCity: sl<GetSelectedCityUseCase>(),
        saveSelectedCity: sl<SaveSelectedCityUseCase>(),
        detectCurrentLocation: sl<DetectCurrentLocationUseCase>(),
        useCurrentLocation: sl<UseCurrentLocationUseCase>(),
        openAppSettings: sl<OpenLocationAppSettingsUseCase>(),
        openLocationSettings: sl<OpenDeviceLocationSettingsUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<LocationCubit>()) {
    sl.registerFactory(() => LocationCubit(sl<LocationUseCases>()));
  }
}
