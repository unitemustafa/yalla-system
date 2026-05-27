import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/presentation/widgets/texts/app_currency_text.dart';

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

  Widget buildSubject(String text, {TextStyle? style}) {
    return MaterialApp(
      home: Scaffold(
        body: AppCurrencyText(text: text, style: style),
      ),
    );
  }

  testWidgets('keeps EGP and the amount together with refined styling', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildSubject('EGP 35', style: const TextStyle(fontSize: 20)),
    );

    final richText = tester.widget<RichText>(find.byType(RichText));
    final rootSpan = richText.text as TextSpan;
    final symbolSpan = findSymbolSpan(rootSpan);

    expect(rootSpan.toPlainText(), 'EGP\u00A035');
    expect(symbolSpan.style?.fontSize, lessThan(20));
    expect(richText.textDirection, TextDirection.ltr);
  });
}
