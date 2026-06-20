import 'package:get_it/get_it.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/token_store.dart';
import '../../../features/auth/data/repositories/auth_remote_repository_impl.dart';
import '../../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../../features/auth/domain/repositories/auth_repository.dart';
import '../../../features/auth/domain/usecases/auth_usecases.dart';
import '../../../features/auth/presentation/cubit/auth_cubit.dart';

void registerAuthDependencies(GetIt sl) {
  if (!sl.isRegistered<AuthRepository>()) {
    sl.registerLazySingleton<AuthRepository>(
      () => AppEnvironment.useDemoRepositories
          ? AuthRepositoryImpl()
          : AuthRemoteRepositoryImpl(sl<ApiClient>(), sl<TokenStore>()),
    );
  }
  if (!sl.isRegistered<RestoreSavedSessionUseCase>()) {
    sl.registerLazySingleton(
      () => RestoreSavedSessionUseCase(sl<AuthRepository>()),
    );
  }
  if (!sl.isRegistered<LoginUseCase>()) {
    sl.registerLazySingleton(() => LoginUseCase(sl<AuthRepository>()));
  }
  if (!sl.isRegistered<CheckUsernameAvailabilityUseCase>()) {
    sl.registerLazySingleton(
      () => CheckUsernameAvailabilityUseCase(sl<AuthRepository>()),
    );
  }
  if (!sl.isRegistered<CheckEmailRegistrationUseCase>()) {
    sl.registerLazySingleton(
      () => CheckEmailRegistrationUseCase(sl<AuthRepository>()),
    );
  }
  if (!sl.isRegistered<CheckPhoneRegistrationUseCase>()) {
    sl.registerLazySingleton(
      () => CheckPhoneRegistrationUseCase(sl<AuthRepository>()),
    );
  }
  if (!sl.isRegistered<SignupUseCase>()) {
    sl.registerLazySingleton(() => SignupUseCase(sl<AuthRepository>()));
  }
  if (!sl.isRegistered<VerifyEmailUseCase>()) {
    sl.registerLazySingleton(() => VerifyEmailUseCase(sl<AuthRepository>()));
  }
  if (!sl.isRegistered<ResendVerificationCodeUseCase>()) {
    sl.registerLazySingleton(
      () => ResendVerificationCodeUseCase(sl<AuthRepository>()),
    );
  }
  if (!sl.isRegistered<RequestPasswordResetUseCase>()) {
    sl.registerLazySingleton(
      () => RequestPasswordResetUseCase(sl<AuthRepository>()),
    );
  }
  if (!sl.isRegistered<RefreshProfileUseCase>()) {
    sl.registerLazySingleton(() => RefreshProfileUseCase(sl<AuthRepository>()));
  }
  if (!sl.isRegistered<UpdateProfileUseCase>()) {
    sl.registerLazySingleton(() => UpdateProfileUseCase(sl<AuthRepository>()));
  }
  if (!sl.isRegistered<LogoutUseCase>()) {
    sl.registerLazySingleton(() => LogoutUseCase(sl<AuthRepository>()));
  }
  if (!sl.isRegistered<DeleteAccountWithPasswordUseCase>()) {
    sl.registerLazySingleton(
      () => DeleteAccountWithPasswordUseCase(sl<AuthRepository>()),
    );
  }
  if (!sl.isRegistered<AuthUseCases>()) {
    sl.registerLazySingleton(
      () => AuthUseCases(
        restoreSavedSession: sl<RestoreSavedSessionUseCase>(),
        login: sl<LoginUseCase>(),
        checkUsernameAvailability: sl<CheckUsernameAvailabilityUseCase>(),
        checkEmailRegistration: sl<CheckEmailRegistrationUseCase>(),
        checkPhoneRegistration: sl<CheckPhoneRegistrationUseCase>(),
        signup: sl<SignupUseCase>(),
        verifyEmail: sl<VerifyEmailUseCase>(),
        resendVerificationCode: sl<ResendVerificationCodeUseCase>(),
        requestPasswordReset: sl<RequestPasswordResetUseCase>(),
        refreshProfile: sl<RefreshProfileUseCase>(),
        updateProfile: sl<UpdateProfileUseCase>(),
        logout: sl<LogoutUseCase>(),
        deleteAccountWithPassword: sl<DeleteAccountWithPasswordUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<AuthCubit>()) {
    sl.registerFactory(() => AuthCubit(sl<AuthUseCases>()));
  }
}
