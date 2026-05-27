import 'package:yallamarket/features/cart/data/repositories/cart_repository_impl.dart';
import 'package:yallamarket/features/cart/domain/repositories/cart_repository.dart';
import 'package:yallamarket/features/cart/domain/usecases/cart_usecases.dart';
import 'package:yallamarket/features/cart/presentation/cubit/cart_cubit.dart';
import 'package:yallamarket/features/personalization/data/repositories/address_repository_impl.dart';
import 'package:yallamarket/features/personalization/domain/repositories/address_repository.dart';
import 'package:yallamarket/features/personalization/domain/usecases/address_usecases.dart';
import 'package:yallamarket/features/personalization/presentation/cubit/address_cubit.dart';
import 'package:yallamarket/features/store/data/repositories/order_repository_impl.dart';
import 'package:yallamarket/features/store/domain/repositories/order_repository.dart';
import 'package:yallamarket/features/store/domain/usecases/create_order_usecase.dart';
import 'package:yallamarket/features/store/domain/usecases/get_my_orders_usecase.dart';
import 'package:yallamarket/features/store/presentation/cubit/checkout_cubit.dart';
import 'package:yallamarket/features/store/presentation/cubit/order_history_cubit.dart';
import 'package:yallamarket/features/wishlist/data/repositories/wishlist_repository_impl.dart';
import 'package:yallamarket/features/wishlist/domain/repositories/wishlist_repository.dart';
import 'package:yallamarket/features/wishlist/domain/usecases/wishlist_usecases.dart';
import 'package:yallamarket/features/wishlist/presentation/cubit/wishlist_cubit.dart';

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
  final repo = repository ?? AddressRepositoryImpl();
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

CheckoutCubit makeCheckoutCubit({OrderRepository? repository}) {
  final repo = repository ?? OrderRepositoryImpl();
  return CheckoutCubit(CreateOrderUseCase(repo));
}

OrderHistoryCubit makeOrderHistoryCubit({OrderRepository? repository}) {
  final repo = repository ?? OrderRepositoryImpl();
  return OrderHistoryCubit(GetMyOrdersUseCase(repo));
}
