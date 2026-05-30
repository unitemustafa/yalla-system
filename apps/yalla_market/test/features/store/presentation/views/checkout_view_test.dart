import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/routing/app_routes.dart';
import 'package:yalla_market/features/cart/presentation/cubit/cart_cubit.dart';
import 'package:yalla_market/features/personalization/presentation/cubit/address_cubit.dart';
import 'package:yalla_market/features/store/data/repositories/order_repository_impl.dart';
import 'package:yalla_market/features/store/presentation/cubit/checkout_cubit.dart';
import 'package:yalla_market/features/store/presentation/cubit/order_history_cubit.dart';
import 'package:yalla_market/features/store/presentation/views/checkout_view.dart';

import '../../../../helpers/cubit_factories.dart';
import '../../../../helpers/domain_fixtures.dart';

void main() {
  testWidgets('renders checkout summary and completes cash order flow', (
    tester,
  ) async {
    final orderRepository = OrderRepositoryImpl();
    final cartCubit = makeCartCubit();
    final addressCubit = makeAddressCubit();
    final checkoutCubit = makeCheckoutCubit(repository: orderRepository);
    final orderHistoryCubit = makeOrderHistoryCubit(
      repository: orderRepository,
    );
    await cartCubit.addItem(sampleCartItem, sampleCartItem.quantity);
    addTearDown(cartCubit.close);
    addTearDown(addressCubit.close);
    addTearDown(checkoutCubit.close);
    addTearDown(orderHistoryCubit.close);

    await tester.pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider<CartCubit>.value(value: cartCubit),
          BlocProvider<AddressCubit>.value(value: addressCubit),
          BlocProvider<CheckoutCubit>.value(value: checkoutCubit),
          BlocProvider<OrderHistoryCubit>.value(value: orderHistoryCubit),
        ],
        child: MaterialApp(
          routes: {
            AppRoutes.processingOrder: (_) =>
                const Scaffold(body: Text('processing order')),
          },
          home: const CheckoutView(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Order Review'), findsOneWidget);
    expect(find.text('Order Summary'), findsOneWidget);
    expect(find.text('Cash on Delivery'), findsOneWidget);
    expect(find.text('Confirm Order'), findsOneWidget);

    await tester.tap(find.text('Confirm Order'));
    await tester.pumpAndSettle();

    expect(find.text('processing order'), findsOneWidget);
    expect(cartCubit.state, isEmpty);
  });
}
