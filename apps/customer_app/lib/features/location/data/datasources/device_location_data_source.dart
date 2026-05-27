import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';

abstract class DeviceLocationDataSource {
  Future<String?> resolveCurrentCityName();
}

class GeolocatorLocationDataSource implements DeviceLocationDataSource {
  @override
  Future<String?> resolveCurrentCityName() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw const LocationSelectionException(
        'Location services are disabled. Choose your city manually.',
      );
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw const LocationSelectionException(
        'Location permission was not granted. Choose your city manually.',
      );
    }

    final position = await Geolocator.getCurrentPosition();
    final placemarks = await placemarkFromCoordinates(
      position.latitude,
      position.longitude,
    );

    for (final placemark in placemarks) {
      final city = _firstNonEmpty([
        placemark.locality,
        placemark.subAdministrativeArea,
        placemark.administrativeArea,
      ]);
      if (city != null) return city;
    }

    return null;
  }

  String? _firstNonEmpty(List<String?> values) {
    for (final value in values) {
      final normalized = value?.trim();
      if (normalized != null && normalized.isNotEmpty) return normalized;
    }
    return null;
  }
}

class LocationSelectionException implements Exception {
  const LocationSelectionException(this.message);

  final String message;

  @override
  String toString() => message;
}
