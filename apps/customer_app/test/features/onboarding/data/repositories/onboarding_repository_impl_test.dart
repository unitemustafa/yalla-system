import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:yallamarket/features/onboarding/data/onboarding_preferences.dart';
import 'package:yallamarket/features/onboarding/data/repositories/onboarding_repository_impl.dart';

void main() {
  group('OnboardingRepositoryImpl', () {
    late OnboardingRepositoryImpl repository;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      repository = OnboardingRepositoryImpl(OnboardingPreferences());
    });

    test('returns false before onboarding is marked as seen', () async {
      final result = await repository.hasSeenOnboarding();

      result.when(
        success: (hasSeenOnboarding) => expect(hasSeenOnboarding, isFalse),
        failure: (failure) => fail(failure.message),
      );
    });

    test('returns true after onboarding is marked as seen', () async {
      await repository.markOnboardingSeen();

      final result = await repository.hasSeenOnboarding();

      result.when(
        success: (hasSeenOnboarding) => expect(hasSeenOnboarding, isTrue),
        failure: (failure) => fail(failure.message),
      );
    });
  });
}
