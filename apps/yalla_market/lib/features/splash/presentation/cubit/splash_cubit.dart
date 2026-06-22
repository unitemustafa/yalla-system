import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/routing/app_routes.dart';
import '../../../../core/storage/token_store.dart';
import '../../../auth/domain/entities/auth_session.dart';
import '../../../auth/domain/usecases/auth_usecases.dart';
import '../../../location/data/datasources/location_preferences.dart';
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
      final showSessionExpiredNotice =
          await SessionLifecycleStore.consumeClosedSessionNotice();
      emit(
        SplashNavigateTo(
          AppRoutes.login,
          showSessionExpiredNotice: showSessionExpiredNotice,
        ),
      );
      return;
    }

    CityData? city;
    final cityResult = await _locationUseCases.getSelectedCity();
    city = cityResult.when(success: (c) => c, failure: (_) => null);
    final selectedCityUserId = await LocationPreferences()
        .getSelectedCityUserId();
    final hasLegacyCity = city != null && selectedCityUserId == null;
    if (hasLegacyCity) {
      await LocationPreferences().setSelectedCityUserId(session.user.id);
    }
    final hasCityForCurrentUser =
        city != null &&
        (selectedCityUserId == session.user.id || hasLegacyCity);

    emit(
      SplashNavigateTo(
        hasCityForCurrentUser ? AppRoutes.navigationMenu : AppRoutes.selectCity,
        session: session,
        city: hasCityForCurrentUser ? city : null,
      ),
    );
  }
}
