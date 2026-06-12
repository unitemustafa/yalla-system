import 'package:shared_preferences/shared_preferences.dart';

class LocationPreferences {
  static const selectedCitySlugKey = 'location.selected_city_slug';
  static const selectedCityNameKey = 'location.selected_city_name';

  Future<String?> getSelectedCitySlug() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(selectedCitySlugKey);
  }

  Future<String?> getSelectedCityName() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(selectedCityNameKey);
  }

  Future<void> setSelectedCity(String slug, String name) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(selectedCitySlugKey, slug);
    await preferences.setString(selectedCityNameKey, name);
  }
}
