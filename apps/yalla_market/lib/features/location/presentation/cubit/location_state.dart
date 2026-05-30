import '../../domain/entities/city_data.dart';

sealed class LocationState {
  const LocationState(this.selectedCity);

  final CityData? selectedCity;
}

final class LocationInitial extends LocationState {
  const LocationInitial() : super(null);
}

final class LocationLoading extends LocationState {
  const LocationLoading(super.selectedCity);
}

final class LocationSaving extends LocationState {
  const LocationSaving(super.selectedCity);
}

final class LocationDetecting extends LocationState {
  const LocationDetecting(super.selectedCity);
}

final class LocationReady extends LocationState {
  const LocationReady(super.selectedCity);
}

final class LocationFailure extends LocationState {
  const LocationFailure(this.message, super.selectedCity);

  final String message;
}
