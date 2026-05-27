import '../../../../core/errors/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../domain/entities/order.dart';
import '../../domain/repositories/order_repository.dart';

class OrderRepositoryImpl implements OrderRepository {
  final List<OrderData> _orders = [];

  @override
  Future<ApiResult<OrderData>> createOrder({
    required ShippingAddressData shippingAddress,
    required List<OrderItemData> items,
    String? paymentMethod,
    double shippingFee = 0,
    double taxTotal = 0,
    double discountTotal = 0,
  }) async {
    if (items.isEmpty) {
      return const ApiResult.failure(
        ValidationFailure('Cannot create an order without items.'),
      );
    }

    if (items.any((item) => item.quantity <= 0 || item.unitPrice < 0)) {
      return const ApiResult.failure(
        ValidationFailure('Order items contain invalid quantities or prices.'),
      );
    }

    try {
      final now = DateTime.now();
      final subtotal = items.fold<double>(
        0,
        (sum, item) => sum + item.lineTotal,
      );
      final total = subtotal + shippingFee + taxTotal - discountTotal;
      final order = OrderData(
        id: 'local-order-${now.microsecondsSinceEpoch}',
        orderNumber: 'YM${now.millisecondsSinceEpoch.toString().substring(6)}',
        status: OrderStatus.processing,
        placedAt: now,
        estimatedDeliveryAt: now.add(const Duration(days: 5)),
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod ?? 'cash_on_delivery',
        items: List.unmodifiable(items),
        subtotal: subtotal,
        shippingFee: shippingFee,
        taxTotal: taxTotal,
        discountTotal: discountTotal,
        total: total < 0 ? 0 : total,
      );

      _orders.insert(0, order);
      return ApiResult.success(order);
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not create your order.'),
      );
    }
  }

  @override
  Future<ApiResult<List<OrderData>>> getMyOrders() async {
    try {
      return ApiResult.success(List.unmodifiable(_orders));
    } catch (_) {
      return const ApiResult.failure(
        UnknownFailure('Could not load your orders.'),
      );
    }
  }
}
