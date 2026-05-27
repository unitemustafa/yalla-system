import '../../../../core/network/api_result.dart';
import '../entities/wishlist_item.dart';
import '../repositories/wishlist_repository.dart';

class WishlistUseCases {
  const WishlistUseCases({required this.getItems, required this.toggleItem});

  final GetWishlistItemsUseCase getItems;
  final ToggleWishlistItemUseCase toggleItem;
}

class GetWishlistItemsUseCase {
  const GetWishlistItemsUseCase(this._repository);

  final WishlistRepository _repository;

  Future<ApiResult<List<WishlistItem>>> call() => _repository.getItems();
}

class ToggleWishlistItemUseCase {
  const ToggleWishlistItemUseCase(this._repository);

  final WishlistRepository _repository;

  Future<ApiResult<List<WishlistItem>>> call(WishlistItem item) {
    return _repository.toggleItem(item);
  }
}
