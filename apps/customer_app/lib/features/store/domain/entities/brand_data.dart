class BrandData {
  const BrandData({
    required this.id,
    required this.name,
    required this.slug,
    required this.productCount,
    required this.image,
    required this.accentColorValue,
    this.keywords = const [],
  });

  final String id;
  final String name;
  final String slug;
  final int productCount;
  final String image;
  final int accentColorValue;
  final List<String> keywords;

  factory BrandData.fromJson(Map<String, dynamic> json) {
    return BrandData(
      id: json['id']?.toString() ?? json['slug']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug:
          json['slug']?.toString() ?? _slugFrom(json['name']?.toString() ?? ''),
      productCount: _intFromJson(
        json['productCount'] ?? json['product_count'] ?? json['count'],
      ),
      image:
          json['image']?.toString() ??
          json['logo']?.toString() ??
          json['imageUrl']?.toString() ??
          '',
      accentColorValue: _colorFromJson(
        json['accentColor'] ?? json['accent_color'] ?? json['color'],
      ),
      keywords: _stringList(json['keywords']),
    );
  }

  String get productCountLabel =>
      '$productCount product${productCount == 1 ? '' : 's'}';

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'productCount': productCount,
      'image': image,
      'accentColor': accentColorValue,
      'keywords': keywords,
    };
  }
}

String _slugFrom(String value) {
  return value
      .trim()
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9\u0600-\u06ff]+'), '-')
      .replaceAll(RegExp(r'^-+|-+$'), '');
}

List<String> _stringList(Object? value) {
  if (value is! List) return const [];
  return value.map((item) => item.toString()).toList(growable: false);
}

int _intFromJson(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) {
    return int.tryParse(value.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
  }
  return 0;
}

int _colorFromJson(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) {
    final normalized = value.trim().replaceFirst('#', '');
    final parsed = int.tryParse(normalized, radix: 16);
    if (parsed != null) {
      return normalized.length <= 6 ? 0xFF000000 | parsed : parsed;
    }
  }
  return 0xFF4F60F6;
}
