import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/city_data.dart';
import '../../domain/usecases/location_usecases.dart';
import 'location_state.dart';

class LocationCubit extends Cubit<LocationState> {
  LocationCubit(this._useCases) : super(const LocationInitial());

  final LocationUseCases _useCases;

  Future<List<CityData>> loadCities() async {
    final result = await _useCases.getCities();
    return result.when(
      success: (cities) {
        emit(LocationReady(state.selectedCity));
        return cities;
      },
      failure: (failure) {
        emit(LocationFailure(failure.message, state.selectedCity));
        return const [];
      },
    );
  }

  /// Hydrates city state from an already-resolved city (e.g. from SplashCubit).
  void syncCity(CityData? city) => emit(LocationReady(city));

  Future<CityData?> loadSelectedCity() async {
    emit(LocationLoading(state.selectedCity));
    await _useCases.getCities();

    final result = await _useCases.getSelectedCity();
    return result.when(
      success: (city) {
        emit(LocationReady(city));
        return city;
      },
      failure: (failure) {
        emit(LocationFailure(failure.message, state.selectedCity));
        return state.selectedCity;
      },
    );
  }

  Future<CityData?> selectCity(
    CityData city, {
    RegionSource source = RegionSource.manual,
  }) async {
    emit(LocationSaving(state.selectedCity));

    final result = await _useCases.saveSelectedCity(city, source: source);
    return result.when(
      success: (savedCity) {
        emit(LocationReady(savedCity));
        return savedCity;
      },
      failure: (failure) {
        emit(LocationFailure(failure.message, state.selectedCity));
        return null;
      },
    );
  }

  Future<CityData?> selectGeneralRegion() {
    return selectCity(CityData.general, source: RegionSource.general);
  }

  Future<CityData?> detectCurrentLocation() async {
    emit(LocationDetecting(state.selectedCity));

    final result = await _useCases.detectCurrentLocation();
    return result.when(
      success: (city) {
        emit(LocationReady(city));
        return city;
      },
      failure: (failure) {
        emit(LocationFailure(failure.message, state.selectedCity));
        return null;
      },
    );
  }

  Future<CityData?> previewCurrentLocation() async {
    final result = await _useCases.detectCurrentLocation(
      requestPermission: false,
    );
    return result.when(success: (city) => city, failure: (_) => null);
  }

  Future<CityData?> useCurrentLocation() async {
    emit(LocationDetecting(state.selectedCity));

    final result = await _useCases.useCurrentLocation();
    return result.when(
      success: (city) {
        emit(LocationReady(city));
        return city;
      },
      failure: (failure) {
        emit(LocationFailure(failure.message, state.selectedCity));
        return null;
      },
    );
  }

  Future<void> openAppSettings() async {
    await _useCases.openAppSettings();
  }

  Future<void> openLocationSettings() async {
    await _useCases.openLocationSettings();
  }
}
