import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/order.dart';
import '../../domain/usecases/create_order_usecase.dart';
import 'checkout_state.dart';

class CheckoutCubit extends Cubit<CheckoutState> {
  CheckoutCubit(this._createOrderUseCase) : super(const CheckoutInitial());

  final CreateOrderUseCase _createOrderUseCase;

  Future<void> createOrder({
    required ShippingAddressData shippingAddress,
    required List<OrderItemData> items,
    String? paymentMethod,
    double shippingFee = 0,
    double taxTotal = 0,
    double discountTotal = 0,
  }) async {
    if (state is CheckoutLoading) return;

    emit(const CheckoutLoading());

    final result = await _createOrderUseCase(
      shippingAddress: shippingAddress,
      items: items,
      paymentMethod: paymentMethod,
      shippingFee: shippingFee,
      taxTotal: taxTotal,
      discountTotal: discountTotal,
    );
    result.when(
      success: (order) {
        emit(CheckoutSuccess(order));
      },
      failure: (failure) {
        emit(CheckoutFailure(failure.message));
      },
    );
  }

  void reset() {
    emit(const CheckoutInitial());
  }
}
