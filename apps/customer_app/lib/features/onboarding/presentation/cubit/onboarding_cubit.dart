import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/onboarding_usecases.dart';

class OnboardingCubit extends Cubit<bool> {
  OnboardingCubit(this._onboardingUseCases) : super(false);

  final OnboardingUseCases _onboardingUseCases;

  Future<bool> hasSeenOnboarding() async {
    final result = await _onboardingUseCases.hasSeenOnboarding();
    return result.when(
      success: (hasSeenOnboarding) {
        emit(hasSeenOnboarding);
        return hasSeenOnboarding;
      },
      failure: (_) => false,
    );
  }

  Future<bool> markOnboardingSeen() async {
    final result = await _onboardingUseCases.markOnboardingSeen();
    return result.when(
      success: (_) {
        emit(true);
        return true;
      },
      failure: (_) => false,
    );
  }
}
