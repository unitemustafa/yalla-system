class CityData {
  const CityData({required this.name, required this.slug});

  final String name;
  final String slug;

  static const supported = [
    CityData(name: 'Cairo', slug: 'cairo'),
    CityData(name: 'Alexandria', slug: 'alexandria'),
    CityData(name: 'Sharm El Sheikh', slug: 'sharm-el-sheikh'),
    CityData(name: 'Hurghada', slug: 'hurghada'),
    CityData(name: 'Mansoura', slug: 'mansoura'),
    CityData(name: 'Tanta', slug: 'tanta'),
  ];

  static CityData? fromSlug(String? value) {
    final normalized = value?.trim().toLowerCase();
    if (normalized == null || normalized.isEmpty) return null;

    for (final city in supported) {
      if (city.slug == normalized) return city;
    }

    return null;
  }

  static CityData? fromCustomName(String? value) {
    final name = value?.trim();
    if (name == null || name.isEmpty) return null;

    return fromName(name) ?? CityData(name: name, slug: _customSlug(name));
  }

  static bool isSupportedSlug(String? value) => fromSlug(value) != null;

  static CityData? fromName(String? value) {
    final normalized = _normalize(value);
    final normalizedArabic = _normalizeArabic(value);
    if (normalized.isEmpty && normalizedArabic.isEmpty) return null;

    for (final city in supported) {
      if (normalized == city.slug) return city;
    }

    if (normalized.contains('cairo') || normalized.contains('qahirah')) {
      return supported[0];
    }
    if (normalized.contains('alexandria') ||
        normalized.contains('iskandariyah')) {
      return supported[1];
    }
    if (normalized.contains('sharm')) {
      return supported[2];
    }
    if (normalized.contains('hurghada') || normalized.contains('ghardaqah')) {
      return supported[3];
    }
    if (normalized.contains('mansoura') || normalized.contains('mansurah')) {
      return supported[4];
    }
    if (normalized.contains('tanta') || normalized.contains('gharbia')) {
      return supported[5];
    }

    if (normalizedArabic.contains('قاهره') ||
        normalizedArabic.contains('القاهره')) {
      return supported[0];
    }
    if (normalizedArabic.contains('اسكندريه') ||
        normalizedArabic.contains('الاسكندريه')) {
      return supported[1];
    }
    if (normalizedArabic.contains('شرم الشيخ')) {
      return supported[2];
    }
    if (normalizedArabic.contains('غردقه') ||
        normalizedArabic.contains('الغردقه')) {
      return supported[3];
    }
    if (normalizedArabic.contains('منصوره') ||
        normalizedArabic.contains('المنصوره')) {
      return supported[4];
    }
    if (normalizedArabic.contains('طنطا') ||
        normalizedArabic.contains('غربيه') ||
        normalizedArabic.contains('الغربيه')) {
      return supported[5];
    }

    return null;
  }

  static String _customSlug(String value) {
    final slug = value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^\u0621-\u064Aa-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');

    return slug.isEmpty ? 'custom-city' : slug;
  }

  static String _normalize(String? value) {
    final slug = value
        ?.trim()
        .toLowerCase()
        .replaceAll('&', ' and ')
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    return slug ?? '';
  }

  static String _normalizeArabic(String? value) {
    final normalized = value
        ?.trim()
        .replaceAll(RegExp(r'[\u064B-\u065F]'), '')
        .replaceAll('أ', 'ا')
        .replaceAll('إ', 'ا')
        .replaceAll('آ', 'ا')
        .replaceAll('ة', 'ه')
        .replaceAll(RegExp(r'[^\u0621-\u064A]+'), ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();

    return normalized ?? '';
  }
}
