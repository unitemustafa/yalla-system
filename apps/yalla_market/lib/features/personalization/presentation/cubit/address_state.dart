import '../../domain/entities/address.dart';

sealed class AddressState {
  const AddressState();

  List<AddressData> get addresses => const [];

  String? get selectedAddressId => null;

  AddressData? get selectedAddress {
    final selectedId = selectedAddressId;
    if (addresses.isEmpty) return null;
    if (selectedId == null) return addresses.first;
    return addresses.firstWhere(
      (address) => address.id == selectedId,
      orElse: () => addresses.first,
    );
  }
}

final class AddressInitial extends AddressState {
  const AddressInitial();
}

final class AddressLoading extends AddressState {
  const AddressLoading({this.addresses = const [], this.selectedAddressId});

  @override
  final List<AddressData> addresses;

  @override
  final String? selectedAddressId;
}

final class AddressReady extends AddressState {
  const AddressReady({
    required this.addresses,
    required this.selectedAddressId,
  });

  @override
  final List<AddressData> addresses;

  @override
  final String? selectedAddressId;
}

final class AddressFailure extends AddressState {
  const AddressFailure(
    this.message, {
    this.addresses = const [],
    this.selectedAddressId,
  });

  final String message;

  @override
  final List<AddressData> addresses;

  @override
  final String? selectedAddressId;
}
