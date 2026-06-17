class CartItemAttribute {
  const CartItemAttribute({required this.label, required this.value});

  final String label;
  final String value;

  factory CartItemAttribute.fromJson(Map<String, dynamic> json) {
    return CartItemAttribute(
      label: json['label']?.toString() ?? '',
      value: json['value']?.toString() ?? '',
    );
  }

  Map<String, Object?> toJson() => {'label': label, 'value': value};
}

class CartItemData {
  const CartItemData({
    required this.id,
    this.productId,
    this.variantId,
    required this.image,
    required this.brand,
    required this.title,
    required this.price,
    required this.quantity,
    this.attributes = const [],
    this.itemType = 'product',
    this.visibilityMode = 'general',
    this.regionSlugs = const [],
    this.regionNames = const [],
  });

  final String id;
  final String? productId;
  final String? variantId;
  final String image;
  final String brand;
  final String title;
  final double price;
  final int quantity;
  final List<CartItemAttribute> attributes;
  final String itemType;
  final String visibilityMode;
  final List<String> regionSlugs;
  final List<String> regionNames;

  bool get isOffer => itemType.trim().toLowerCase() == 'offer';

  bool get isGeneralVisibility {
    final mode = visibilityMode.trim().toLowerCase();
    return mode.isEmpty ||
        mode == 'general' ||
        mode == 'all' ||
        regionSlugs.isEmpty;
  }

  bool isAvailableForRegion(String regionSlug) {
    final normalized = regionSlug.trim().toLowerCase();
    if (isGeneralVisibility) return true;
    if (normalized.isEmpty || normalized == 'general') return false;
    return regionSlugs
        .map((slug) => slug.trim().toLowerCase())
        .contains(normalized);
  }

  factory CartItemData.fromJson(Map<String, dynamic> json) {
    return CartItemData(
      id: json['id'].toString(),
      productId:
          json['productId']?.toString() ?? json['product_id']?.toString(),
      variantId:
          json['variantId']?.toString() ?? json['variant_id']?.toString(),
      image: json['image']?.toString() ?? json['imageUrl']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      title: json['title']?.toString() ?? json['name']?.toString() ?? '',
      price: _doubleFromJson(json['price'] ?? json['unitPrice']),
      quantity: _intFromJson(json['quantity']) ?? 1,
      attributes: _attributesFromJson(json['attributes']),
      itemType:
          json['itemType']?.toString() ??
          json['item_type']?.toString() ??
          'product',
      visibilityMode:
          json['visibilityMode']?.toString() ??
          json['visibility_mode']?.toString() ??
          'general',
      regionSlugs: _stringList(json['regionSlugs'] ?? json['region_slugs']),
      regionNames: _stringList(json['regionNames'] ?? json['region_names']),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'productId': productId,
      'variantId': variantId,
      'image': image,
      'brand': brand,
      'title': title,
      'price': price,
      'quantity': quantity,
      'attributes': attributes.map((attribute) => attribute.toJson()).toList(),
      'itemType': itemType,
      'visibilityMode': visibilityMode,
      'regionSlugs': regionSlugs,
      'regionNames': regionNames,
    };
  }

  CartItemData copyWith({
    String? id,
    String? productId,
    String? variantId,
    String? image,
    String? brand,
    String? title,
    double? price,
    int? quantity,
    List<CartItemAttribute>? attributes,
    String? itemType,
    String? visibilityMode,
    List<String>? regionSlugs,
    List<String>? regionNames,
  }) {
    return CartItemData(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      variantId: variantId ?? this.variantId,
      image: image ?? this.image,
      brand: brand ?? this.brand,
      title: title ?? this.title,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
      attributes: attributes ?? this.attributes,
      itemType: itemType ?? this.itemType,
      visibilityMode: visibilityMode ?? this.visibilityMode,
      regionSlugs: regionSlugs ?? this.regionSlugs,
      regionNames: regionNames ?? this.regionNames,
    );
  }
}

List<CartItemAttribute> _attributesFromJson(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Map<String, dynamic>>()
      .map(CartItemAttribute.fromJson)
      .toList(growable: false);
}

List<String> _stringList(Object? value) {
  if (value is String) {
    return value
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList(growable: false);
  }
  if (value is! List) return const [];
  return value.map((item) => item.toString()).toList(growable: false);
}

double _doubleFromJson(Object? value) {
  if (value is num) return value.toDouble();
  if (value is String) {
    return double.tryParse(
          value.replaceAll(RegExp(r'[^0-9.,-]'), '').replaceAll(',', ''),
        ) ??
        0;
  }
  return 0;
}

int? _intFromJson(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value);
  return null;
}
