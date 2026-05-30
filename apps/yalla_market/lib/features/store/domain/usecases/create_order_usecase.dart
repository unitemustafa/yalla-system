import '../../../../core/network/api_result.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

class CreateOrderUseCase {
  const CreateOrderUseCase(this._repository);

  final OrderRepository _repository;

  Future<ApiResult<OrderData>> call({
    required ShippingAddressData shippingAddress,
    required List<OrderItemData> items,
    String? paymentMethod,
    double shippingFee = 0,
    double taxTotal = 0,
    double discountTotal = 0,
  }) {
    return _repository.createOrder(
      shippingAddress: shippingAddress,
      items: items,
      paymentMethod: paymentMethod,
      shippingFee: shippingFee,
      taxTotal: taxTotal,
      discountTotal: discountTotal,
    );
  }
}
