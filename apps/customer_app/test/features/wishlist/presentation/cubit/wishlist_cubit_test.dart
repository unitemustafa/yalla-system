import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/errors/failure.dart';
import 'package:yallamarket/core/network/api_result.dart';
import 'package:yallamarket/features/wishlist/domain/entities/wishlist_item.dart';
import 'package:yallamarket/features/wishlist/domain/repositories/wishlist_repository.dart';
import 'package:yallamarket/features/wishlist/domain/usecases/wishlist_usecases.dart';
import 'package:yallamarket/features/wishlist/presentation/cubit/wishlist_cubit.dart';

import '../../../../helpers/domain_fixtures.dart';

void main() {
  group('WishlistCubit', () {
    test('loads wishlist items when it is created', () async {
      final cubit = WishlistCubit(
        _wishlistUseCases(
          _FakeWishlistRepository(items: const [sampleWishlistItem]),
        ),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emits(
          predicate<List<WishlistItem>>(
            (items) =>
                items.length == 1 &&
                items.first.title == sampleWishlistItem.title,
          ),
        ),
      );

      await expectedStates;

      expect(cubit.isFavorite(sampleWishlistItem.title), isTrue);
      await cubit.close();
    });

    test('toggles an item in and out of the wishlist', () async {
      final repository = _FakeWishlistRepository();
      final cubit = WishlistCubit(_wishlistUseCases(repository));
      await Future<void>.delayed(Duration.zero);

      await cubit.toggleItem(sampleWishlistItem);
      expect(cubit.isFavorite(sampleWishlistItem.title), isTrue);

      await cubit.toggleItem(sampleWishlistItem);
      expect(cubit.isFavorite(sampleWishlistItem.title), isFalse);
      await cubit.close();
    });

    test('keeps current state when toggling fails', () async {
      final repository = _FakeWishlistRepository(
        items: const [sampleWishlistItem],
      );
      final cubit = WishlistCubit(_wishlistUseCases(repository));
      await Future<void>.delayed(Duration.zero);
      repository.nextFailure = const ServerFailure('Wishlist is unavailable.');

      await cubit.toggleItem(sampleWishlistItem);

      expect(cubit.isFavorite(sampleWishlistItem.title), isTrue);
      await cubit.close();
    });
  });
}

WishlistUseCases _wishlistUseCases(WishlistRepository repository) {
  return WishlistUseCases(
    getItems: GetWishlistItemsUseCase(repository),
    toggleItem: ToggleWishlistItemUseCase(repository),
  );
}

class _FakeWishlistRepository implements WishlistRepository {
  _FakeWishlistRepository({List<WishlistItem> items = const []})
    : _items = List.of(items);

  final List<WishlistItem> _items;
  Failure? nextFailure;

  Future<ApiResult<List<WishlistItem>>> _result() async {
    if (nextFailure case final failure?) {
      nextFailure = null;
      return ApiResult.failure(failure);
    }

    return ApiResult.success(List.unmodifiable(_items));
  }

  @override
  Future<ApiResult<List<WishlistItem>>> getItems() => _result();

  @override
  Future<ApiResult<List<WishlistItem>>> toggleItem(WishlistItem item) async {
    final index = _items.indexWhere((entry) => entry.title == item.title);
    if (index == -1) {
      _items.add(item);
    } else {
      _items.removeAt(index);
    }

    return _result();
  }
}
