import '../../../../core/network/api_result.dart';
import '../entities/wishlist_item.dart';

abstract class WishlistRepository {
  Future<ApiResult<List<WishlistItem>>> getItems();

  Future<ApiResult<List<WishlistItem>>> toggleItem(WishlistItem item);
}
