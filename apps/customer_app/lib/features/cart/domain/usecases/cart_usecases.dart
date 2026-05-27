import '../../../../core/network/api_result.dart';
import '../entities/cart_item.dart';
import '../repositories/cart_repository.dart';

class CartUseCases {
  const CartUseCases({
    required this.getItems,
    required this.addItem,
    required this.incrementQuantity,
    required this.decrementQuantity,
    required this.removeItem,
    required this.clearCart,
  });

  final GetCartItemsUseCase getItems;
  final AddCartItemUseCase addItem;
  final IncrementCartItemQuantityUseCase incrementQuantity;
  final DecrementCartItemQuantityUseCase decrementQuantity;
  final RemoveCartItemUseCase removeItem;
  final ClearCartUseCase clearCart;
}

class GetCartItemsUseCase {
  const GetCartItemsUseCase(this._repository);

  final CartRepository _repository;

  Future<ApiResult<List<CartItemData>>> call() => _repository.getItems();
}

class AddCartItemUseCase {
  const AddCartItemUseCase(this._repository);

  final CartRepository _repository;

  Future<ApiResult<List<CartItemData>>> call(
    CartItemData item,
    int quantityToAdd,
  ) {
    return _repository.addItem(item, quantityToAdd);
  }
}

class IncrementCartItemQuantityUseCase {
  const IncrementCartItemQuantityUseCase(this._repository);

  final CartRepository _repository;

  Future<ApiResult<List<CartItemData>>> call(String id) {
    return _repository.incrementQuantity(id);
  }
}

class DecrementCartItemQuantityUseCase {
  const DecrementCartItemQuantityUseCase(this._repository);

  final CartRepository _repository;

  Future<ApiResult<List<CartItemData>>> call(String id) {
    return _repository.decrementQuantity(id);
  }
}

class RemoveCartItemUseCase {
  const RemoveCartItemUseCase(this._repository);

  final CartRepository _repository;

  Future<ApiResult<List<CartItemData>>> call(String id) {
    return _repository.removeItem(id);
  }
}

class ClearCartUseCase {
  const ClearCartUseCase(this._repository);

  final CartRepository _repository;

  Future<ApiResult<List<CartItemData>>> call() => _repository.clear();
}
