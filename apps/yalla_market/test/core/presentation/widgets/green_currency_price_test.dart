import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/presentation/widgets/texts/green_currency_price.dart';

void main() {
  TextSpan findSymbolSpan(TextSpan span) {
    if (span.text == 'EGP') return span;

    for (final child in span.children ?? const <InlineSpan>[]) {
      if (child is TextSpan) {
        final match = findSymbolSpan(child);
        if (match.text == 'EGP') return match;
      }
    }

    throw StateError('EGP span was not found');
  }

  Widget buildSubject(String price, {TextStyle? style}) {
    return MaterialApp(
      home: Scaffold(
        body: GreenCurrencyPrice(price: price, style: style),
      ),
    );
  }

  testWidgets('renders nothing for empty prices', (tester) async {
    await tester.pumpWidget(buildSubject(''));

    expect(find.byType(SizedBox), findsOneWidget);
    expect(find.byType(RichText), findsNothing);
  });

  testWidgets('formats single and range prices with Egyptian currency', (
    tester,
  ) async {
    await tester.pumpWidget(buildSubject('EGP 120.00 - EGP 180.00'));

    final richText = tester.widget<RichText>(find.byType(RichText));
    final plainText = richText.text.toPlainText();

    expect(plainText, contains('120'));
    expect(plainText, contains('180'));
    expect(plainText, contains('EGP\u00A0120'));
    expect(plainText.startsWith('EGP\u00A0120'), isTrue);
    expect(plainText, contains('120-180'));
    expect(plainText, isNot(contains('EGP\u00A0180')));
    expect(richText.textDirection, TextDirection.ltr);
  });

  testWidgets('keeps short two-digit prices compact and readable', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildSubject('EGP 35.00', style: const TextStyle(fontSize: 20)),
    );

    final richText = tester.widget<RichText>(find.byType(RichText));
    final rootSpan = richText.text as TextSpan;
    final symbolSpan = findSymbolSpan(rootSpan);

    expect(rootSpan.toPlainText(), 'EGP\u00A035');
    expect(symbolSpan.style?.fontSize, lessThan(20));
  });
}
