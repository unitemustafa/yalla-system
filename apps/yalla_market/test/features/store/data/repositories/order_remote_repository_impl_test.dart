import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/store/data/repositories/order_remote_repository_impl.dart';
import 'package:yalla_market/features/store/domain/entities/order.dart';

import '../../../../helpers/fake_api_client.dart';

void main() {
  group('OrderRemoteRepositoryImpl', () {
    test('forces cash on delivery for v1 order creation', () async {
      late FakeApiRequest capturedRequest;
      final apiClient = FakeApiClient((request) {
        capturedRequest = request;
        return {
          'id': 'order-1',
          'orderNumber': 'YM1',
          'status': 'processing',
          'placedAt': DateTime(2026).toIso8601String(),
          'shippingAddress': _address.toJson(),
          'paymentMethod': 'cash_on_delivery',
          'items': [_item.toJson()],
          'subtotal': 10,
          'shippingFee': 0,
          'taxTotal': 0,
          'discountTotal': 0,
          'total': 10,
        };
      });
      final repository = OrderRemoteRepositoryImpl(apiClient);

      final result = await repository.createOrder(
        shippingAddress: _address,
        items: const [_item],
        paymentMethod: 'visa',
      );

      result.when(
        success: (order) => expect(order.paymentMethod, 'cash_on_delivery'),
        failure: (failure) => fail(failure.message),
      );
      expect(
        capturedRequest.data,
        containsPair('paymentMethod', 'cash_on_delivery'),
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

const _item = OrderItemData(
  id: 'item-1',
  image: 'image.png',
  brand: 'Yalla',
  title: 'Fresh product',
  unitPrice: 10,
  quantity: 1,
);
