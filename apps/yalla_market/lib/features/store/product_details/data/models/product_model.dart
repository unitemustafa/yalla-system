import 'product_option_group.dart';

class ProductModel {
  const ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.image,
    required this.basePrice,
    this.discountPrice,
    this.calories,
    this.optionGroups = const [],
    this.bundleItems = const [],
    this.notesEnabled = true,
  });

  final int id;
  final String name;
  final String description;
  final String image;
  final double basePrice;
  final double? discountPrice;
  final int? calories;
  final List<ProductOptionGroup> optionGroups;
  final List<BundleItem> bundleItems;
  final bool notesEnabled;

  /// السعر الذي يبدأ منه الحساب قبل إضافة أسعار الاختيارات.
  bool get hasDiscount =>
      discountPrice != null &&
      discountPrice! > 0 &&
      basePrice > 0 &&
      discountPrice! < basePrice;

  double get effectiveBasePrice => hasDiscount ? discountPrice! : basePrice;

  bool get hasOptions => optionGroups.isNotEmpty;
  bool get isBundle => bundleItems.isNotEmpty;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: _readInt(json['id']),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      image: json['image']?.toString() ?? '',
      basePrice: _readDouble(json['basePrice'] ?? json['base_price']),
      discountPrice: _readNullableDouble(
        json['discountPrice'] ?? json['discount_price'],
      ),
      calories: _readNullableInt(json['calories']),
      optionGroups: _readMapList(
        json['optionGroups'] ?? json['option_groups'],
      ).map(ProductOptionGroup.fromJson).toList(),
      bundleItems: _readMapList(
        json['bundleItems'] ?? json['bundle_items'],
      ).map(BundleItem.fromJson).toList(),
      notesEnabled: _readBool(
        json['notesEnabled'] ?? json['notes_enabled'],
        fallback: true,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'image': image,
      'basePrice': basePrice,
      'discountPrice': discountPrice,
      'calories': calories,
      'optionGroups': optionGroups.map((group) => group.toJson()).toList(),
      'bundleItems': bundleItems.map((item) => item.toJson()).toList(),
      'notesEnabled': notesEnabled,
    };
  }

  ProductModel copyWith({
    int? id,
    String? name,
    String? description,
    String? image,
    double? basePrice,
    double? discountPrice,
    int? calories,
    List<ProductOptionGroup>? optionGroups,
    List<BundleItem>? bundleItems,
    bool? notesEnabled,
  }) {
    return ProductModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      image: image ?? this.image,
      basePrice: basePrice ?? this.basePrice,
      discountPrice: discountPrice ?? this.discountPrice,
      calories: calories ?? this.calories,
      optionGroups: optionGroups ?? this.optionGroups,
      bundleItems: bundleItems ?? this.bundleItems,
      notesEnabled: notesEnabled ?? this.notesEnabled,
    );
  }

  static int _readInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  static int? _readNullableInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value.toString());
  }

  static double _readDouble(dynamic value) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }

  static double? _readNullableDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  static bool _readBool(dynamic value, {bool fallback = false}) {
    if (value == null) return fallback;
    if (value is bool) return value;
    final text = value.toString().toLowerCase();
    return text == 'true' || text == '1';
  }

  static List<Map<String, dynamic>> _readMapList(dynamic value) {
    if (value is! List) return const [];
    return value.whereType<Map<String, dynamic>>().toList();
  }
}

class BundleItem {
  const BundleItem({
    required this.productId,
    required this.productName,
    this.image,
    this.quantity = 1,
    this.unitPrice,
  }) : assert(quantity > 0);

  final int productId;
  final String productName;
  final String? image;
  final int quantity;
  final double? unitPrice;

  factory BundleItem.fromJson(Map<String, dynamic> json) {
    return BundleItem(
      productId: ProductModel._readInt(json['productId'] ?? json['product_id']),
      productName:
          json['productName']?.toString() ??
          json['product_name']?.toString() ??
          '',
      image: json['image']?.toString(),
      quantity: ProductModel._readInt(json['quantity'] ?? 1),
      unitPrice: ProductModel._readNullableDouble(
        json['unitPrice'] ?? json['unit_price'],
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'image': image,
      'quantity': quantity,
      'unitPrice': unitPrice,
    };
  }

  BundleItem copyWith({
    int? productId,
    String? productName,
    String? image,
    int? quantity,
    double? unitPrice,
  }) {
    return BundleItem(
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      image: image ?? this.image,
      quantity: quantity ?? this.quantity,
      unitPrice: unitPrice ?? this.unitPrice,
    );
  }
}
