import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../constants/app_colors.dart';
import '../../../localization/app_translations.dart';

class CustomSnackBar {
  static void showAdded({
    required BuildContext context,
    String title = 'Item added',
    String? message,
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.tick_circle,
      accentColor: AppColors.success,
    );
  }

  static void showRemoved({
    required BuildContext context,
    String title = 'Item removed',
    String? message,
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.trash,
      accentColor: AppColors.error,
    );
  }

  static void showSuccess({
    required BuildContext context,
    required String title,
    String? message,
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.tick_circle,
      accentColor: AppColors.success,
    );
  }

  static void showPersistentSuccess({
    required BuildContext context,
    required String title,
    String? message,
    String actionLabel = 'Done',
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.tick_circle,
      accentColor: AppColors.success,
      duration: const Duration(days: 365),
      actionLabel: actionLabel,
    );
  }

  static void showWarning({
    required BuildContext context,
    required String title,
    String? message,
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.warning_2,
      accentColor: AppColors.warning,
    );
  }

  static void showPersistentWarning({
    required BuildContext context,
    required String title,
    String? message,
    String actionLabel = 'Done',
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.warning_2,
      accentColor: AppColors.warning,
      duration: const Duration(days: 365),
      actionLabel: actionLabel,
    );
  }

  static void showError({
    required BuildContext context,
    required String title,
    String? message,
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.danger,
      accentColor: AppColors.error,
    );
  }

  static void showInfo({
    required BuildContext context,
    required String title,
    String? message,
  }) {
    _show(
      context: context,
      title: title,
      message: message,
      icon: AppIcons.info_circle,
      accentColor: AppColors.info,
    );
  }

  static void _show({
    required BuildContext context,
    required String title,
    required IconData icon,
    required Color accentColor,
    String? message,
    Duration? duration,
    String? actionLabel,
  }) {
    final theme = Theme.of(context);
    final localizedTitle = context.tr(title);
    final localizedMessage = message == null ? null : context.tr(message);
    final localizedAction = actionLabel == null
        ? null
        : context.tr(actionLabel);
    final hasMessage = message != null && message.trim().isNotEmpty;
    final messenger = ScaffoldMessenger.of(context);

    messenger.clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        elevation: 0,
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        margin: const EdgeInsets.fromLTRB(10, 0, 10, 14),
        padding: EdgeInsets.zero,
        duration: duration ?? Duration(seconds: hasMessage ? 4 : 2),
        content: Container(
          constraints: const BoxConstraints(minHeight: 50),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: accentColor,
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.28),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: hasMessage
                ? CrossAxisAlignment.start
                : CrossAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      localizedTitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style:
                          theme.textTheme.titleSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ) ??
                          const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    if (hasMessage) ...[
                      const SizedBox(height: 2),
                      Text(
                        localizedMessage!,
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                        style:
                            theme.textTheme.bodySmall?.copyWith(
                              color: Colors.white.withValues(alpha: 0.76),
                            ) ??
                            TextStyle(
                              color: Colors.white.withValues(alpha: 0.76),
                            ),
                      ),
                    ],
                  ],
                ),
              ),
              if (localizedAction != null) ...[
                const SizedBox(width: 8),
                TextButton(
                  onPressed: messenger.hideCurrentSnackBar,
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white,
                    minimumSize: const Size(44, 36),
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    localizedAction,
                    style:
                        theme.textTheme.labelLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ) ??
                        const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
