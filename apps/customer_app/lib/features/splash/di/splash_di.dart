import 'package:get_it/get_it.dart';

import '../../../features/auth/domain/usecases/auth_usecases.dart';
import '../../../features/location/domain/usecases/location_usecases.dart';
import '../../../features/onboarding/domain/usecases/onboarding_usecases.dart';
import '../../../features/splash/presentation/cubit/splash_cubit.dart';

void registerSplashDependencies(GetIt sl) {
  if (!sl.isRegistered<SplashCubit>()) {
    sl.registerFactory(
      () => SplashCubit(
        sl<OnboardingUseCases>(),
        sl<AuthUseCases>(),
        sl<LocationUseCases>(),
      ),
    );
  }
}
