import 'product_option.dart';

class ProductOptionGroup {
  const ProductOptionGroup({
    required this.id,
    required this.title,
    this.isRequired = false,
    this.minSelect = 0,
    this.maxSelect = 1,
    this.options = const [],
  }) : assert(minSelect >= 0),
       assert(maxSelect >= 1),
       assert(minSelect <= maxSelect);

  final int id;
  final String title;
  final bool isRequired;
  final int minSelect;
  final int maxSelect;
  final List<ProductOption> options;

  /// أقل عدد اختيارات مطلوب فعليًا لإكمال المجموعة.
  int get requiredCount => isRequired && minSelect == 0 ? 1 : minSelect;

  bool get isSingleSelection => maxSelect == 1;

  factory ProductOptionGroup.fromJson(Map<String, dynamic> json) {
    return ProductOptionGroup(
      id: _readInt(json['id']),
      title: json['title']?.toString() ?? '',
      isRequired: _readBool(json['isRequired'] ?? json['is_required']),
      minSelect: _readInt(json['minSelect'] ?? json['min_select']),
      maxSelect: _readInt(json['maxSelect'] ?? json['max_select'], fallback: 1),
      options: _readMapList(
        json['options'],
      ).map(ProductOption.fromJson).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'isRequired': isRequired,
      'minSelect': minSelect,
      'maxSelect': maxSelect,
      'options': options.map((option) => option.toJson()).toList(),
    };
  }

  ProductOptionGroup copyWith({
    int? id,
    String? title,
    bool? isRequired,
    int? minSelect,
    int? maxSelect,
    List<ProductOption>? options,
  }) {
    return ProductOptionGroup(
      id: id ?? this.id,
      title: title ?? this.title,
      isRequired: isRequired ?? this.isRequired,
      minSelect: minSelect ?? this.minSelect,
      maxSelect: maxSelect ?? this.maxSelect,
      options: options ?? this.options,
    );
  }

  static int _readInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static bool _readBool(dynamic value) {
    if (value is bool) return value;
    final text = value?.toString().toLowerCase();
    return text == 'true' || text == '1';
  }

  static List<Map<String, dynamic>> _readMapList(dynamic value) {
    if (value is! List) return const [];
    return value.whereType<Map<String, dynamic>>().toList();
  }
}
