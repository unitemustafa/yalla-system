import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/constants/app_constants.dart';
import 'core/di/service_locator.dart';
import 'core/localization/app_language_controller.dart';
import 'core/localization/app_translations.dart';
import 'core/preferences/app_preferences_controller.dart';
import 'core/presentation/widgets/offline_connection_banner.dart';
import 'core/routing/app_navigator.dart';
import 'core/routing/app_router.dart';
import 'core/routing/app_routes.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/cubit/auth_cubit.dart';
import 'features/auth/presentation/cubit/auth_state.dart';
import 'features/cart/presentation/cubit/cart_cubit.dart';
import 'features/location/presentation/cubit/location_cubit.dart';
import 'features/onboarding/presentation/cubit/onboarding_cubit.dart';
import 'features/personalization/presentation/controllers/user_profile_controller.dart';
import 'features/personalization/presentation/cubit/address_cubit.dart';
import 'features/personalization/presentation/cubit/profile_image_cubit.dart';
import 'features/store/presentation/cubit/checkout_cubit.dart';
import 'features/store/presentation/cubit/order_history_cubit.dart';
import 'features/store/presentation/cubit/product_catalog_cubit.dart';
import 'features/store/presentation/cubit/product_discovery_cubit.dart';
import 'features/wishlist/presentation/cubit/wishlist_cubit.dart';

import 'features/splash/presentation/cubit/splash_cubit.dart';

class YallaMarketApp extends StatefulWidget {
  const YallaMarketApp({super.key});

  @override
  State<YallaMarketApp> createState() => _YallaMarketAppState();
}

class _YallaMarketAppState extends State<YallaMarketApp> {
  Timer? _sessionExpiryTimer;

  @override
  void dispose() {
    _sessionExpiryTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => sl<AuthCubit>()),
        BlocProvider(create: (_) => sl<OnboardingCubit>()),
        BlocProvider(create: (_) => sl<LocationCubit>()),
        BlocProvider(create: (_) => sl<SplashCubit>()),
        BlocProvider(create: (_) => sl<ProductCatalogCubit>()),
        BlocProvider(create: (_) => sl<ProductDiscoveryCubit>()),
        BlocProvider(create: (_) => sl<CheckoutCubit>()),
        BlocProvider(create: (_) => sl<OrderHistoryCubit>()),
        BlocProvider(create: (_) => sl<CartCubit>()),
        BlocProvider(create: (_) => sl<WishlistCubit>()),
        BlocProvider(create: (_) => sl<AddressCubit>()),
        BlocProvider(create: (_) => sl<ProfileImageCubit>()),
      ],
      child: BlocListener<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            UserProfileController.instance.updateFromAuthUser(
              state.session.user,
            );
            _scheduleSessionExpiry(context, state);
          } else if (state is AuthSessionExpired) {
            _sessionExpiryTimer?.cancel();
            UserProfileController.instance.reset();
            _showSessionExpiredDialog(state.message);
          } else if (state is AuthInitial) {
            _sessionExpiryTimer?.cancel();
            UserProfileController.instance.reset();
            AppNavigator.goToLogin();
          } else if (state is AuthSessionExpired) {
            UserProfileController.instance.reset();
            AppNavigator.goToLogin(showSessionExpiredNotice: true);
          }
        },
        child: ValueListenableBuilder<AppLanguage>(
          valueListenable: AppLanguageController.instance,
          builder: (context, language, _) {
            return ValueListenableBuilder<AppPreferences>(
              valueListenable: AppPreferencesController.instance,
              builder: (context, preferences, _) {
                return MaterialApp(
                  navigatorKey: AppNavigator.key,
                  debugShowCheckedModeBanner: false,
                  title: AppConstants.appName,
                  onGenerateTitle: (context) =>
                      AppTranslations.of(context).appName,
                  theme: AppTheme.lightTheme,
                  darkTheme: AppTheme.darkTheme,
                  themeMode: preferences.themeMode,
                  locale: language.locale,
                  supportedLocales: AppTranslations.supportedLocales,
                  builder: (context, child) {
                    return Directionality(
                      textDirection: language.isArabic
                          ? TextDirection.rtl
                          : TextDirection.ltr,
                      child: OfflineConnectionBanner(
                        message: language.isArabic
                            ? 'لا يوجد اتصال بالإنترنت. تحقق من الشبكة لإكمال التحديثات.'
                            : 'No internet connection. Check your network to continue updates.',
                        child: child ?? const SizedBox.shrink(),
                      ),
                    );
                  },
                  localizationsDelegates: const [
                    GlobalMaterialLocalizations.delegate,
                    GlobalCupertinoLocalizations.delegate,
                    GlobalWidgetsLocalizations.delegate,
                  ],
                  initialRoute: AppRoutes.splash,
                  onGenerateRoute: AppRouter.generateRoute,
                );
              },
            );
          },
        ),
      ),
    );
  }

  void _scheduleSessionExpiry(BuildContext context, AuthAuthenticated state) {
    _sessionExpiryTimer?.cancel();

    final expiresAt = state.session.expiresAt;
    if (expiresAt == null) return;

    final remaining = expiresAt.difference(DateTime.now());
    if (remaining <= Duration.zero) {
      unawaited(context.read<AuthCubit>().expireSession());
      return;
    }

    _sessionExpiryTimer = Timer(remaining, () {
      if (!mounted) return;
      unawaited(context.read<AuthCubit>().expireSession());
    });
  }

  void _showSessionExpiredDialog(String message) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final navigatorState = AppNavigator.key.currentState;
      final dialogContext = AppNavigator.key.currentContext;
      if (navigatorState == null || dialogContext == null) return;

      showDialog<void>(
        context: dialogContext,
        barrierDismissible: false,
        builder: (context) {
          final theme = Theme.of(context);
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            title: Text(
              context.tr('Session expired'),
              textAlign: TextAlign.center,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w900,
              ),
            ),
            content: Text(
              context.tr(message),
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(height: 1.6),
            ),
            actionsAlignment: MainAxisAlignment.center,
            actions: [
              FilledButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  AppNavigator.goToLogin();
                },
                child: Text(context.tr('Sign In')),
              ),
            ],
          );
        },
      );
    });
  }
}
