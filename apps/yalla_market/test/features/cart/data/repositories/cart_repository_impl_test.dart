import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/cart/data/repositories/cart_repository_impl.dart';
import 'package:yalla_market/features/cart/domain/entities/cart_item.dart';

void main() {
  group('CartRepositoryImpl', () {
    late CartRepositoryImpl repository;

    setUp(() {
      repository = CartRepositoryImpl();
    });

    test('adds a new item to the cart', () async {
      const item = CartItemData(
        id: 'new-item',
        image: 'image.png',
        brand: 'Yalla',
        title: 'New product',
        price: 10,
        quantity: 1,
      );

      final result = await repository.addItem(item, 2);

      result.when(
        success: (items) {
          final addedItem = items.firstWhere((item) => item.id == 'new-item');
          expect(addedItem.quantity, 2);
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('increments existing item quantity when adding same item', () async {
      const item = CartItemData(
        id: 'same-item',
        image: 'image.png',
        brand: 'Yalla',
        title: 'Same product',
        price: 10,
        quantity: 1,
      );

      await repository.addItem(item, 1);
      final result = await repository.addItem(item, 3);

      result.when(
        success: (items) {
          final addedItem = items.firstWhere((item) => item.id == 'same-item');
          expect(addedItem.quantity, 4);
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('does not decrement quantity below one', () async {
      const firstItem = CartItemData(
        id: 'single-item',
        image: 'image.png',
        brand: 'Yalla',
        title: 'Single product',
        price: 10,
        quantity: 1,
      );
      await repository.addItem(firstItem, 1);

      final result = await repository.decrementQuantity(firstItem.id);

      result.when(
        success: (items) {
          final updatedItem = items.firstWhere(
            (item) => item.id == firstItem.id,
          );
          expect(
            updatedItem.quantity,
            firstItem.quantity == 1 ? 1 : firstItem.quantity - 1,
          );
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('starts with an empty cart', () async {
      final result = await repository.getItems();

      result.when(
        success: (items) => expect(items, isEmpty),
        failure: (failure) => fail(failure.message),
      );
    });
  });
}
