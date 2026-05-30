import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/routing/app_route_arguments.dart';
import 'package:yalla_market/core/routing/app_router.dart';
import 'package:yalla_market/core/routing/app_routes.dart';

void main() {
  group('AppRouter', () {
    test('generates production flow routes', () {
      const routeNames = [
        AppRoutes.navigationMenu,
        AppRoutes.cart,
        AppRoutes.checkout,
        AppRoutes.processingOrder,
        AppRoutes.paymentSuccess,
        AppRoutes.search,
        AppRoutes.allProducts,
        AppRoutes.categories,
        AppRoutes.profile,
        AppRoutes.notifications,
        AppRoutes.addresses,
        AppRoutes.orders,
        AppRoutes.appPreferences,
      ];

      for (final routeName in routeNames) {
        final route = AppRouter.generateRoute(RouteSettings(name: routeName));

        expect(route, isA<MaterialPageRoute<dynamic>>());
      }
    });

    test('generates routes that require typed arguments', () {
      final productRoute = AppRouter.generateRoute(
        const RouteSettings(
          name: AppRoutes.productDetail,
          arguments: ProductDetailRouteArgs(
            image: 'asset.png',
            title: 'Demo product',
            brand: 'Demo brand',
            price: 'EGP 10.00',
          ),
        ),
      );
      final brandRoute = AppRouter.generateRoute(
        const RouteSettings(
          name: AppRoutes.brandProducts,
          arguments: BrandProductsRouteArgs(
            brand: 'Demo brand',
            logo: 'asset.png',
            productCount: '3 products',
          ),
        ),
      );

      expect(productRoute, isA<MaterialPageRoute<dynamic>>());
      expect(brandRoute, isA<MaterialPageRoute<dynamic>>());
    });

    test('keeps route generation safe when required arguments are missing', () {
      final productRoute = AppRouter.generateRoute(
        const RouteSettings(name: AppRoutes.productDetail),
      );
      final brandRoute = AppRouter.generateRoute(
        const RouteSettings(name: AppRoutes.brandProducts),
      );

      expect(productRoute, isA<MaterialPageRoute<dynamic>>());
      expect(brandRoute, isA<MaterialPageRoute<dynamic>>());
    });
  });
}
