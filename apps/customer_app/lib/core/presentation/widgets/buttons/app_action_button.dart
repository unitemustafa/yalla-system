import 'package:flutter/material.dart';

import '../../../constants/app_colors.dart';
import '../../../localization/app_translations.dart';

enum AppActionButtonVariant { filled, outlined, danger }

class AppActionButton extends StatelessWidget {
  const AppActionButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.variant = AppActionButtonVariant.filled,
    this.fullWidth = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final AppActionButtonVariant variant;
  final bool fullWidth;

  bool get _enabled => onPressed != null && !isLoading;

  @override
  Widget build(BuildContext context) {
    final localizedLabel = context.tr(label);
    final child = AnimatedSwitcher(
      duration: const Duration(milliseconds: 160),
      child: isLoading
          ? const SizedBox(
              key: ValueKey('loading'),
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2.2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : Row(
              key: ValueKey(localizedLabel),
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 18),
                  const SizedBox(width: 8),
                ],
                Flexible(
                  child: Text(localizedLabel, overflow: TextOverflow.ellipsis),
                ),
              ],
            ),
    );

    final button = switch (variant) {
      AppActionButtonVariant.filled => ElevatedButton(
        onPressed: _enabled ? onPressed : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.38),
          disabledForegroundColor: Colors.white.withValues(alpha: 0.78),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
        child: child,
      ),
      AppActionButtonVariant.outlined => OutlinedButton(
        onPressed: _enabled ? onPressed : null,
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          disabledForegroundColor: AppColors.primary.withValues(alpha: 0.38),
          side: BorderSide(
            color: _enabled
                ? AppColors.primary.withValues(alpha: 0.45)
                : AppColors.primary.withValues(alpha: 0.18),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: child,
      ),
      AppActionButtonVariant.danger => OutlinedButton(
        onPressed: _enabled ? onPressed : null,
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.error,
          disabledForegroundColor: AppColors.error.withValues(alpha: 0.36),
          side: BorderSide(
            color: _enabled
                ? AppColors.error.withValues(alpha: 0.38)
                : AppColors.error.withValues(alpha: 0.16),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: child,
      ),
    };

    return SizedBox(width: fullWidth ? double.infinity : null, child: button);
  }
}
