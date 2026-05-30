import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/repositories/onboarding_repository.dart';
import '../onboarding_preferences.dart';

class OnboardingRepositoryImpl implements OnboardingRepository {
  const OnboardingRepositoryImpl(this._preferences);

  final OnboardingPreferences _preferences;

  @override
  Future<ApiResult<bool>> hasSeenOnboarding() async {
    try {
      final hasSeenOnboarding = await _preferences.hasSeenOnboarding();
      return ApiResult.success(hasSeenOnboarding);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not load onboarding state.'),
      );
    }
  }

  @override
  Future<ApiResult<bool>> markOnboardingSeen() async {
    try {
      await _preferences.markOnboardingSeen();
      return const ApiResult.success(true);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not save onboarding state.'),
      );
    }
  }
}
