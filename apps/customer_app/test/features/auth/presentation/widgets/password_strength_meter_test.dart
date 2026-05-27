import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/localization/app_language_controller.dart';
import 'package:yallamarket/features/auth/presentation/widgets/password_strength_meter.dart';

void main() {
  setUp(() {
    AppLanguageController.instance.value = AppLanguage.english;
  });

  testWidgets('updates the visible password requirements', (tester) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: PasswordStrengthMeter(controller: controller)),
      ),
    );

    expect(find.text('At least 8 characters'), findsOneWidget);
    expect(find.text('Uppercase and lowercase letters'), findsOneWidget);
    expect(find.text('Number and special character'), findsOneWidget);

    controller.text = 'abcdefgh';
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey(true)), findsOneWidget);

    controller.text = 'Abcdefgh';
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey(true)), findsNWidgets(2));

    controller.text = 'Abcdef1!';
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey(true)), findsNWidgets(3));
  });
}
