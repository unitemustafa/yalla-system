import 'package:shared_preferences/shared_preferences.dart';

class LocationPreferences {
  static const selectedCitySlugKey = 'location.selected_city_slug';

  Future<String?> getSelectedCitySlug() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(selectedCitySlugKey);
  }

  Future<void> setSelectedCitySlug(String slug) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(selectedCitySlugKey, slug);
  }
}
