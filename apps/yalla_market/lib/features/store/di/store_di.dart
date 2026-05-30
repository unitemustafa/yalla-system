import 'package:get_it/get_it.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/network/api_client.dart';
import '../../../features/location/domain/usecases/location_usecases.dart';
import '../../../features/store/data/repositories/order_remote_repository_impl.dart';
import '../../../features/store/data/repositories/order_repository_impl.dart';
import '../../../features/store/data/repositories/product_remote_repository_impl.dart';
import '../../../features/store/data/repositories/product_repository_impl.dart';
import '../../../features/store/domain/repositories/order_repository.dart';
import '../../../features/store/domain/repositories/product_repository.dart';
import '../../../features/store/domain/usecases/create_order_usecase.dart';
import '../../../features/store/domain/usecases/get_brands_usecase.dart';
import '../../../features/store/domain/usecases/get_categories_usecase.dart';
import '../../../features/store/domain/usecases/get_my_orders_usecase.dart';
import '../../../features/store/domain/usecases/get_product_usecase.dart';
import '../../../features/store/domain/usecases/get_products_usecase.dart';
import '../../../features/store/domain/usecases/search_products_usecase.dart';
import '../../../features/store/presentation/cubit/checkout_cubit.dart';
import '../../../features/store/presentation/cubit/order_history_cubit.dart';
import '../../../features/store/presentation/cubit/product_catalog_cubit.dart';
import '../../../features/store/presentation/cubit/product_discovery_cubit.dart';

void registerStoreDependencies(GetIt sl) {
  if (!sl.isRegistered<ProductRepository>()) {
    sl.registerLazySingleton<ProductRepository>(
      () => AppEnvironment.useDemoRepositories
          ? ProductRepositoryImpl()
          : ProductRemoteRepositoryImpl(sl<ApiClient>()),
    );
  }
  if (!sl.isRegistered<GetProductsUseCase>()) {
    sl.registerLazySingleton(() => GetProductsUseCase(sl<ProductRepository>()));
  }
  if (!sl.isRegistered<GetProductUseCase>()) {
    sl.registerLazySingleton(() => GetProductUseCase(sl<ProductRepository>()));
  }
  if (!sl.isRegistered<SearchProductsUseCase>()) {
    sl.registerLazySingleton(
      () => SearchProductsUseCase(sl<ProductRepository>()),
    );
  }
  if (!sl.isRegistered<GetCategoriesUseCase>()) {
    sl.registerLazySingleton(
      () => GetCategoriesUseCase(sl<ProductRepository>()),
    );
  }
  if (!sl.isRegistered<GetBrandsUseCase>()) {
    sl.registerLazySingleton(() => GetBrandsUseCase(sl<ProductRepository>()));
  }
  if (!sl.isRegistered<ProductCatalogCubit>()) {
    sl.registerFactory(
      () => ProductCatalogCubit(
        sl<GetProductsUseCase>(),
        sl<GetSelectedCityUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<ProductDiscoveryCubit>()) {
    sl.registerFactory(
      () => ProductDiscoveryCubit(
        getProducts: sl<GetProductsUseCase>(),
        searchProducts: sl<SearchProductsUseCase>(),
        getCategories: sl<GetCategoriesUseCase>(),
        getBrands: sl<GetBrandsUseCase>(),
        getSelectedCity: sl<GetSelectedCityUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<OrderRepository>()) {
    sl.registerLazySingleton<OrderRepository>(
      () => AppEnvironment.useDemoRepositories
          ? OrderRepositoryImpl()
          : OrderRemoteRepositoryImpl(sl<ApiClient>()),
    );
  }
  if (!sl.isRegistered<CreateOrderUseCase>()) {
    sl.registerLazySingleton(() => CreateOrderUseCase(sl<OrderRepository>()));
  }
  if (!sl.isRegistered<GetMyOrdersUseCase>()) {
    sl.registerLazySingleton(() => GetMyOrdersUseCase(sl<OrderRepository>()));
  }
  if (!sl.isRegistered<CheckoutCubit>()) {
    sl.registerFactory(() => CheckoutCubit(sl<CreateOrderUseCase>()));
  }
  if (!sl.isRegistered<OrderHistoryCubit>()) {
    sl.registerFactory(() => OrderHistoryCubit(sl<GetMyOrdersUseCase>()));
  }
}
