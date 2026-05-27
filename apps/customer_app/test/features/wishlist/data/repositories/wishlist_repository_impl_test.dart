import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/features/wishlist/data/repositories/wishlist_repository_impl.dart';
import 'package:yallamarket/features/wishlist/domain/entities/wishlist_item.dart';

void main() {
  group('WishlistRepositoryImpl', () {
    late WishlistRepositoryImpl repository;

    setUp(() {
      repository = WishlistRepositoryImpl();
    });

    test('adds item when it is not in wishlist', () async {
      const item = WishlistItem(
        image: 'image.png',
        title: 'Fresh product',
        brand: 'Yalla',
        price: r'$10',
      );

      final result = await repository.toggleItem(item);

      result.when(
        success: (items) => expect(items, hasLength(1)),
        failure: (failure) => fail(failure.message),
      );
    });

    test('removes item when it already exists', () async {
      const item = WishlistItem(
        image: 'image.png',
        title: 'Fresh product',
        brand: 'Yalla',
        price: r'$10',
      );

      await repository.toggleItem(item);
      final result = await repository.toggleItem(item);

      result.when(
        success: (items) => expect(items, isEmpty),
        failure: (failure) => fail(failure.message),
      );
    });
  });
}
