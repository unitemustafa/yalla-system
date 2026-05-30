import '../../domain/entities/order.dart';

sealed class CheckoutState {
  const CheckoutState();
}

final class CheckoutInitial extends CheckoutState {
  const CheckoutInitial();
}

final class CheckoutLoading extends CheckoutState {
  const CheckoutLoading();
}

final class CheckoutSuccess extends CheckoutState {
  const CheckoutSuccess(this.order);

  final OrderData order;
}

final class CheckoutFailure extends CheckoutState {
  const CheckoutFailure(this.message);

  final String message;
}
