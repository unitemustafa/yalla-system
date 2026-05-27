import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/constants/app_constants.dart';
import 'package:yallamarket/core/di/service_locator.dart';
import 'package:yallamarket/yalla_market_app.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUpAll(() async {
    SharedPreferences.setMockInitialValues({});
    initServiceLocator();
  });

  testWidgets('renders the app shell', (tester) async {
    await tester.pumpWidget(const YallaMarketApp());
    await tester.pump();

    expect(find.text(AppConstants.appName), findsOneWidget);
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
