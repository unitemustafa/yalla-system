import '../../domain/entities/order.dart';

sealed class OrderHistoryState {
  const OrderHistoryState();
}

final class OrderHistoryInitial extends OrderHistoryState {
  const OrderHistoryInitial();
}

final class OrderHistoryLoading extends OrderHistoryState {
  const OrderHistoryLoading();
}

final class OrderHistoryReady extends OrderHistoryState {
  const OrderHistoryReady(this.orders);

  final List<OrderData> orders;
}

final class OrderHistoryFailure extends OrderHistoryState {
  const OrderHistoryFailure(this.message, {this.orders = const []});

  final String message;

  /// Stale orders to show while the error is displayed (may be empty).
  final List<OrderData> orders;
}
