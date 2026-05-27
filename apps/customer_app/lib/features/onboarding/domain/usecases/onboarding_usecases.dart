import '../../../../core/network/api_result.dart';
import '../repositories/onboarding_repository.dart';

class OnboardingUseCases {
  const OnboardingUseCases({
    required this.hasSeenOnboarding,
    required this.markOnboardingSeen,
  });

  final HasSeenOnboardingUseCase hasSeenOnboarding;
  final MarkOnboardingSeenUseCase markOnboardingSeen;
}

class HasSeenOnboardingUseCase {
  const HasSeenOnboardingUseCase(this._repository);

  final OnboardingRepository _repository;

  Future<ApiResult<bool>> call() => _repository.hasSeenOnboarding();
}

class MarkOnboardingSeenUseCase {
  const MarkOnboardingSeenUseCase(this._repository);

  final OnboardingRepository _repository;

  Future<ApiResult<bool>> call() => _repository.markOnboardingSeen();
}
