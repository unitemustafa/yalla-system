class AddressData {
  const AddressData({
    required this.id,
    required this.name,
    required this.phoneNumber,
    required this.street,
    required this.postalCode,
    required this.city,
    required this.state,
    required this.country,
    this.latitude,
    this.longitude,
    this.isDefault = false,
  });

  final String id;
  final String name;
  final String phoneNumber;
  final String street;
  final String postalCode;
  final String city;
  final String state;
  final String country;
  final double? latitude;
  final double? longitude;
  final bool isDefault;

  factory AddressData.fromJson(Map<String, dynamic> json) {
    return AddressData(
      id: json['id']?.toString() ?? '',
      name:
          json['name']?.toString() ??
          json['fullName']?.toString() ??
          json['full_name']?.toString() ??
          '',
      phoneNumber:
          json['phoneNumber']?.toString() ??
          json['phone_number']?.toString() ??
          json['phone']?.toString() ??
          '',
      street:
          json['street']?.toString() ??
          json['line1']?.toString() ??
          json['address']?.toString() ??
          '',
      postalCode:
          json['postalCode']?.toString() ??
          json['postal_code']?.toString() ??
          '',
      city: _cityName(json['city']),
      state: json['state']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      latitude: _doubleFromJson(json['latitude']),
      longitude: _doubleFromJson(json['longitude']),
      isDefault:
          json['isDefault'] as bool? ??
          json['is_default'] as bool? ??
          json['default'] as bool? ??
          json['selected'] as bool? ??
          false,
    );
  }

  String get fullAddress {
    final parts = [
      street,
      city,
      state,
      country,
    ].where((part) => part.trim().isNotEmpty).toList();

    return parts.join(', ');
  }

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'name': name,
      'phoneNumber': phoneNumber,
      'street': street,
      'postalCode': postalCode,
      'city': city,
      'state': state,
      'country': country,
      'latitude': latitude,
      'longitude': longitude,
      'isDefault': isDefault,
    };
  }

  Map<String, Object?> toApiJson() {
    return {
      if (id.isNotEmpty) 'id': id,
      'fullName': name,
      'phone': phoneNumber,
      'line1': street,
      'postalCode': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'isDefault': isDefault,
    };
  }

  AddressData copyWith({
    String? id,
    String? name,
    String? phoneNumber,
    String? street,
    String? postalCode,
    String? city,
    String? state,
    String? country,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) {
    return AddressData(
      id: id ?? this.id,
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      street: street ?? this.street,
      postalCode: postalCode ?? this.postalCode,
      city: city ?? this.city,
      state: state ?? this.state,
      country: country ?? this.country,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}

String _cityName(Object? value) {
  if (value is Map) return '${value['name'] ?? value['slug'] ?? ''}';
  return value?.toString() ?? '';
}

double? _doubleFromJson(Object? value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '');
}
