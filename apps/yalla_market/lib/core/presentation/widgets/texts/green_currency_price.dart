import 'package:flutter/material.dart';

import '../../../constants/app_colors.dart';
import '../../../formatters/app_currency.dart';

const _currencyGap = '\u00A0';

class GreenCurrencyPrice extends StatelessWidget {
  final String price;
  final TextStyle? style;

  const GreenCurrencyPrice({super.key, required this.price, this.style});

  @override
  Widget build(BuildContext context) {
    if (price.isEmpty) return const SizedBox.shrink();

    final formattedPrice = AppCurrency.formatPriceText(price);
    final numbers = AppCurrency.priceNumbers(formattedPrice);
    if (numbers.isEmpty) return const SizedBox.shrink();

    final numberStyle = _numberStyle(context);
    final currencyStyle = _currencyStyle(numberStyle);

    return Text.rich(
      TextSpan(
        style: numberStyle,
        children: [
          TextSpan(text: AppCurrency.symbol, style: currencyStyle),
          const TextSpan(text: _currencyGap),
          for (var index = 0; index < numbers.length; index++) ...[
            TextSpan(text: numbers[index]),
            if (index < numbers.length - 1) const TextSpan(text: '-'),
          ],
        ],
      ),
      textDirection: TextDirection.ltr,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
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
      color: AppColors.currency,
      fontSize: fontSize == null || fontSize <= 12 ? fontSize : fontSize * 0.82,
      fontWeight: FontWeight.w900,
    );
  }
}
