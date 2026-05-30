import '../../../cart/domain/entities/cart_item.dart';

enum OrderStatus { pending, processing, shipped, delivered, cancelled }

class ShippingAddressData {
  const ShippingAddressData({
    required this.fullName,
    required this.phone,
    required this.line1,
    required this.city,
    required this.state,
    required this.country,
    required this.postalCode,
  });

  final String fullName;
  final String phone;
  final String line1;
  final String city;
  final String state;
  final String country;
  final String postalCode;

  factory ShippingAddressData.fromJson(Map<String, dynamic> json) {
    return ShippingAddressData(
      fullName:
          json['fullName']?.toString() ?? json['full_name']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      line1: json['line1']?.toString() ?? json['address']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      postalCode:
          json['postalCode']?.toString() ??
          json['postal_code']?.toString() ??
          '',
    );
  }

  String get formatted {
    return [
      line1,
      city,
      state,
      country,
    ].where((part) => part.trim().isNotEmpty).join(', ');
  }

  Map<String, Object?> toJson() {
    return {
      'fullName': fullName,
      'phone': phone,
      'line1': line1,
      'city': city,
      'state': state,
      'country': country,
      'postalCode': postalCode,
    };
  }
}

class OrderItemData {
  const OrderItemData({
    required this.id,
    this.productId,
    this.variantId,
    required this.image,
    required this.brand,
    required this.title,
    required this.unitPrice,
    required this.quantity,
    this.attributes = const [],
  });

  factory OrderItemData.fromCartItem(CartItemData item) {
    return OrderItemData(
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      image: item.image,
      brand: item.brand,
      title: item.title,
      unitPrice: item.price,
      quantity: item.quantity,
      attributes: item.attributes,
    );
  }

  final String id;
  final String? productId;
  final String? variantId;
  final String image;
  final String brand;
  final String title;
  final double unitPrice;
  final int quantity;
  final List<CartItemAttribute> attributes;

  factory OrderItemData.fromJson(Map<String, dynamic> json) {
    return OrderItemData(
      id: json['id'].toString(),
      productId:
          json['productId']?.toString() ?? json['product_id']?.toString(),
      variantId:
          json['variantId']?.toString() ?? json['variant_id']?.toString(),
      image: json['image']?.toString() ?? json['imageUrl']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      title: json['title']?.toString() ?? json['name']?.toString() ?? '',
      unitPrice: _doubleFromJson(
        json['unitPrice'] ?? json['unit_price'] ?? json['price'],
      ),
      quantity: _intFromJson(json['quantity']) ?? 1,
      attributes: _attributesFromJson(json['attributes']),
    );
  }

  double get lineTotal => unitPrice * quantity;

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'productId': productId,
      'variantId': variantId,
      'image': image,
      'brand': brand,
      'title': title,
      'unitPrice': unitPrice,
      'quantity': quantity,
      'attributes': attributes
          .map(
            (attribute) => {'label': attribute.label, 'value': attribute.value},
          )
          .toList(),
    };
  }
}

class OrderData {
  const OrderData({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.placedAt,
    required this.shippingAddress,
    required this.paymentMethod,
    required this.items,
    required this.subtotal,
    required this.shippingFee,
    required this.taxTotal,
    required this.discountTotal,
    required this.total,
    this.estimatedDeliveryAt,
  });

  final String id;
  final String orderNumber;
  final OrderStatus status;
  final DateTime placedAt;
  final ShippingAddressData shippingAddress;
  final String paymentMethod;
  final List<OrderItemData> items;
  final double subtotal;
  final double shippingFee;
  final double taxTotal;
  final double discountTotal;
  final double total;
  final DateTime? estimatedDeliveryAt;

  factory OrderData.fromJson(Map<String, dynamic> json) {
    return OrderData(
      id: json['id'].toString(),
      orderNumber:
          json['orderNumber']?.toString() ??
          json['order_number']?.toString() ??
          '',
      status: _statusFromJson(json['status']),
      placedAt:
          _dateFromJson(json['placedAt'] ?? json['placed_at']) ??
          DateTime.now(),
      shippingAddress: ShippingAddressData.fromJson(
        (json['shippingAddress'] ?? json['shipping_address'])
            as Map<String, dynamic>,
      ),
      paymentMethod:
          json['paymentMethod']?.toString() ??
          json['payment_method']?.toString() ??
          'cash_on_delivery',
      items: _itemsFromJson(json['items']),
      subtotal: _doubleFromJson(json['subtotal']),
      shippingFee: _doubleFromJson(json['shippingFee'] ?? json['shipping_fee']),
      taxTotal: _doubleFromJson(json['taxTotal'] ?? json['tax_total']),
      discountTotal: _doubleFromJson(
        json['discountTotal'] ?? json['discount_total'],
      ),
      total: _doubleFromJson(json['total']),
      estimatedDeliveryAt: _dateFromJson(
        json['estimatedDeliveryAt'] ?? json['estimated_delivery_at'],
      ),
    );
  }

  int get itemCount {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  String get statusLabel {
    return switch (status) {
      OrderStatus.pending => 'Pending',
      OrderStatus.processing => 'Processing',
      OrderStatus.shipped => 'Shipment on the way',
      OrderStatus.delivered => 'Delivered',
      OrderStatus.cancelled => 'Cancelled',
    };
  }

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'orderNumber': orderNumber,
      'status': status.name,
      'placedAt': placedAt.toIso8601String(),
      'shippingAddress': shippingAddress.toJson(),
      'paymentMethod': paymentMethod,
      'items': items.map((item) => item.toJson()).toList(),
      'subtotal': subtotal,
      'shippingFee': shippingFee,
      'taxTotal': taxTotal,
      'discountTotal': discountTotal,
      'total': total,
      'estimatedDeliveryAt': estimatedDeliveryAt?.toIso8601String(),
    };
  }
}

OrderStatus _statusFromJson(Object? value) {
  final name = value?.toString().toLowerCase();
  return OrderStatus.values.firstWhere(
    (status) => status.name == name,
    orElse: () => OrderStatus.processing,
  );
}

DateTime? _dateFromJson(Object? value) {
  if (value is! String || value.trim().isEmpty) return null;
  return DateTime.tryParse(value);
}

List<OrderItemData> _itemsFromJson(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Map<String, dynamic>>()
      .map(OrderItemData.fromJson)
      .toList(growable: false);
}

List<CartItemAttribute> _attributesFromJson(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Map<String, dynamic>>()
      .map(CartItemAttribute.fromJson)
      .toList(growable: false);
}

double _doubleFromJson(Object? value) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}

int? _intFromJson(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value);
  return null;
}
