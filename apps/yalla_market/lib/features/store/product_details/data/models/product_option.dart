class ProductOption {
  const ProductOption({
    required this.id,
    required this.name,
    this.extraPrice = 0,
    this.image,
  });

  final int id;
  final String name;
  final double extraPrice;
  final String? image;

  factory ProductOption.fromJson(Map<String, dynamic> json) {
    return ProductOption(
      id: _readInt(json['id']),
      name: json['name']?.toString() ?? '',
      extraPrice: _readDouble(json['extraPrice'] ?? json['extra_price']),
      image: json['image']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'extraPrice': extraPrice, 'image': image};
  }

  ProductOption copyWith({
    int? id,
    String? name,
    double? extraPrice,
    String? image,
  }) {
    return ProductOption(
      id: id ?? this.id,
      name: name ?? this.name,
      extraPrice: extraPrice ?? this.extraPrice,
      image: image ?? this.image,
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
