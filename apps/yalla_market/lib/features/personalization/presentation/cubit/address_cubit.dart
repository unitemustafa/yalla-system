import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import '../../domain/entities/address.dart';
import '../../domain/usecases/address_usecases.dart';
import 'address_state.dart';

class AddressCubit extends Cubit<AddressState> {
  AddressCubit(this._addressUseCases) : super(const AddressInitial()) {
    loadAddresses();
  }

  final AddressUseCases _addressUseCases;

  Future<void> loadAddresses() async {
    final staleAddresses = state.addresses;
    final staleSelectedId = state.selectedAddressId;
    emit(
      AddressLoading(
        addresses: staleAddresses,
        selectedAddressId: staleSelectedId,
      ),
    );

    final result = await _addressUseCases.getAddresses();
    _emitAddresses(result);
  }

  Future<bool> saveAddress(AddressData address) async {
    final result = await _addressUseCases.saveAddress(address);
    return _emitAddresses(result);
  }

  Future<bool> deleteAddress(String id) async {
    final result = await _addressUseCases.deleteAddress(id);
    return _emitAddresses(result);
  }

  Future<bool> selectAddress(String id) async {
    final result = await _addressUseCases.selectAddress(id);
    return _emitAddresses(result);
  }

  bool _emitAddresses(ApiResult<List<AddressData>> result) {
    return result.when(
      success: (addresses) {
        emit(
          AddressReady(
            addresses: addresses,
            selectedAddressId: _selectedIdFrom(addresses),
          ),
        );
        return true;
      },
      failure: (failure) {
        emit(
          AddressFailure(
            failure.message,
            addresses: state.addresses,
            selectedAddressId: state.selectedAddressId,
          ),
        );
        return false;
      },
    );
  }

  String? _selectedIdFrom(List<AddressData> addresses) {
    if (addresses.isEmpty) return null;
    for (final address in addresses) {
      if (address.isDefault) return address.id;
    }
    return addresses.first.id;
  }
}
