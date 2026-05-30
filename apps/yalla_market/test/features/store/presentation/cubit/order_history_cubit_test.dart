import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/errors/failure.dart';
import 'package:yalla_market/core/network/api_result.dart';
import 'package:yalla_market/features/store/domain/entities/order.dart';
import 'package:yalla_market/features/store/domain/repositories/order_repository.dart';
import 'package:yalla_market/features/store/domain/usecases/get_my_orders_usecase.dart';
import 'package:yalla_market/features/store/presentation/cubit/order_history_cubit.dart';
import 'package:yalla_market/features/store/presentation/cubit/order_history_state.dart';

import '../../../../helpers/domain_fixtures.dart';

void main() {
  group('OrderHistoryCubit', () {
    test('loads current customer orders', () async {
      final repository = _FakeOrderRepository(orders: [sampleOrder]);
      final cubit = OrderHistoryCubit(GetMyOrdersUseCase(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<OrderHistoryLoading>(), isA<OrderHistoryReady>()]),
      );

      await cubit.loadOrders();

      final state = cubit.state as OrderHistoryReady;
      expect(state.orders.single.id, sampleOrder.id);
      await expectedStates;
      await cubit.close();
    });

    test('preserves stale orders when refreshing fails', () async {
      final repository = _FakeOrderRepository(orders: [sampleOrder]);
      final cubit = OrderHistoryCubit(GetMyOrdersUseCase(repository));
      await cubit.loadOrders();
      repository.nextFailure = const ServerFailure('Orders are unavailable.');

      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<OrderHistoryLoading>(), isA<OrderHistoryFailure>()]),
      );
      await cubit.loadOrders();

      final state = cubit.state as OrderHistoryFailure;
      expect(state.message, 'Orders are unavailable.');
      expect(state.orders.single.id, sampleOrder.id);
      await expectedStates;
      await cubit.close();
    });
  });
}

class _FakeOrderRepository implements OrderRepository {
  _FakeOrderRepository({required this.orders});

  final List<OrderData> orders;
  Failure? nextFailure;

  @override
  Future<ApiResult<OrderData>> createOrder({
    required ShippingAddressData shippingAddress,
    required List<OrderItemData> items,
    String? paymentMethod,
    double shippingFee = 0,
    double taxTotal = 0,
    double discountTotal = 0,
  }) async {
    return ApiResult.success(sampleOrder);
  }

  @override
  Future<ApiResult<List<OrderData>>> getMyOrders() async {
    if (nextFailure case final failure?) {
      nextFailure = null;
      return ApiResult.failure(failure);
    }

    return ApiResult.success(orders);
  }
}
