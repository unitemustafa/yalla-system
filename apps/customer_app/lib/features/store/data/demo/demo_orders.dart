import '../../../../core/formatters/app_currency.dart';

class DemoOrderData {
  const DemoOrderData({
    required this.status,
    required this.date,
    required this.orderId,
    required this.shippingDate,
    required this.itemCount,
    required this.total,
  });

  final String status;
  final String date;
  final String orderId;
  final String shippingDate;
  final int itemCount;
  final String total;
}

class DemoOrders {
  DemoOrders._();

  static final all = [
    DemoOrderData(
      status: 'Processing',
      date: '01 Sep 2023',
      orderId: 'CWT0012',
      shippingDate: '09 Sep 2023',
      itemCount: 3,
      total: AppCurrency.format(
        129,
        fractionDigits: 2,
        trimTrailingZero: false,
      ),
    ),
    DemoOrderData(
      status: 'Shipment on the way',
      date: '02 Oct 2023',
      orderId: 'CWT0025',
      shippingDate: '06 Oct 2023',
      itemCount: 2,
      total: AppCurrency.format(
        84.5,
        fractionDigits: 2,
        trimTrailingZero: false,
      ),
    ),
    DemoOrderData(
      status: 'Delivered',
      date: '03 Nov 2023',
      orderId: 'CWT0152',
      shippingDate: '08 Nov 2023',
      itemCount: 5,
      total: AppCurrency.format(
        240,
        fractionDigits: 2,
        trimTrailingZero: false,
      ),
    ),
    DemoOrderData(
      status: 'Delivered',
      date: '20 Dec 2023',
      orderId: 'CWT0265',
      shippingDate: '25 Dec 2023',
      itemCount: 1,
      total: AppCurrency.format(
        59.99,
        fractionDigits: 2,
        trimTrailingZero: false,
      ),
    ),
    DemoOrderData(
      status: 'Delivered',
      date: '25 Dec 2023',
      orderId: 'CWT1536',
      shippingDate: '01 Jan 2024',
      itemCount: 4,
      total: AppCurrency.format(
        176.2,
        fractionDigits: 2,
        trimTrailingZero: false,
      ),
    ),
  ];
}
