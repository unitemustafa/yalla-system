enum RegionSource {
  gps,
  manual,
  general;

  static RegionSource fromString(String? value) {
    switch (value?.trim().toUpperCase()) {
      case 'GPS':
        return RegionSource.gps;
      case 'MANUAL':
        return RegionSource.manual;
      case 'GENERAL':
        return RegionSource.general;
    }

    return RegionSource.manual;
  }

  String get storageValue => name.toUpperCase();
}

class CityData {
  const CityData({
    required this.name,
    required this.slug,
    this.source = RegionSource.manual,
  });

  final String name;
  final String slug;
  final RegionSource source;

  static const generalSlug = 'general';

  static const general = CityData(
    name: 'General',
    slug: generalSlug,
    source: RegionSource.general,
  );

  static const supported = [
    general,
    CityData(name: 'Cairo', slug: 'cairo'),
    CityData(name: 'Sharm El Sheikh', slug: 'sharm-el-sheikh'),
  ];

  static List<CityData> get dashboardRegions =>
      supported.where((city) => !city.isGeneral).toList(growable: false);

  bool get isGeneral => slug == generalSlug;

  bool get isNamedGeneral => isGeneral && name.trim() != general.name;

  String displayName({required bool arabic}) {
    final cleanName = cleanRegionName(name);
    if (!arabic) return cleanName;

    return _arabicRegionNames[_lookupKey(cleanName)] ??
        _arabicRegionNames[_lookupKey(name)] ??
        cleanName;
  }

  CityData withSource(RegionSource source) {
    return CityData(name: name, slug: slug, source: source);
  }

  CityData asGeneralRegion() {
    return CityData(
      name: name,
      slug: generalSlug,
      source: RegionSource.general,
    );
  }

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

  static String cleanRegionName(String value) {
    return value
        .trim()
        .replaceAll(RegExp(r'\bgovernorate\s+of\b', caseSensitive: false), '')
        .replaceAll(RegExp(r'\bgovernorate\b', caseSensitive: false), '')
        .replaceAll(RegExp(r'\begypt\b', caseSensitive: false), '')
        .replaceAll('محافظة', '')
        .replaceAll('محافظه', '')
        .replaceAll('مصر', '')
        .replaceAll(RegExp(r'[,،]+'), ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  static CityData? fromName(String? value) {
    final normalized = _normalize(value);
    final normalizedArabic = _normalizeArabic(value);
    if (normalized.isEmpty && normalizedArabic.isEmpty) return null;

    for (final city in supported) {
      if (normalized == city.slug) return city;
    }

    if (_matchesAnyAlias(normalized, _cairoAliases) ||
        _containsAnyArabic(normalizedArabic, _cairoArabicAliases)) {
      return supported[1];
    }
    if (_matchesAnyAlias(normalized, _sharmElSheikhAliases) ||
        _containsAnyArabic(normalizedArabic, _sharmElSheikhArabicAliases)) {
      return supported[2];
    }

    final rawValue = value?.trim() ?? '';
    if (rawValue.contains('القاهرة') || rawValue.contains('قاهره')) {
      return supported[1];
    }
    if (rawValue.contains('شرم') ||
        rawValue.contains('جنوب سيناء') ||
        rawValue.contains('جنوب سينا')) {
      return supported[2];
    }
    if (normalizedArabic.isNotEmpty) return null;

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
        .replaceAll(RegExp(r'\b(el|al|ash)\b'), ' ')
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

  static String _lookupKey(String value) {
    return cleanRegionName(value)
        .trim()
        .toLowerCase()
        .replaceAll('&', ' and ')
        .replaceAll(RegExp(r'[^a-z0-9\u0621-\u064A]+'), ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  static bool _matchesAnyAlias(String normalized, Set<String> aliases) {
    if (normalized.isEmpty) return false;

    for (final alias in aliases) {
      if (normalized == alias ||
          normalized.startsWith('$alias-') ||
          normalized.endsWith('-$alias') ||
          normalized.contains('-$alias-')) {
        return true;
      }
    }

    return false;
  }

  static bool _containsAnyArabic(String normalized, Set<String> aliases) {
    if (normalized.isEmpty) return false;

    for (final alias in aliases) {
      if (normalized.contains(alias)) return true;
    }

    return false;
  }

  static const Map<String, String> _arabicRegionNames = {
    'general': 'عام',
    'cairo': 'القاهرة',
    'al qahirah': 'القاهرة',
    'القاهره': 'القاهرة',
    'القاهرة': 'القاهرة',
    'sharm el sheikh': 'شرم الشيخ',
    'sharm el sheik': 'شرم الشيخ',
    'شرم الشيخ': 'شرم الشيخ',
    'south sinai': 'جنوب سيناء',
    'janub sina': 'جنوب سيناء',
    'alexandria': 'الإسكندرية',
    'al iskandariyah': 'الإسكندرية',
    'اسكندريه': 'الإسكندرية',
    'الاسكندريه': 'الإسكندرية',
    'الإسكندرية': 'الإسكندرية',
    'giza': 'الجيزة',
    'al jizah': 'الجيزة',
    'الجيزة': 'الجيزة',
    'dakahlia': 'الدقهلية',
    'daqahlia': 'الدقهلية',
    'ad daqahliyah': 'الدقهلية',
    'الدقهليه': 'الدقهلية',
    'الدقهلية': 'الدقهلية',
    'mansoura': 'المنصورة',
    'al mansurah': 'المنصورة',
    'المنصوره': 'المنصورة',
    'المنصورة': 'المنصورة',
    'tanta': 'طنطا',
    'طنطا': 'طنطا',
    'hurghada': 'الغردقة',
    'الغردقه': 'الغردقة',
    'الغردقة': 'الغردقة',
    'aswan': 'أسوان',
    'أسوان': 'أسوان',
    'asiyut': 'أسيوط',
    'assiut': 'أسيوط',
    'أسيوط': 'أسيوط',
    'beheira': 'البحيرة',
    'al buhayrah': 'البحيرة',
    'البحيرة': 'البحيرة',
    'beni suef': 'بني سويف',
    'bani suwayf': 'بني سويف',
    'بني سويف': 'بني سويف',
    'damietta': 'دمياط',
    'dumyat': 'دمياط',
    'دمياط': 'دمياط',
    'faiyum': 'الفيوم',
    'fayoum': 'الفيوم',
    'الفيوم': 'الفيوم',
    'gharbia': 'الغربية',
    'al gharbiyah': 'الغربية',
    'الغربية': 'الغربية',
    'ismailia': 'الإسماعيلية',
    'al ismailiyah': 'الإسماعيلية',
    'الإسماعيلية': 'الإسماعيلية',
    'kafr el sheikh': 'كفر الشيخ',
    'kafr ash shaykh': 'كفر الشيخ',
    'كفر الشيخ': 'كفر الشيخ',
    'luxor': 'الأقصر',
    'الأقصر': 'الأقصر',
    'matrouh': 'مطروح',
    'matruh': 'مطروح',
    'مطروح': 'مطروح',
    'minya': 'المنيا',
    'al minya': 'المنيا',
    'المنيا': 'المنيا',
    'monufia': 'المنوفية',
    'menofia': 'المنوفية',
    'al minufiyah': 'المنوفية',
    'المنوفية': 'المنوفية',
    'new valley': 'الوادي الجديد',
    'الوادي الجديد': 'الوادي الجديد',
    'north sinai': 'شمال سيناء',
    'شمال سيناء': 'شمال سيناء',
    'port said': 'بورسعيد',
    'بورسعيد': 'بورسعيد',
    'qalyubia': 'القليوبية',
    'qalubia': 'القليوبية',
    'al qalyubiyah': 'القليوبية',
    'القليوبية': 'القليوبية',
    'qena': 'قنا',
    'قنا': 'قنا',
    'red sea': 'البحر الأحمر',
    'البحر الأحمر': 'البحر الأحمر',
    'sharqia': 'الشرقية',
    'al sharqia': 'الشرقية',
    'ash sharqiyah': 'الشرقية',
    'الشرقية': 'الشرقية',
    'sohag': 'سوهاج',
    'سوهاج': 'سوهاج',
    'suez': 'السويس',
    'السويس': 'السويس',
  };

  static const Set<String> _cairoAliases = {
    'cairo',
    'qahirah',
    'qahira',
    'kahira',
    'greater-cairo',
    'cairo-governorate',
    'nasr-city',
    'madinet-nasr',
    'heliopolis',
    'masr-gedida',
    'new-cairo',
    'tagamoa',
    'tagammu',
    'tagamou',
    'fifth-settlement',
    '5th-settlement',
    'first-settlement',
    'maadi',
    'zamalek',
    'shubra',
    'matariya',
    'ain-shams',
    'mokattam',
    'abbasiya',
    'downtown-cairo',
    'garden-city',
    'bulaq',
    'helwan',
    '15-may',
    'dar-salam',
    'sayeda-zeinab',
    'ehsaneyah',
    'ihsaneyah',
  };

  static const Set<String> _sharmElSheikhAliases = {
    'sharm',
    'sharm-sheikh',
    'sharm-sheik',
    'sharm-shaykh',
    'sharmelsheikh',
    'south-sinai',
    'south-sina',
    'janub-sina',
    'sina-south',
    'sinai-south',
    'ras-mohammed',
    'ras-muhammad',
    'naama-bay',
    'nabq',
    'hadaba',
  };

  static const Set<String> _cairoArabicAliases = {
    'القاهره',
    'القاهرة',
    'مدينة نصر',
    'مصر الجديدة',
    'القاهرة الجديدة',
    'التجمع',
    'التجمع الخامس',
    'المعادي',
    'الزمالك',
    'شبرا',
    'المطرية',
    'عين شمس',
    'المقطم',
    'العباسية',
    'وسط البلد',
    'جاردن سيتي',
    'بولاق',
    'حلوان',
    'دار السلام',
    'السيدة زينب',
    'الاحسانية',
    'الإحسانية',
  };

  static const Set<String> _sharmElSheikhArabicAliases = {
    'شرم',
    'شرم الشيخ',
    'جنوب سيناء',
    'جنوب سينا',
    'خليج نعمة',
    'نبق',
    'الهضبة',
    'رأس محمد',
  };
}
