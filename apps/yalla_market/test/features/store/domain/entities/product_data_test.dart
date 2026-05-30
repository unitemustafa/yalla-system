import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/store/domain/entities/product_data.dart';

void main() {
  group('ProductData', () {
    test('keeps remote imageUrl values unchanged', () {
      const imageUrl = 'https://cdn.example.com/products/product_1.png';

      final product = ProductData.fromJson({
        'id': 'product_1',
        'imageUrl': imageUrl,
        'title': 'Running Shoe',
        'brand': 'Yalla',
        'price': '1200 EGP',
      });

      expect(product.image, imageUrl);
    });

    test('parses city metadata from API payloads', () {
      final product = ProductData.fromJson({
        'id': 'product_1',
        'image': 'shoe.png',
        'title': 'Running Shoe',
        'brand': 'Yalla',
        'price': '1200 EGP',
        'citySlug': 'sharm-el-sheikh',
        'cityName': 'Sharm El Sheikh',
      });

      expect(product.citySlug, 'sharm-el-sheikh');
      expect(product.cityName, 'Sharm El Sheikh');
      expect(product.toJson()['citySlug'], 'sharm-el-sheikh');
    });
  });
}
