import '../../../../core/network/api_result.dart';

abstract class OnboardingRepository {
  Future<ApiResult<bool>> hasSeenOnboarding();

  Future<ApiResult<bool>> markOnboardingSeen();
}
