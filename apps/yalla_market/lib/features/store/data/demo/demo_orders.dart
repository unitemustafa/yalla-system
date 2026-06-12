import '../../../../core/formatters/app_currency.dart';

class DemoOrderData {
  const DemoOrderData({
    required this.status,
    required this.date,
    required this.orderId,
    required this.shippingDate,
    required this.itemCount,
    required this.total,
    required this.items,
  });

  final String status;
  final String date;
  final String orderId;
  final String shippingDate;
  final int itemCount;
  final String total;
  final List<DemoOrderItemData> items;
}

class DemoOrderItemData {
  const DemoOrderItemData({
    required this.title,
    required this.quantity,
    this.brand = '',
    this.total,
  });

  final String title;
  final int quantity;
  final String brand;
  final String? total;
}

class DemoOrders {
  DemoOrders._();

  static final all = [
    DemoOrderData(
      status: 'Shipment on the way',
      date: '01 Sep 2023',
      orderId: 'CWT0012',
      shippingDate: '09 Sep 2023',
      itemCount: 3,
      total: AppCurrency.format(
        129,
        fractionDigits: 2,
        trimTrailingZero: false,
      ),
      items: [
        DemoOrderItemData(
          title: 'Cotton T-Shirt',
          brand: 'Yalla Basics',
          quantity: 1,
          total: AppCurrency.format(
            39,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Slim Fit Jeans',
          brand: 'Denim Co.',
          quantity: 1,
          total: AppCurrency.format(
            65,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Canvas Cap',
          brand: 'Streetline',
          quantity: 1,
          total: AppCurrency.format(
            25,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
      ],
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
      items: [
        DemoOrderItemData(
          title: 'Running Sneakers',
          brand: 'Fleet',
          quantity: 1,
          total: AppCurrency.format(
            59.5,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Sports Socks',
          brand: 'Fleet',
          quantity: 1,
          total: AppCurrency.format(
            25,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
      ],
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
      items: [
        DemoOrderItemData(
          title: 'Oxford Shirt',
          brand: 'Yalla Basics',
          quantity: 2,
          total: AppCurrency.format(
            90,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Chino Pants',
          brand: 'Urban Thread',
          quantity: 1,
          total: AppCurrency.format(
            75,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Leather Belt',
          brand: 'Urban Thread',
          quantity: 1,
          total: AppCurrency.format(
            35,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Crew Socks',
          brand: 'Fleet',
          quantity: 1,
          total: AppCurrency.format(
            40,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
      ],
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
      items: [
        DemoOrderItemData(
          title: 'Everyday Backpack',
          brand: 'Carry Lab',
          quantity: 1,
          total: AppCurrency.format(
            59.99,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
      ],
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
      items: [
        DemoOrderItemData(
          title: 'Puffer Jacket',
          brand: 'North Peak',
          quantity: 1,
          total: AppCurrency.format(
            92,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Knit Beanie',
          brand: 'North Peak',
          quantity: 1,
          total: AppCurrency.format(
            24.2,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
        DemoOrderItemData(
          title: 'Thermal Gloves',
          brand: 'North Peak',
          quantity: 2,
          total: AppCurrency.format(
            60,
            fractionDigits: 2,
            trimTrailingZero: false,
          ),
        ),
      ],
    ),
  ];
}
