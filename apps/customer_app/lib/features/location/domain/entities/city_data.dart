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

  static CityData? fromName(String? value) {
    final normalized = _normalize(value);
    if (normalized.isEmpty) return null;

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

    return null;
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
}
