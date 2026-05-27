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
      city: json['city']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
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
      'city': city,
      'state': state,
      'country': country,
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
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
