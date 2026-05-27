import 'package:shared_preferences/shared_preferences.dart';

class OnboardingPreferences {
  static const String seenKey = 'has_seen_onboarding';

  Future<bool> hasSeenOnboarding() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getBool(seenKey) ?? false;
  }

  Future<void> markOnboardingSeen() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setBool(seenKey, true);
  }
}
