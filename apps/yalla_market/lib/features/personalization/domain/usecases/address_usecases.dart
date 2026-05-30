import '../../../../core/network/api_result.dart';
import '../entities/address.dart';
import '../repositories/address_repository.dart';

class AddressUseCases {
  const AddressUseCases({
    required this.getAddresses,
    required this.getSelectedAddress,
    required this.saveAddress,
    required this.deleteAddress,
    required this.selectAddress,
  });

  final GetAddressesUseCase getAddresses;
  final GetSelectedAddressUseCase getSelectedAddress;
  final SaveAddressUseCase saveAddress;
  final DeleteAddressUseCase deleteAddress;
  final SelectAddressUseCase selectAddress;
}

class GetAddressesUseCase {
  const GetAddressesUseCase(this._repository);

  final AddressRepository _repository;

  Future<ApiResult<List<AddressData>>> call() => _repository.getAddresses();
}

class GetSelectedAddressUseCase {
  const GetSelectedAddressUseCase(this._repository);

  final AddressRepository _repository;

  Future<ApiResult<AddressData?>> call() => _repository.getSelectedAddress();
}

class SaveAddressUseCase {
  const SaveAddressUseCase(this._repository);

  final AddressRepository _repository;

  Future<ApiResult<List<AddressData>>> call(AddressData address) {
    return _repository.saveAddress(address);
  }
}

class DeleteAddressUseCase {
  const DeleteAddressUseCase(this._repository);

  final AddressRepository _repository;

  Future<ApiResult<List<AddressData>>> call(String id) {
    return _repository.deleteAddress(id);
  }
}

class SelectAddressUseCase {
  const SelectAddressUseCase(this._repository);

  final AddressRepository _repository;

  Future<ApiResult<List<AddressData>>> call(String id) {
    return _repository.selectAddress(id);
  }
}
