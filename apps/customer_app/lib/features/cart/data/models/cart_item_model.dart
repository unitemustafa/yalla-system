import '../../../store/product_details/data/models/product_option.dart';

class CartItemModel {
  CartItemModel({
    required this.productId,
    required this.productName,
    required this.quantity,
    required Map<int, List<ProductOption>> selectedOptions,
    this.notes = '',
    required this.unitPrice,
    required this.totalPrice,
  }) : selectedOptions = _immutableOptions(selectedOptions);

  final int productId;
  final String productName;
  final int quantity;
  final Map<int, List<ProductOption>> selectedOptions;
  final String notes;
  final double unitPrice;
  final double totalPrice;

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    final selectedOptionsJson = json['selectedOptions'];
    final selectedOptions = <int, List<ProductOption>>{};

    if (selectedOptionsJson is Map) {
      selectedOptionsJson.forEach((key, value) {
        final groupId = int.tryParse(key.toString());
        if (groupId == null || value is! List) return;

        selectedOptions[groupId] = value
            .whereType<Map<String, dynamic>>()
            .map(ProductOption.fromJson)
            .toList();
      });
    }

    return CartItemModel(
      productId: _readInt(json['productId'] ?? json['product_id']),
      productName:
          json['productName']?.toString() ??
          json['product_name']?.toString() ??
          '',
      quantity: _readInt(json['quantity']),
      selectedOptions: selectedOptions,
      notes: json['notes']?.toString() ?? '',
      unitPrice: _readDouble(json['unitPrice'] ?? json['unit_price']),
      totalPrice: _readDouble(json['totalPrice'] ?? json['total_price']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'quantity': quantity,
      'selectedOptions': selectedOptions.map(
        (groupId, options) => MapEntry(
          groupId.toString(),
          options.map((option) => option.toJson()).toList(),
        ),
      ),
      'notes': notes,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
    };
  }

  CartItemModel copyWith({
    int? productId,
    String? productName,
    int? quantity,
    Map<int, List<ProductOption>>? selectedOptions,
    String? notes,
    double? unitPrice,
    double? totalPrice,
  }) {
    return CartItemModel(
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      quantity: quantity ?? this.quantity,
      selectedOptions: selectedOptions ?? this.selectedOptions,
      notes: notes ?? this.notes,
      unitPrice: unitPrice ?? this.unitPrice,
      totalPrice: totalPrice ?? this.totalPrice,
    );
  }

  static Map<int, List<ProductOption>> _immutableOptions(
    Map<int, List<ProductOption>> options,
  ) {
    return Map.unmodifiable(
      options.map((key, value) => MapEntry(key, List.unmodifiable(value))),
    );
  }

  static int _readInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  static double _readDouble(dynamic value) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}
