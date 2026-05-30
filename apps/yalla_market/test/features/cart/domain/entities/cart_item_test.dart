import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/cart/domain/entities/cart_item.dart';

void main() {
  group('CartItemAttribute', () {
    test('maps to and from json', () {
      const attribute = CartItemAttribute(label: 'Size', value: 'Large');

      expect(attribute.toJson(), {'label': 'Size', 'value': 'Large'});
      expect(
        CartItemAttribute.fromJson({
          'label': 'Color',
          'value': 'Green',
        }).toJson(),
        {'label': 'Color', 'value': 'Green'},
      );
    });
  });

  group('CartItemData', () {
    test('parses API payload variants and normalizes price values', () {
      final item = CartItemData.fromJson({
        'id': 10,
        'product_id': 20,
        'variant_id': 30,
        'imageUrl': 'https://cdn.example.com/products/product.png',
        'brand': 'Yalla',
        'name': 'Market basket',
        'unitPrice': 'EGP 1,250.50',
        'quantity': '3',
        'attributes': [
          {'label': 'Size', 'value': 'Medium'},
        ],
      });

      expect(item.id, '10');
      expect(item.productId, '20');
      expect(item.variantId, '30');
      expect(item.image, 'https://cdn.example.com/products/product.png');
      expect(item.title, 'Market basket');
      expect(item.price, 1250.5);
      expect(item.quantity, 3);
      expect(item.attributes.single.label, 'Size');
    });

    test('falls back to safe defaults for partial payloads', () {
      final item = CartItemData.fromJson({'id': 'cart-1'});

      expect(item.id, 'cart-1');
      expect(item.image, isEmpty);
      expect(item.brand, isEmpty);
      expect(item.title, isEmpty);
      expect(item.price, 0);
      expect(item.quantity, 1);
      expect(item.attributes, isEmpty);
    });

    test('copyWith updates only provided fields', () {
      const item = CartItemData(
        id: '1',
        productId: 'product-1',
        image: 'old.png',
        brand: 'Old brand',
        title: 'Old title',
        price: 10,
        quantity: 1,
      );

      final updated = item.copyWith(title: 'New title', quantity: 4);

      expect(updated.id, item.id);
      expect(updated.productId, item.productId);
      expect(updated.image, item.image);
      expect(updated.brand, item.brand);
      expect(updated.title, 'New title');
      expect(updated.price, item.price);
      expect(updated.quantity, 4);
    });

    test('serializes all public fields', () {
      const item = CartItemData(
        id: '1',
        productId: 'product-1',
        variantId: 'variant-1',
        image: 'product.png',
        brand: 'Yalla',
        title: 'Market basket',
        price: 12.5,
        quantity: 2,
        attributes: [CartItemAttribute(label: 'Size', value: 'Large')],
      );

      expect(item.toJson(), {
        'id': '1',
        'productId': 'product-1',
        'variantId': 'variant-1',
        'image': 'product.png',
        'brand': 'Yalla',
        'title': 'Market basket',
        'price': 12.5,
        'quantity': 2,
        'attributes': [
          {'label': 'Size', 'value': 'Large'},
        ],
      });
    });
  });
}
