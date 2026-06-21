import '../../store/domain/entities/product_data.dart';

class HomeData {
  const HomeData({
    required this.cityName,
    required this.citySlug,
    required this.offers,
    required this.classifications,
    required this.products,
  });

  final String cityName;
  final String citySlug;
  final List<HomeOfferData> offers;
  final List<HomeClassificationData> classifications;
  final List<ProductData> products;

  bool get isEmpty =>
      offers.isEmpty && classifications.isEmpty && products.isEmpty;

  factory HomeData.fromJson(Map<String, dynamic> json) {
    final location = _map(json['location']);
    return HomeData(
      cityName: '${location?['name'] ?? ''}',
      citySlug: '${location?['slug'] ?? location?['city_id'] ?? ''}',
      offers: _maps(json['offers']).map(HomeOfferData.fromJson).toList(),
      classifications: _maps(
        json['market_classifications'],
      ).map(HomeClassificationData.fromJson).toList(),
      products: _maps(json['products']).map(_productFromJson).toList(),
    );
  }
}

class HomeOfferData {
  const HomeOfferData({
    required this.id,
    required this.title,
    required this.description,
    required this.image,
    required this.discount,
  });

  final String id;
  final String title;
  final String description;
  final String? image;
  final String discount;

  factory HomeOfferData.fromJson(Map<String, dynamic> json) {
    return HomeOfferData(
      id: '${json['id'] ?? ''}',
      title: '${json['title'] ?? ''}',
      description: '${json['description'] ?? ''}',
      image: json['image']?.toString(),
      discount: '${json['discount'] ?? ''}',
    );
  }
}

class HomeClassificationData {
  const HomeClassificationData({
    required this.id,
    required this.name,
    required this.marketCount,
  });

  final String id;
  final String name;
  final int marketCount;

  factory HomeClassificationData.fromJson(Map<String, dynamic> json) {
    final markets = json['markets'];
    return HomeClassificationData(
      id: '${json['id'] ?? ''}',
      name: '${json['name'] ?? ''}',
      marketCount: markets is List ? markets.length : 0,
    );
  }
}

ProductData _productFromJson(Map<String, dynamic> json) {
  final category = _map(json['category']);
  final market = _map(json['market']);
  final price = json['min_price'] ?? _firstVariantPrice(json['variants']);
  final discount = '${json['discount'] ?? ''}';
  return ProductData(
    id: '${json['id'] ?? ''}',
    slug: json['slug']?.toString(),
    image: json['image']?.toString() ?? '',
    title: '${json['name'] ?? ''}',
    brand: '${category?['name'] ?? market?['name'] ?? ''}',
    price: price == null ? '' : price.toString(),
    oldPrice: null,
    discount: discount == '0' || discount == '0.00' ? '' : discount,
    tags: const [],
    citySlug: market?['city_id']?.toString(),
  );
}

Object? _firstVariantPrice(Object? variants) {
  if (variants is! List || variants.isEmpty) return null;
  final first = variants.first;
  return first is Map ? first['price'] : null;
}

Map<String, dynamic>? _map(Object? value) {
  return value is Map ? Map<String, dynamic>.from(value) : null;
}

List<Map<String, dynamic>> _maps(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Map>()
      .map((item) => Map<String, dynamic>.from(item))
      .toList(growable: false);
}
