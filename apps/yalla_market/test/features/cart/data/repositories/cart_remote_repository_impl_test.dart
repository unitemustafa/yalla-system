import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/cart/data/repositories/cart_remote_repository_impl.dart';
import 'package:yalla_market/features/cart/domain/entities/cart_item.dart';

import '../../../../helpers/fake_api_client.dart';

void main() {
  group('CartRemoteRepositoryImpl', () {
    test('adds items using product id and quantity contract', () async {
      late FakeApiRequest capturedRequest;
      final apiClient = FakeApiClient((request) {
        capturedRequest = request;
        return {
          'items': [
            {
              'id': 'cart-1',
              'productId': 'product-1',
              'image': 'image.png',
              'brand': 'Yalla',
              'title': 'Fresh product',
              'price': 10,
              'quantity': 2,
            },
          ],
        };
      });
      final repository = CartRemoteRepositoryImpl(apiClient);

      final result = await repository.addItem(
        const CartItemData(
          id: 'fallback-id',
          productId: 'product-1',
          image: 'image.png',
          brand: 'Yalla',
          title: 'Fresh product',
          price: 10,
          quantity: 1,
        ),
        2,
      );

      result.when(
        success: (items) => expect(items.single.quantity, 2),
        failure: (failure) => fail(failure.message),
      );
      expect(capturedRequest.method, 'POST');
      expect(capturedRequest.path, '/cart/items');
      expect(capturedRequest.data, containsPair('quantity', 2));
      expect(capturedRequest.data, containsPair('productId', 'product-1'));
    });
  });
}
