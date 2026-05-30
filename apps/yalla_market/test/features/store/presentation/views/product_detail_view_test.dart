import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/constants/app_assets.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import 'package:yalla_market/features/cart/presentation/cubit/cart_cubit.dart';
import 'package:yalla_market/features/store/presentation/views/product_detail_view.dart';
import 'package:yalla_market/features/wishlist/presentation/cubit/wishlist_cubit.dart';

import '../../../../helpers/cubit_factories.dart';

void main() {
  testWidgets('renders product details and adds the selected item to cart', (
    tester,
  ) async {
    final cartCubit = makeCartCubit();
    final wishlistCubit = makeWishlistCubit();
    addTearDown(cartCubit.close);
    addTearDown(wishlistCubit.close);

    await tester.pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider<CartCubit>.value(value: cartCubit),
          BlocProvider<WishlistCubit>.value(value: wishlistCubit),
        ],
        child: const MaterialApp(
          home: ProductDetailView(
            productId: 'product_1',
            image: AppAssets.temporaryMarketPlaceholder,
            title: 'Running Shoe',
            brand: 'Yalla',
            price: 'EGP 1200',
            oldPrice: 'EGP 1500',
            discount: '20%',
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Running Shoe'), findsWidgets);
    expect(find.text('Reviews & Ratings'), findsNothing);
    expect(find.text('Add to Bag'), findsOneWidget);

    await tester.tap(find.byIcon(AppIcons.add).last);
    await tester.pump();
    await tester.tap(find.byType(ElevatedButton).last);
    await tester.pumpAndSettle();

    expect(cartCubit.state.any((item) => item.title == 'Running Shoe'), isTrue);
  });
}
