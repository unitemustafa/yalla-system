class ProductData {
  const ProductData({
    this.id,
    this.code,
    this.slug,
    required this.image,
    required this.title,
    required this.brand,
    required this.price,
    required this.oldPrice,
    required this.discount,
    required this.tags,
    this.isFamilySafe = true,
    this.citySlug,
    this.cityName,
  });

  final String? id;
  final String? code;
  final String? slug;
  final String image;
  final String title;
  final String brand;
  final String price;
  final String? oldPrice;
  final String discount;
  final List<String> tags;
  final bool isFamilySafe;
  final String? citySlug;
  final String? cityName;

  factory ProductData.fromJson(Map<String, dynamic> json) {
    final tags = _stringList(json['tags']);

    return ProductData(
      id: json['id']?.toString(),
      code:
          json['code']?.toString() ??
          json['productCode']?.toString() ??
          json['product_code']?.toString(),
      slug: json['slug']?.toString(),
      image: json['image']?.toString() ?? json['imageUrl']?.toString() ?? '',
      title: json['title']?.toString() ?? json['name']?.toString() ?? '',
      brand: json['brand']?.toString() ?? json['category']?.toString() ?? '',
      price: json['price']?.toString() ?? '',
      oldPrice: json['oldPrice']?.toString() ?? json['old_price']?.toString(),
      discount: json['discount']?.toString() ?? '',
      tags: tags,
      isFamilySafe: _familySafeFromJson(json, tags),
      citySlug: json['citySlug']?.toString() ?? json['city_slug']?.toString(),
      cityName: json['cityName']?.toString() ?? json['city_name']?.toString(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'code': code,
      'slug': slug,
      'image': image,
      'title': title,
      'brand': brand,
      'price': price,
      'oldPrice': oldPrice,
      'discount': discount,
      'tags': tags,
      'isFamilySafe': isFamilySafe,
      'citySlug': citySlug,
      'cityName': cityName,
    };
  }

  double get priceValue {
    final firstPrice = price.split('-').first.trim();
    return double.tryParse(
          firstPrice.replaceAll(RegExp(r'[^0-9.,-]'), '').replaceAll(',', ''),
        ) ??
        0.0;
  }

  bool matches(String query) {
    final normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.isEmpty) return true;

    return title.toLowerCase().contains(normalizedQuery) ||
        (code?.toLowerCase().contains(normalizedQuery) ?? false) ||
        brand.toLowerCase().contains(normalizedQuery) ||
        tags.any((tag) => tag.toLowerCase().contains(normalizedQuery));
  }

  bool isAllowedBySafeMode(bool safeMode) {
    return !safeMode || isFamilySafe;
  }
}

List<String> _stringList(Object? value) {
  if (value is! List) return const [];
  return value.map((item) => item.toString()).toList(growable: false);
}

bool _familySafeFromJson(Map<String, dynamic> json, List<String> tags) {
  final explicitSafe = _boolFromJson(
    json['isFamilySafe'] ??
        json['familySafe'] ??
        json['safeForFamily'] ??
        json['isSafeForFamily'] ??
        json['family_friendly'],
  );
  if (explicitSafe != null) return explicitSafe;

  final explicitRestricted = _boolFromJson(
    json['isAgeRestricted'] ??
        json['ageRestricted'] ??
        json['age_restricted'] ??
        json['adult'] ??
        json['mature'] ??
        json['nsfw'],
  );
  if (explicitRestricted != null) return !explicitRestricted;

  return !tags.map((tag) => tag.trim().toLowerCase()).any(_isUnsafeTag);
}

bool? _boolFromJson(Object? value) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  if (value is String) {
    final normalized = value.trim().toLowerCase();
    if (normalized == 'true' || normalized == 'yes' || normalized == '1') {
      return true;
    }
    if (normalized == 'false' || normalized == 'no' || normalized == '0') {
      return false;
    }
  }
  return null;
}

bool _isUnsafeTag(String tag) {
  const unsafeTags = {
    '18+',
    'adult',
    'alcohol',
    'mature',
    'nsfw',
    'smoking',
    'tobacco',
    'vape',
    'weapon',
    'سجائر',
    'تدخين',
    'تبغ',
    'خمور',
    'كحول',
  };
  return unsafeTags.contains(tag);
}
