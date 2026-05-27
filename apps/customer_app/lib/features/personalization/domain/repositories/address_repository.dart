import '../../../../core/network/api_result.dart';
import '../entities/address.dart';

abstract class AddressRepository {
  Future<ApiResult<List<AddressData>>> getAddresses();

  Future<ApiResult<AddressData?>> getSelectedAddress();

  Future<ApiResult<List<AddressData>>> saveAddress(AddressData address);

  Future<ApiResult<List<AddressData>>> deleteAddress(String id);

  Future<ApiResult<List<AddressData>>> selectAddress(String id);
}
