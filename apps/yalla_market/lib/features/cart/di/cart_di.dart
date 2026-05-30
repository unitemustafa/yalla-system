import 'package:get_it/get_it.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/network/api_client.dart';
import '../../../features/cart/data/repositories/cart_remote_repository_impl.dart';
import '../../../features/cart/data/repositories/cart_repository_impl.dart';
import '../../../features/cart/domain/repositories/cart_repository.dart';
import '../../../features/cart/domain/usecases/cart_usecases.dart';
import '../../../features/cart/presentation/cubit/cart_cubit.dart';

void registerCartDependencies(GetIt sl) {
  if (!sl.isRegistered<CartRepository>()) {
    sl.registerLazySingleton<CartRepository>(
      () => AppEnvironment.useDemoRepositories
          ? CartRepositoryImpl()
          : CartRemoteRepositoryImpl(sl<ApiClient>()),
    );
  }
  if (!sl.isRegistered<GetCartItemsUseCase>()) {
    sl.registerLazySingleton(() => GetCartItemsUseCase(sl<CartRepository>()));
  }
  if (!sl.isRegistered<AddCartItemUseCase>()) {
    sl.registerLazySingleton(() => AddCartItemUseCase(sl<CartRepository>()));
  }
  if (!sl.isRegistered<IncrementCartItemQuantityUseCase>()) {
    sl.registerLazySingleton(
      () => IncrementCartItemQuantityUseCase(sl<CartRepository>()),
    );
  }
  if (!sl.isRegistered<DecrementCartItemQuantityUseCase>()) {
    sl.registerLazySingleton(
      () => DecrementCartItemQuantityUseCase(sl<CartRepository>()),
    );
  }
  if (!sl.isRegistered<RemoveCartItemUseCase>()) {
    sl.registerLazySingleton(() => RemoveCartItemUseCase(sl<CartRepository>()));
  }
  if (!sl.isRegistered<ClearCartUseCase>()) {
    sl.registerLazySingleton(() => ClearCartUseCase(sl<CartRepository>()));
  }
  if (!sl.isRegistered<CartUseCases>()) {
    sl.registerLazySingleton(
      () => CartUseCases(
        getItems: sl<GetCartItemsUseCase>(),
        addItem: sl<AddCartItemUseCase>(),
        incrementQuantity: sl<IncrementCartItemQuantityUseCase>(),
        decrementQuantity: sl<DecrementCartItemQuantityUseCase>(),
        removeItem: sl<RemoveCartItemUseCase>(),
        clearCart: sl<ClearCartUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<CartCubit>()) {
    sl.registerFactory(() => CartCubit(sl<CartUseCases>()));
  }
}
