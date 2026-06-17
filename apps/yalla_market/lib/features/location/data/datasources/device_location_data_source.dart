import 'dart:async';

import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';

import '../../domain/entities/city_data.dart';

abstract class DeviceLocationDataSource {
  Future<String?> resolveCurrentCityName({bool requestPermission = true});

  Future<void> openAppSettings();

  Future<void> openLocationSettings();
}

class GeolocatorLocationDataSource implements DeviceLocationDataSource {
  static const _currentPositionTimeout = Duration(seconds: 12);
  static const _reverseGeocodeTimeout = Duration(seconds: 8);

  @override
  Future<String?> resolveCurrentCityName({
    bool requestPermission = true,
  }) async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied && requestPermission) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw const LocationSelectionException(
        'Location permission was not granted. Allow location to continue.',
      );
    }

    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw const LocationSelectionException(
        'Location services are disabled. Turn on GPS to continue.',
      );
    }

    final position = await _resolvePosition();
    final placemarks = await _resolvePlacemarks(position);

    String? fallbackLocationName;
    for (final placemark in placemarks) {
      final locationNames = [
        placemark.locality,
        placemark.subLocality,
        placemark.subAdministrativeArea,
        placemark.administrativeArea,
        placemark.name,
        placemark.street,
        placemark.thoroughfare,
      ];
      fallbackLocationName ??= _bestFallbackRegionName(placemark);

      for (final name in locationNames) {
        final normalized = name?.trim();
        if (normalized == null || normalized.isEmpty) continue;
        if (CityData.fromName(normalized) != null) return normalized;
      }

      final combinedLocationName = _nonEmptyValues(locationNames).join(' ');
      if (CityData.fromName(combinedLocationName) != null) {
        return combinedLocationName;
      }
    }

    return fallbackLocationName;
  }

  Future<List<Placemark>> _resolvePlacemarks(Position position) async {
    try {
      return await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      ).timeout(_reverseGeocodeTimeout);
    } on TimeoutException {
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<Position> _resolvePosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: _currentPositionTimeout,
        ),
      );
    } on TimeoutException {
      final lastKnownPosition = await Geolocator.getLastKnownPosition();
      if (lastKnownPosition != null) return lastKnownPosition;

      throw const LocationSelectionException(
        'Could not find your current location. Choose one manually.',
      );
    } catch (_) {
      final lastKnownPosition = await Geolocator.getLastKnownPosition();
      if (lastKnownPosition != null) return lastKnownPosition;

      rethrow;
    }
  }

  @override
  Future<void> openAppSettings() => Geolocator.openAppSettings();

  @override
  Future<void> openLocationSettings() => Geolocator.openLocationSettings();

  String? _firstNonEmpty(List<String?> values) {
    for (final value in _nonEmptyValues(values)) {
      return value;
    }
    return null;
  }

  String? _bestFallbackRegionName(Placemark placemark) {
    return _firstNonEmpty([
      placemark.administrativeArea,
      placemark.subAdministrativeArea,
      placemark.locality,
      placemark.subLocality,
    ]);
  }

  List<String> _nonEmptyValues(List<String?> values) {
    final normalizedValues = <String>[];
    for (final value in values) {
      final normalized = value?.trim();
      if (normalized != null && normalized.isNotEmpty) {
        normalizedValues.add(normalized);
      }
    }
    return normalizedValues;
  }
}

class LocationSelectionException implements Exception {
  const LocationSelectionException(this.message);

  final String message;

  @override
  String toString() => message;
}
