import 'package:get_it/get_it.dart';

import '../../../core/network/api_client.dart';
import '../data/home_repository.dart';
import '../presentation/cubit/home_cubit.dart';

void registerHomeDependencies(GetIt sl) {
  if (!sl.isRegistered<HomeRepository>()) {
    sl.registerLazySingleton(() => HomeRepository(sl<ApiClient>()));
  }
  if (!sl.isRegistered<HomeCubit>()) {
    sl.registerFactory(() => HomeCubit(sl<HomeRepository>()));
  }
}
