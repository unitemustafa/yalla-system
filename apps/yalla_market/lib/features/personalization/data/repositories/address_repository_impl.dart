import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/address.dart';
import '../../domain/repositories/address_repository.dart';

class AddressRepositoryImpl implements AddressRepository {
  AddressRepositoryImpl()
    : _addresses = List<AddressData>.of(_seedAddresses),
      _selectedAddressId = _seedAddresses.first.id;

  final List<AddressData> _addresses;
  String? _selectedAddressId;

  @override
  Future<ApiResult<List<AddressData>>> getAddresses() async {
    return ApiResult.success(_withSelectedFlag());
  }

  @override
  Future<ApiResult<AddressData?>> getSelectedAddress() async {
    return ApiResult.success(_selectedAddress());
  }

  @override
  Future<ApiResult<List<AddressData>>> saveAddress(AddressData address) async {
    final normalized = _normalizeAddress(address);
    final existingIndex = _addresses.indexWhere(
      (item) => item.id == normalized.id,
    );

    if (existingIndex == -1) {
      _addresses.insert(0, normalized);
      _selectedAddressId = normalized.id;
    } else {
      _addresses[existingIndex] = normalized;
    }

    return ApiResult.success(_withSelectedFlag());
  }

  @override
  Future<ApiResult<List<AddressData>>> deleteAddress(String id) async {
    final initialLength = _addresses.length;
    _addresses.removeWhere((item) => item.id == id);

    if (_addresses.length == initialLength) {
      return const ApiResult.failure(
        ValidationFailure('Address was not found.'),
      );
    }

    if (_selectedAddressId == id) {
      _selectedAddressId = _addresses.isEmpty ? null : _addresses.first.id;
    }

    return ApiResult.success(_withSelectedFlag());
  }

  @override
  Future<ApiResult<List<AddressData>>> selectAddress(String id) async {
    final exists = _addresses.any((address) => address.id == id);
    if (!exists) {
      return const ApiResult.failure(
        ValidationFailure('Address was not found.'),
      );
    }

    _selectedAddressId = id;
    return ApiResult.success(_withSelectedFlag());
  }

  AddressData _normalizeAddress(AddressData address) {
    final id = address.id.trim().isEmpty
        ? DateTime.now().microsecondsSinceEpoch.toString()
        : address.id.trim();
    return address.copyWith(id: id);
  }

  AddressData? _selectedAddress() {
    if (_addresses.isEmpty) return null;
    final selectedId = _selectedAddressId;
    return _addresses.firstWhere(
      (address) => address.id == selectedId,
      orElse: () => _addresses.first,
    );
  }

  List<AddressData> _withSelectedFlag() {
    final selected = _selectedAddress();
    return _addresses
        .map(
          (address) => address.copyWith(isDefault: address.id == selected?.id),
        )
        .toList(growable: false);
  }
}

const _seedAddresses = [
  AddressData(
    id: 'address-1',
    name: 'Coding with T',
    phoneNumber: '+923178059528',
    street: '82356 Timmy Coves',
    city: 'South Liana',
    state: 'Maine',
    postalCode: '87665',
    country: 'USA',
    isDefault: true,
  ),
  AddressData(
    id: 'address-2',
    name: 'John Doe',
    phoneNumber: '(+123) 456 7890',
    street: '123 Main Street',
    city: 'New York',
    state: 'New York',
    postalCode: '10001',
    country: 'United States',
  ),
  AddressData(
    id: 'address-3',
    name: 'Alice Smith',
    phoneNumber: '(+987) 654 3210',
    street: '456 Elm Avenue',
    city: 'Los Angeles',
    state: 'California',
    postalCode: '90001',
    country: 'United States',
  ),
  AddressData(
    id: 'address-4',
    name: 'Taimoor Sikander',
    phoneNumber: '+923178059528',
    street: 'Street 35',
    city: 'Islamabad',
    state: 'Federal',
    postalCode: '48000',
    country: 'Pakistan',
  ),
  AddressData(
    id: 'address-5',
    name: 'Maria Garcia',
    phoneNumber: '(+541) 234 5678',
    street: '789 Oak Road',
    city: 'Buenos Aires',
    state: 'Buenos Aires',
    postalCode: '1001',
    country: 'Argentina',
  ),
  AddressData(
    id: 'address-6',
    name: 'Liam Johnson',
    phoneNumber: '+447890123456',
    street: '10 Park Lane',
    city: 'London',
    state: 'England',
    postalCode: 'SW1A 1AA',
    country: 'United Kingdom',
  ),
];
