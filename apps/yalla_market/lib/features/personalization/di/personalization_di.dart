import 'package:get_it/get_it.dart';

import '../../../core/network/api_client.dart';
import '../../../features/personalization/data/repositories/address_remote_repository_impl.dart';
import '../../../features/personalization/data/repositories/profile_image_repository_impl.dart';
import '../../../features/personalization/domain/repositories/address_repository.dart';
import '../../../features/personalization/domain/repositories/profile_image_repository.dart';
import '../../../features/personalization/domain/usecases/address_usecases.dart';
import '../../../features/personalization/domain/usecases/pick_profile_image_usecase.dart';
import '../../../features/personalization/presentation/cubit/address_cubit.dart';
import '../../../features/personalization/presentation/cubit/profile_image_cubit.dart';

void registerPersonalizationDependencies(GetIt sl) {
  if (!sl.isRegistered<AddressRepository>()) {
    sl.registerLazySingleton<AddressRepository>(
      () => AddressRemoteRepositoryImpl(sl<ApiClient>()),
    );
  }
  if (!sl.isRegistered<GetAddressesUseCase>()) {
    sl.registerLazySingleton(
      () => GetAddressesUseCase(sl<AddressRepository>()),
    );
  }
  if (!sl.isRegistered<GetSelectedAddressUseCase>()) {
    sl.registerLazySingleton(
      () => GetSelectedAddressUseCase(sl<AddressRepository>()),
    );
  }
  if (!sl.isRegistered<SaveAddressUseCase>()) {
    sl.registerLazySingleton(() => SaveAddressUseCase(sl<AddressRepository>()));
  }
  if (!sl.isRegistered<DeleteAddressUseCase>()) {
    sl.registerLazySingleton(
      () => DeleteAddressUseCase(sl<AddressRepository>()),
    );
  }
  if (!sl.isRegistered<SelectAddressUseCase>()) {
    sl.registerLazySingleton(
      () => SelectAddressUseCase(sl<AddressRepository>()),
    );
  }
  if (!sl.isRegistered<AddressUseCases>()) {
    sl.registerLazySingleton(
      () => AddressUseCases(
        getAddresses: sl<GetAddressesUseCase>(),
        getSelectedAddress: sl<GetSelectedAddressUseCase>(),
        saveAddress: sl<SaveAddressUseCase>(),
        deleteAddress: sl<DeleteAddressUseCase>(),
        selectAddress: sl<SelectAddressUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<AddressCubit>()) {
    sl.registerFactory(() => AddressCubit(sl<AddressUseCases>()));
  }
  if (!sl.isRegistered<ProfileImageRepository>()) {
    sl.registerLazySingleton<ProfileImageRepository>(
      ProfileImageRepositoryImpl.new,
    );
  }
  if (!sl.isRegistered<PickProfileImageUseCase>()) {
    sl.registerLazySingleton(
      () => PickProfileImageUseCase(sl<ProfileImageRepository>()),
    );
  }
  if (!sl.isRegistered<ProfileImageCubit>()) {
    sl.registerFactory(() => ProfileImageCubit(sl<PickProfileImageUseCase>()));
  }
}
