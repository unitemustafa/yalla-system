import '../../../../core/network/api_result.dart';
import '../entities/cart_item.dart';

abstract class CartRepository {
  Future<ApiResult<List<CartItemData>>> getItems();

  Future<ApiResult<List<CartItemData>>> addItem(
    CartItemData item,
    int quantityToAdd,
  );

  Future<ApiResult<List<CartItemData>>> incrementQuantity(String id);

  Future<ApiResult<List<CartItemData>>> decrementQuantity(String id);

  Future<ApiResult<List<CartItemData>>> removeItem(String id);

  Future<ApiResult<List<CartItemData>>> clear();
}
