import '../../../../core/network/api_result.dart';
import '../entities/order.dart';
import '../repositories/order_repository.dart';

class GetMyOrdersUseCase {
  const GetMyOrdersUseCase(this._repository);

  final OrderRepository _repository;

  Future<ApiResult<List<OrderData>>> call() {
    return _repository.getMyOrders();
  }
}
