import 'package:flutter/material.dart';
import 'package:yalla_market/core/localization/app_translations.dart';
import '../../features/auth/presentation/views/forget_password_view.dart';
import '../../features/auth/presentation/views/login_view.dart';
import '../../features/auth/presentation/views/password_reset_sent_view.dart';
import '../../features/auth/presentation/views/signup_view.dart';
import '../../features/auth/presentation/views/success_account_view.dart';
import '../../features/auth/presentation/views/verify_email_view.dart';
import '../../features/cart/presentation/views/cart_view.dart';
import '../../features/home/presentation/views/notifications_view.dart';
import '../../features/location/presentation/views/select_city_view.dart';
import '../../features/onboarding/presentation/views/onboarding_view.dart';
import '../../features/personalization/presentation/views/address/addresses_view.dart';
import '../../features/personalization/presentation/views/profile/profile_view.dart';
import '../../features/personalization/presentation/views/settings/app_preferences_view.dart';
import '../../features/splash/presentation/views/splash_view.dart';
import '../../features/navigation/presentation/views/navigation_menu_view.dart';
import '../../features/store/presentation/views/all_products/all_products_view.dart';
import '../../features/store/presentation/views/brand/brands_view.dart';
import '../../features/store/presentation/views/brand/brand_products_view.dart';
import '../../features/store/presentation/views/checkout/processing_order_view.dart';
import '../../features/store/presentation/views/checkout/payment_success_view.dart';
import '../../features/store/presentation/views/checkout_view.dart';
import '../../features/store/presentation/views/orders/orders_view.dart';
import '../../features/store/presentation/views/product_detail_view.dart';
import '../../features/search/presentation/views/search_view.dart';
import 'app_route_arguments.dart';
import 'app_routes.dart';
import 'auth_guard.dart';

/// Generates routes from [RouteSettings] for the entire app.
///
/// Pass arguments via [RouteSettings.arguments] for screens that need data.
class AppRouter {
  AppRouter._();

  /// Routes that require an authenticated session.
  /// Unauthenticated navigation attempts are redirected to [AppRoutes.login].
  static const _protectedRoutes = <String>{
    AppRoutes.navigationMenu,
    AppRoutes.cart,
    AppRoutes.checkout,
    AppRoutes.processingOrder,
    AppRoutes.paymentSuccess,
    AppRoutes.search,
    AppRoutes.allProducts,
    AppRoutes.categories,
    AppRoutes.productDetail,
    AppRoutes.brandProducts,
    AppRoutes.profile,
    AppRoutes.notifications,
    AppRoutes.addresses,
    AppRoutes.orders,
    AppRoutes.appPreferences,
  };

  static Route<dynamic> generateRoute(RouteSettings settings) {
    if (_protectedRoutes.contains(settings.name) &&
        !AuthGuard.isAuthenticated) {
      return _buildRoute(const LoginView(), settings);
    }
    switch (settings.name) {
      case AppRoutes.splash:
        return _buildRoute(const SplashView(), settings);

      case AppRoutes.onboarding:
        return _buildRoute(const OnboardingView(), settings);

      case AppRoutes.login:
        return _buildRoute(const LoginView(), settings);

      case AppRoutes.signup:
        return _buildRoute(const SignupView(), settings);

      case AppRoutes.forgetPassword:
        return _buildRoute(const ForgetPasswordView(), settings);

      case AppRoutes.passwordResetSent:
        final email = settings.arguments as String? ?? '';
        return _buildRoute(PasswordResetSentView(email: email), settings);

      case AppRoutes.verifyEmail:
        final email = settings.arguments as String? ?? '';
        return _buildRoute(VerifyEmailView(email: email), settings);

      case AppRoutes.successAccount:
        return _buildRoute(const SuccessAccountView(), settings);

      case AppRoutes.selectCity:
        return _buildRoute(const SelectCityView(), settings);

      case AppRoutes.navigationMenu:
        final args = settings.arguments as NavigationMenuRouteArgs?;
        return _buildRoute(
          NavigationMenuView(initialIndex: args?.initialIndex ?? 0),
          settings,
        );

      case AppRoutes.cart:
        return _buildRoute(const CartView(), settings);

      case AppRoutes.checkout:
        return _buildRoute(const CheckoutView(), settings);

      case AppRoutes.processingOrder:
        return _buildRoute(const ProcessingOrderView(), settings);

      case AppRoutes.paymentSuccess:
        return _buildRoute(const PaymentSuccessView(), settings);

      case AppRoutes.search:
        return _buildRoute(const SearchView(), settings);

      case AppRoutes.allProducts:
        final args = settings.arguments as AllProductsRouteArgs?;
        return _buildRoute(
          AllProductsView(
            title: args?.title ?? 'Popular Products',
            subtitle: args?.subtitle ?? 'Browse all curated products',
          ),
          settings,
        );

      case AppRoutes.productDetail:
        final args = settings.arguments as ProductDetailRouteArgs?;
        if (args == null) {
          return _buildMissingArgumentsRoute(settings);
        }
        return _buildRoute(
          ProductDetailView(
            image: args.image,
            title: args.title,
            brand: args.brand,
            price: args.price,
            productId: args.productId,
            productSlug: args.productSlug,
            oldPrice: args.oldPrice,
            discount: args.discount,
          ),
          settings,
        );

      case AppRoutes.categories:
        return _buildRoute(const BrandsView(), settings);

      case AppRoutes.brandProducts:
        final args = settings.arguments as BrandProductsRouteArgs?;
        if (args == null) {
          return _buildMissingArgumentsRoute(settings);
        }
        return _buildRoute(
          BrandProductsView(
            brand: args.brand,
            logo: args.logo,
            productCount: args.productCount,
            shopId: args.shopId,
          ),
          settings,
        );

      case AppRoutes.profile:
        return _buildRoute(const ProfileView(), settings);

      case AppRoutes.notifications:
        return _buildRoute(const NotificationsView(), settings);

      case AppRoutes.addresses:
        return _buildRoute(const AddressesView(), settings);

      case AppRoutes.orders:
        return _buildRoute(const OrdersView(), settings);

      case AppRoutes.appPreferences:
        return _buildRoute(const AppPreferencesView(), settings);

      default:
        return _buildRoute(
          Scaffold(
            body: Builder(
              builder: (context) {
                return Center(
                  child: Text(
                    context.tr('No route defined for ${settings.name}'),
                  ),
                );
              },
            ),
          ),
          settings,
        );
    }
  }

  static MaterialPageRoute<dynamic> _buildRoute(
    Widget page,
    RouteSettings settings,
  ) {
    return MaterialPageRoute(builder: (_) => page, settings: settings);
  }

  static Route<dynamic> _buildMissingArgumentsRoute(RouteSettings settings) {
    return _buildRoute(
      Scaffold(
        body: Builder(
          builder: (context) {
            return Center(
              child: Text(
                context.tr('Missing route arguments for ${settings.name}'),
              ),
            );
          },
        ),
      ),
      settings,
    );
  }
}
