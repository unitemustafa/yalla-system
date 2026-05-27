import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/features/auth/presentation/widgets/policy_link.dart';

void main() {
  testWidgets('calls the tap handler', (tester) async {
    var tapCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PolicyLink(
            text: 'Privacy Policy',
            style: const TextStyle(fontWeight: FontWeight.bold),
            onTap: () => tapCount++,
          ),
        ),
      ),
    );

    await tester.tap(find.text('Privacy Policy'));

    expect(tapCount, 1);
  });
}
