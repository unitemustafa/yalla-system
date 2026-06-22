import 'package:flutter/material.dart';

import 'app_route_arguments.dart';
import 'app_routes.dart';

abstract final class AppNavigator {
  static final GlobalKey<NavigatorState> key = GlobalKey<NavigatorState>();

  static void goToLogin({bool showSessionExpiredNotice = false}) {
    key.currentState?.pushNamedAndRemoveUntil(
      AppRoutes.login,
      (route) => false,
      arguments: showSessionExpiredNotice
          ? const LoginRouteArgs(showSessionExpiredNotice: true)
          : null,
    );
  }
}
