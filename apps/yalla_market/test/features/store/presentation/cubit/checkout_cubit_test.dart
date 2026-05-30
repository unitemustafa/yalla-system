import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/errors/failure.dart';
import 'package:yalla_market/core/network/api_result.dart';
import 'package:yalla_market/features/store/domain/entities/order.dart';
import 'package:yalla_market/features/store/domain/repositories/order_repository.dart';
import 'package:yalla_market/features/store/domain/usecases/create_order_usecase.dart';
import 'package:yalla_market/features/store/presentation/cubit/checkout_cubit.dart';
import 'package:yalla_market/features/store/presentation/cubit/checkout_state.dart';

import '../../../../helpers/domain_fixtures.dart';

void main() {
  group('CheckoutCubit', () {
    test('creates a cash on delivery order successfully', () async {
      final repository = _FakeOrderRepository(createResult: sampleOrder);
      final cubit = CheckoutCubit(CreateOrderUseCase(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<CheckoutLoading>(), isA<CheckoutSuccess>()]),
      );

      await cubit.createOrder(
        shippingAddress: sampleShippingAddress,
        items: const [sampleOrderItem],
        paymentMethod: 'cash_on_delivery',
        shippingFee: 50,
      );

      expect(repository.lastPaymentMethod, 'cash_on_delivery');
      expect((cubit.state as CheckoutSuccess).order.id, sampleOrder.id);
      await expectedStates;
      await cubit.close();
    });

    test('emits failure when order creation is rejected', () async {
      final repository = _FakeOrderRepository(
        createFailure: const ValidationFailure('Unsupported payment method.'),
      );
      final cubit = CheckoutCubit(CreateOrderUseCase(repository));
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<CheckoutLoading>(), isA<CheckoutFailure>()]),
      );

      await cubit.createOrder(
        shippingAddress: sampleShippingAddress,
        items: const [sampleOrderItem],
        paymentMethod: 'card',
      );

      expect(
        (cubit.state as CheckoutFailure).message,
        'Unsupported payment method.',
      );
      await expectedStates;
      await cubit.close();
    });

    test('resets back to the initial state', () async {
      final repository = _FakeOrderRepository(createResult: sampleOrder);
      final cubit = CheckoutCubit(CreateOrderUseCase(repository));
      await cubit.createOrder(
        shippingAddress: sampleShippingAddress,
        items: const [sampleOrderItem],
      );

      cubit.reset();

      expect(cubit.state, isA<CheckoutInitial>());
      await cubit.close();
    });
  });
}

class _FakeOrderRepository implements OrderRepository {
  _FakeOrderRepository({this.createResult, this.createFailure});

  final OrderData? createResult;
  final Failure? createFailure;
  String? lastPaymentMethod;

  @override
  Future<ApiResult<OrderData>> createOrder({
    required ShippingAddressData shippingAddress,
    required List<OrderItemData> items,
    String? paymentMethod,
    double shippingFee = 0,
    double taxTotal = 0,
    double discountTotal = 0,
  }) async {
    lastPaymentMethod = paymentMethod;

    if (createFailure case final failure?) {
      return ApiResult.failure(failure);
    }

    return ApiResult.success(createResult ?? sampleOrder);
  }

  @override
  Future<ApiResult<List<OrderData>>> getMyOrders() async {
    return ApiResult.success([sampleOrder]);
  }
}
