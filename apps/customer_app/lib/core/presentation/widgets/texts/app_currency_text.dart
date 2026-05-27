import 'package:flutter/material.dart';

import '../../../constants/app_colors.dart';
import '../../../formatters/app_currency.dart';

const _currencyGap = '\u00A0';

class AppCurrencyText extends StatelessWidget {
  const AppCurrencyText({
    super.key,
    required this.text,
    this.style,
    this.currencyColor = AppColors.currency,
    this.textAlign,
    this.maxLines = 1,
    this.overflow = TextOverflow.ellipsis,
  });

  final String text;
  final TextStyle? style;
  final Color currencyColor;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow overflow;

  @override
  Widget build(BuildContext context) {
    if (!text.contains(AppCurrency.symbol)) {
      return Text(
        text,
        style: style,
        textAlign: textAlign,
        maxLines: maxLines,
        overflow: overflow,
      );
    }

    final numberStyle = _numberStyle(context);
    return Text.rich(
      TextSpan(style: numberStyle, children: _spans(context, numberStyle)),
      textAlign: textAlign,
      textDirection: TextDirection.ltr,
      maxLines: maxLines,
      overflow: overflow,
    );
  }

  List<InlineSpan> _spans(BuildContext context, TextStyle numberStyle) {
    final spans = <InlineSpan>[];
    final symbolPattern = RegExp(RegExp.escape(AppCurrency.symbol));
    var cursor = 0;

    for (final match in symbolPattern.allMatches(text)) {
      if (match.start > cursor) {
        spans.add(TextSpan(text: text.substring(cursor, match.start)));
      }

      spans.add(
        TextSpan(text: AppCurrency.symbol, style: _currencyStyle(numberStyle)),
      );

      cursor = match.end;
      if (cursor < text.length && text[cursor] == ' ') {
        spans.add(const TextSpan(text: _currencyGap));
        cursor++;
      }
    }

    if (cursor < text.length) {
      spans.add(TextSpan(text: text.substring(cursor)));
    }

    return spans;
  }

  TextStyle _numberStyle(BuildContext context) {
    final baseStyle = style ?? DefaultTextStyle.of(context).style;
    return baseStyle.copyWith(
      fontFeatures: const [FontFeature.tabularFigures()],
    );
  }

  TextStyle _currencyStyle(TextStyle numberStyle) {
    final fontSize = numberStyle.fontSize;

    return numberStyle.copyWith(
      color: currencyColor,
      fontSize: fontSize == null || fontSize <= 12 ? fontSize : fontSize * 0.82,
      fontWeight: FontWeight.w900,
    );
  }
}
