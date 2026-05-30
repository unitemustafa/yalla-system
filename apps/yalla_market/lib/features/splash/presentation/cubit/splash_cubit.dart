import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/routing/app_routes.dart';
import '../../../auth/domain/entities/auth_session.dart';
import '../../../auth/domain/usecases/auth_usecases.dart';
import '../../../location/domain/entities/city_data.dart';
import '../../../location/domain/usecases/location_usecases.dart';
import '../../../onboarding/domain/usecases/onboarding_usecases.dart';
import 'splash_state.dart';

class SplashCubit extends Cubit<SplashState> {
  SplashCubit(
    this._onboardingUseCases,
    this._authUseCases,
    this._locationUseCases,
  ) : super(const SplashLoading());

  final OnboardingUseCases _onboardingUseCases;
  final AuthUseCases _authUseCases;
  final LocationUseCases _locationUseCases;

  Future<void> determineStartupRoute() async {
    final onboardingResult = await _onboardingUseCases.hasSeenOnboarding();
    final hasSeenOnboarding = onboardingResult.when(
      success: (seen) => seen,
      failure: (_) => false,
    );

    if (!hasSeenOnboarding) {
      emit(const SplashNavigateTo(AppRoutes.onboarding));
      return;
    }

    AuthSession? session;
    final sessionResult = await _authUseCases.restoreSavedSession();
    session = sessionResult.when(success: (s) => s, failure: (_) => null);

    if (session == null) {
      emit(const SplashNavigateTo(AppRoutes.login));
      return;
    }

    CityData? city;
    final cityResult = await _locationUseCases.getSelectedCity();
    city = cityResult.when(success: (c) => c, failure: (_) => null);

    emit(
      SplashNavigateTo(
        city == null ? AppRoutes.selectCity : AppRoutes.navigationMenu,
        session: session,
        city: city,
      ),
    );
  }
}
