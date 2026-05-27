import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/cart_item.dart';
import '../../domain/repositories/cart_repository.dart';

class CartRepositoryImpl implements CartRepository {
  CartRepositoryImpl() : _items = <CartItemData>[];

  final List<CartItemData> _items;

  @override
  Future<ApiResult<List<CartItemData>>> getItems() async {
    return ApiResult.success(List.unmodifiable(_items));
  }

  @override
  Future<ApiResult<List<CartItemData>>> addItem(
    CartItemData item,
    int quantityToAdd,
  ) async {
    if (quantityToAdd <= 0) {
      return const ApiResult.failure(
        ValidationFailure('Quantity must be greater than zero.'),
      );
    }

    final index = _items.indexWhere((existing) => existing.id == item.id);
    if (index >= 0) {
      _items[index] = _items[index].copyWith(
        quantity: _items[index].quantity + quantityToAdd,
      );
    } else {
      _items.add(item.copyWith(quantity: quantityToAdd));
    }

    return ApiResult.success(List.unmodifiable(_items));
  }

  @override
  Future<ApiResult<List<CartItemData>>> incrementQuantity(String id) async {
    final index = _items.indexWhere((item) => item.id == id);
    if (index < 0) {
      return const ApiResult.failure(ValidationFailure('Cart item not found.'));
    }

    _items[index] = _items[index].copyWith(
      quantity: _items[index].quantity + 1,
    );
    return ApiResult.success(List.unmodifiable(_items));
  }

  @override
  Future<ApiResult<List<CartItemData>>> decrementQuantity(String id) async {
    final index = _items.indexWhere((item) => item.id == id);
    if (index < 0) {
      return const ApiResult.failure(ValidationFailure('Cart item not found.'));
    }

    final currentQuantity = _items[index].quantity;
    if (currentQuantity <= 1) {
      return ApiResult.success(List.unmodifiable(_items));
    }

    _items[index] = _items[index].copyWith(quantity: currentQuantity - 1);
    return ApiResult.success(List.unmodifiable(_items));
  }

  @override
  Future<ApiResult<List<CartItemData>>> removeItem(String id) async {
    _items.removeWhere((item) => item.id == id);
    return ApiResult.success(List.unmodifiable(_items));
  }

  @override
  Future<ApiResult<List<CartItemData>>> clear() async {
    _items.clear();
    return ApiResult.success(List.unmodifiable(_items));
  }
}
