import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/errors/failure.dart';
import 'package:yalla_market/features/store/data/repositories/order_repository_impl.dart';
import 'package:yalla_market/features/store/domain/entities/order.dart';

void main() {
  group('OrderRepositoryImpl', () {
    late OrderRepositoryImpl repository;

    setUp(() {
      repository = OrderRepositoryImpl();
    });

    test('creates an order using item totals, shipping, and tax', () async {
      final result = await repository.createOrder(
        shippingAddress: _address,
        items: const [
          OrderItemData(
            id: 'item-1',
            image: 'image.png',
            brand: 'Yalla',
            title: 'Fresh product',
            unitPrice: 10,
            quantity: 2,
          ),
        ],
        shippingFee: 5,
        taxTotal: 2,
        discountTotal: 3,
      );

      result.when(
        success: (order) {
          expect(order.subtotal, 20);
          expect(order.total, 24);
          expect(order.itemCount, 2);
          expect(order.status, OrderStatus.processing);
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('rejects orders without items', () async {
      final result = await repository.createOrder(
        shippingAddress: _address,
        items: const [],
      );

      result.when(
        success: (_) => fail('Empty order should not be accepted.'),
        failure: (failure) {
          expect(failure, isA<ValidationFailure>());
          expect(failure.message, 'Cannot create an order without items.');
        },
      );
    });
  });
}

const _address = ShippingAddressData(
  fullName: 'Mustafa Ali',
  phone: '+201000000000',
  line1: 'Street 1',
  city: 'Cairo',
  state: 'Cairo',
  country: 'Egypt',
  postalCode: '11511',
);
