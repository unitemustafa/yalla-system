import '../../../../core/network/api_result.dart';
import '../../domain/entities/wishlist_item.dart';
import '../../domain/repositories/wishlist_repository.dart';

class WishlistRepositoryImpl implements WishlistRepository {
  final List<WishlistItem> _items = [];

  @override
  Future<ApiResult<List<WishlistItem>>> getItems() async {
    return ApiResult.success(List.unmodifiable(_items));
  }

  @override
  Future<ApiResult<List<WishlistItem>>> toggleItem(WishlistItem item) async {
    final exists = _items.any((element) => element.title == item.title);
    if (exists) {
      _items.removeWhere((element) => element.title == item.title);
    } else {
      _items.add(item);
    }

    return ApiResult.success(List.unmodifiable(_items));
  }
}
