import 'package:shared_preferences/shared_preferences.dart';

class LocationPreferences {
  static const selectedCitySlugKey = 'location.selected_city_slug';
  static const selectedCityNameKey = 'location.selected_city_name';
  static const selectedRegionSourceKey = 'location.selected_region_source';

  Future<String?> getSelectedCitySlug() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(selectedCitySlugKey);
  }

  Future<String?> getSelectedCityName() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(selectedCityNameKey);
  }

  Future<String?> getSelectedRegionSource() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(selectedRegionSourceKey);
  }

  Future<void> setSelectedCity(
    String slug,
    String name, {
    required String source,
  }) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(selectedCitySlugKey, slug);
    await preferences.setString(selectedCityNameKey, name);
    await preferences.setString(selectedRegionSourceKey, source);
  }
}
