import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import '../../domain/entities/cart_item.dart';
import '../../domain/usecases/cart_usecases.dart';

class CartCubit extends Cubit<List<CartItemData>> {
  CartCubit(this._cartUseCases) : super(const []) {
    loadCart();
  }

  final CartUseCases _cartUseCases;

  String? lastErrorMessage;

  bool get usesRemoteCart => false;

  Future<void> loadCart() async {
    final result = await _cartUseCases.getItems();
    _emitResult(result);
  }

  Future<void> addItem(CartItemData newItem, int quantityToAdd) async {
    final result = await _cartUseCases.addItem(newItem, quantityToAdd);
    _emitResult(result);
  }

  Future<void> incrementQuantity(String id) async {
    final result = await _cartUseCases.incrementQuantity(id);
    _emitResult(result);
  }

  Future<void> decrementQuantity(String id) async {
    final result = await _cartUseCases.decrementQuantity(id);
    _emitResult(result);
  }

  Future<void> removeItem(String id) async {
    final result = await _cartUseCases.removeItem(id);
    _emitResult(result);
  }

  Future<void> clearLocalCart() async {
    final result = await _cartUseCases.clearCart();
    _emitResult(result);
  }

  void _emitResult(ApiResult<List<CartItemData>> result) {
    result.when(
      success: (items) {
        lastErrorMessage = null;
        emit(items);
      },
      failure: (failure) {
        lastErrorMessage = failure.message;
      },
    );
  }
}
