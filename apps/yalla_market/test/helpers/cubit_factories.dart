import 'package:yalla_market/features/cart/data/repositories/cart_repository_impl.dart';
import 'package:yalla_market/features/cart/domain/repositories/cart_repository.dart';
import 'package:yalla_market/features/cart/domain/usecases/cart_usecases.dart';
import 'package:yalla_market/features/cart/presentation/cubit/cart_cubit.dart';
import 'package:yalla_market/core/network/api_result.dart';
import 'package:yalla_market/features/personalization/domain/entities/address.dart';
import 'package:yalla_market/features/personalization/domain/repositories/address_repository.dart';
import 'package:yalla_market/features/personalization/domain/usecases/address_usecases.dart';
import 'package:yalla_market/features/personalization/presentation/cubit/address_cubit.dart';
import 'package:yalla_market/features/store/data/repositories/order_repository_impl.dart';
import 'package:yalla_market/features/store/domain/repositories/order_repository.dart';
import 'package:yalla_market/features/store/domain/usecases/create_order_usecase.dart';
import 'package:yalla_market/features/store/domain/usecases/get_my_orders_usecase.dart';
import 'package:yalla_market/features/store/presentation/cubit/checkout_cubit.dart';
import 'package:yalla_market/features/store/presentation/cubit/order_history_cubit.dart';
import 'package:yalla_market/features/wishlist/data/repositories/wishlist_repository_impl.dart';
import 'package:yalla_market/features/wishlist/domain/repositories/wishlist_repository.dart';
import 'package:yalla_market/features/wishlist/domain/usecases/wishlist_usecases.dart';
import 'package:yalla_market/features/wishlist/presentation/cubit/wishlist_cubit.dart';

CartCubit makeCartCubit({CartRepository? repository}) {
  final repo = repository ?? CartRepositoryImpl();
  return CartCubit(
    CartUseCases(
      getItems: GetCartItemsUseCase(repo),
      addItem: AddCartItemUseCase(repo),
      incrementQuantity: IncrementCartItemQuantityUseCase(repo),
      decrementQuantity: DecrementCartItemQuantityUseCase(repo),
      removeItem: RemoveCartItemUseCase(repo),
      clearCart: ClearCartUseCase(repo),
    ),
  );
}

WishlistCubit makeWishlistCubit({WishlistRepository? repository}) {
  final repo = repository ?? WishlistRepositoryImpl();
  return WishlistCubit(
    WishlistUseCases(
      getItems: GetWishlistItemsUseCase(repo),
      toggleItem: ToggleWishlistItemUseCase(repo),
    ),
  );
}

AddressCubit makeAddressCubit({AddressRepository? repository}) {
  final repo = repository ?? _TestAddressRepository();
  return AddressCubit(
    AddressUseCases(
      getAddresses: GetAddressesUseCase(repo),
      getSelectedAddress: GetSelectedAddressUseCase(repo),
      saveAddress: SaveAddressUseCase(repo),
      deleteAddress: DeleteAddressUseCase(repo),
      selectAddress: SelectAddressUseCase(repo),
    ),
  );
}

class _TestAddressRepository implements AddressRepository {
  final List<AddressData> _addresses = [];

  @override
  Future<ApiResult<List<AddressData>>> getAddresses() async {
    return ApiResult.success(List.unmodifiable(_addresses));
  }

  @override
  Future<ApiResult<AddressData?>> getSelectedAddress() async {
    for (final address in _addresses) {
      if (address.isDefault) return ApiResult.success(address);
    }
    return const ApiResult.success(null);
  }

  @override
  Future<ApiResult<List<AddressData>>> saveAddress(AddressData address) async {
    _addresses.removeWhere((item) => item.id == address.id);
    _addresses.add(address);
    return ApiResult.success(List.unmodifiable(_addresses));
  }

  @override
  Future<ApiResult<List<AddressData>>> deleteAddress(String id) async {
    _addresses.removeWhere((item) => item.id == id);
    return ApiResult.success(List.unmodifiable(_addresses));
  }

  @override
  Future<ApiResult<List<AddressData>>> selectAddress(String id) async {
    for (var index = 0; index < _addresses.length; index++) {
      _addresses[index] = _addresses[index].copyWith(
        isDefault: _addresses[index].id == id,
      );
    }
    return ApiResult.success(List.unmodifiable(_addresses));
  }
}

CheckoutCubit makeCheckoutCubit({OrderRepository? repository}) {
  final repo = repository ?? OrderRepositoryImpl();
  return CheckoutCubit(CreateOrderUseCase(repo));
}

OrderHistoryCubit makeOrderHistoryCubit({OrderRepository? repository}) {
  final repo = repository ?? OrderRepositoryImpl();
  return OrderHistoryCubit(GetMyOrdersUseCase(repo));
}
