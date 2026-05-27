import 'package:get_it/get_it.dart';

import '../../../features/onboarding/data/onboarding_preferences.dart';
import '../../../features/onboarding/data/repositories/onboarding_repository_impl.dart';
import '../../../features/onboarding/domain/repositories/onboarding_repository.dart';
import '../../../features/onboarding/domain/usecases/onboarding_usecases.dart';
import '../../../features/onboarding/presentation/cubit/onboarding_cubit.dart';

void registerOnboardingDependencies(GetIt sl) {
  if (!sl.isRegistered<OnboardingPreferences>()) {
    sl.registerLazySingleton(OnboardingPreferences.new);
  }
  if (!sl.isRegistered<OnboardingRepository>()) {
    sl.registerLazySingleton<OnboardingRepository>(
      () => OnboardingRepositoryImpl(sl<OnboardingPreferences>()),
    );
  }
  if (!sl.isRegistered<HasSeenOnboardingUseCase>()) {
    sl.registerLazySingleton(
      () => HasSeenOnboardingUseCase(sl<OnboardingRepository>()),
    );
  }
  if (!sl.isRegistered<MarkOnboardingSeenUseCase>()) {
    sl.registerLazySingleton(
      () => MarkOnboardingSeenUseCase(sl<OnboardingRepository>()),
    );
  }
  if (!sl.isRegistered<OnboardingUseCases>()) {
    sl.registerLazySingleton(
      () => OnboardingUseCases(
        hasSeenOnboarding: sl<HasSeenOnboardingUseCase>(),
        markOnboardingSeen: sl<MarkOnboardingSeenUseCase>(),
      ),
    );
  }
  if (!sl.isRegistered<OnboardingCubit>()) {
    sl.registerFactory(() => OnboardingCubit(sl<OnboardingUseCases>()));
  }
}
