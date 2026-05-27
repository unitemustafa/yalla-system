import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../constants/app_colors.dart';
import '../../../localization/app_translations.dart';

class AppNavigationIconButton extends StatelessWidget {
  const AppNavigationIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.color,
    this.backgroundColor,
    this.flipInRtl = false,
  });

  const AppNavigationIconButton.back({
    super.key,
    required this.onPressed,
    this.tooltip = 'Back',
    this.color,
    this.backgroundColor,
  }) : icon = AppIcons.arrow_left_2,
       flipInRtl = true;

  const AppNavigationIconButton.close({
    super.key,
    required this.onPressed,
    this.tooltip = 'Close',
    this.color,
    this.backgroundColor,
  }) : icon = Icons.close_rounded,
       flipInRtl = false;

  final IconData icon;
  final VoidCallback? onPressed;
  final String? tooltip;
  final Color? color;
  final Color? backgroundColor;
  final bool flipInRtl;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor =
        color ?? (isDark ? Colors.white : AppColors.lightTextPrimary);
    final fillColor =
        backgroundColor ??
        (isDark
            ? Colors.white.withValues(alpha: 0.07)
            : Colors.white.withValues(alpha: 0.92));
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);

    final effectiveIcon =
        flipInRtl && Directionality.of(context) == TextDirection.rtl
        ? AppIcons.arrow_right_3
        : icon;

    final button = Material(
      color: fillColor,
      shape: CircleBorder(side: BorderSide(color: borderColor)),
      child: InkWell(
        onTap: onPressed,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 42,
          height: 42,
          child: Icon(effectiveIcon, size: 21, color: iconColor),
        ),
      ),
    );

    return tooltip == null
        ? button
        : Tooltip(message: context.tr(tooltip!), child: button);
  }
}
