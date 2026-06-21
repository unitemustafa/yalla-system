import 'dart:async';

import 'package:geolocator/geolocator.dart';

class DeviceCoordinates {
  const DeviceCoordinates({required this.latitude, required this.longitude});

  final double latitude;
  final double longitude;
}

abstract class DeviceLocationDataSource {
  Future<DeviceCoordinates> currentCoordinates({bool requestPermission = true});

  Future<void> openAppSettings();

  Future<void> openLocationSettings();
}

class GeolocatorLocationDataSource implements DeviceLocationDataSource {
  static const _currentPositionTimeout = Duration(seconds: 12);

  @override
  Future<DeviceCoordinates> currentCoordinates({
    bool requestPermission = true,
  }) async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied && requestPermission) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      throw const LocationSelectionException(
        'Location permission was denied. Allow it or choose a city manually.',
      );
    }
    if (permission == LocationPermission.deniedForever) {
      throw const LocationSelectionException(
        'Location permission is blocked. Open app settings or choose a city manually.',
      );
    }
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw const LocationSelectionException(
        'Location services are disabled. Turn on GPS or choose a city manually.',
      );
    }

    Position? position;
    try {
      position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: _currentPositionTimeout,
        ),
      );
    } on TimeoutException {
      position = await Geolocator.getLastKnownPosition();
    } catch (_) {
      position = await Geolocator.getLastKnownPosition();
    }
    if (position == null) {
      throw const LocationSelectionException(
        'Could not determine your coordinates. Try again or choose a city manually.',
      );
    }
    return DeviceCoordinates(
      latitude: position.latitude,
      longitude: position.longitude,
    );
  }

  @override
  Future<void> openAppSettings() => Geolocator.openAppSettings();

  @override
  Future<void> openLocationSettings() => Geolocator.openLocationSettings();
}

class LocationSelectionException implements Exception {
  const LocationSelectionException(this.message);

  final String message;

  @override
  String toString() => message;
}
