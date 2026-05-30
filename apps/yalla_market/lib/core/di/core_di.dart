import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';

import '../network/api_client.dart';
import '../network/dio_factory.dart';
import '../storage/token_store.dart';

void registerCoreDependencies(GetIt sl) {
  // [Dio singleton] — shared across all regular API calls.
  // ApiClient internally creates a private _refreshDio instance for token-refresh
  // requests so that the auth interceptor is NOT triggered on refresh calls,
  // preventing recursive 401 retry loops.
  if (!sl.isRegistered<Dio>()) {
    sl.registerLazySingleton<Dio>(DioFactory.create);
  }
  if (!sl.isRegistered<TokenStore>()) {
    sl.registerLazySingleton<TokenStore>(SecureTokenStore.new);
  }
  if (!sl.isRegistered<ApiClient>()) {
    sl.registerLazySingleton(
      () => ApiClient(dio: sl<Dio>(), tokenStore: sl<TokenStore>()),
    );
  }
}
