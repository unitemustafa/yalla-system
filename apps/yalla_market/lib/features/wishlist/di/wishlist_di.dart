import 'package:get_it/get_it.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/network/api_client.dart';
import '../../../features/wishlist/data/repositories/wishlist_remote_repository_impl.dart';
import '../../../features/wishlist/data/repositories/wishlist_repository_impl.dart';
import '../../../features/wishlist/domain/repositories/wishlist_repository.dart';
import '../../../features/wishlist/domain/usecases/wishlist_usecases.dart';
import '../../../features/wishlist/presentation/cubit/wishlist_cubit.dart';

void registerWishlistDependencies(GetIt sl) {
  if (!sl.isRegistered<WishlistRepository>()) {
    sl.registerLazySingleton<WishlistRepository>(
      () => AppEnvironment.useDemoRepositories
          ? WishlistRepositoryImpl()
          : WishlistRemoteRepositoryImpl(sl<ApiClient>()),
    );
  }
  if (!sl.isRegistered<GetWishlistItemsUseCase>()) {
    sl.registerLazySingleton(
      () => GetWishlistItemsUseCase(sl<WishlistRepository>()),
    );
  }
  if (!sl.isRegistered<ToggleWishlistItemUseCase>()) {
    sl.registerLazySingleton(
      () => ToggleWishlistItemUseCase(sl<WishlistRepository>()),
    );
  }
  if (!sl.isRegistered<WishlistUseCases>()) {
    sl.registerLazySingleton(
      () => WishlistUseCases(
        getItems: sl<GetWishlistItemsUseCase>(),
        toggleItem: sl<ToggleWishlistItemUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<WishlistCubit>()) {
    sl.registerFactory(() => WishlistCubit(sl<WishlistUseCases>()));
  }
}
