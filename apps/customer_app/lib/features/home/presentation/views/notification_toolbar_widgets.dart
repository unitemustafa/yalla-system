part of 'notifications_view.dart';

class _NotificationActionButton extends StatelessWidget {
  const _NotificationActionButton({
    required this.isDark,
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  final bool isDark;
  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final isEnabled = onPressed != null;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Tooltip(
      message: tooltip,
      child: Material(
        color: isDark ? AppColors.darkCardColor : Colors.white,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.06),
              ),
            ),
            child: Icon(
              icon,
              size: 21,
              color: isEnabled
                  ? (isDark ? Colors.white : Colors.black)
                  : mutedColor.withValues(alpha: 0.45),
            ),
          ),
        ),
      ),
    );
  }
}

class _SelectionToolbar extends StatelessWidget {
  const _SelectionToolbar({
    required this.allSelected,
    required this.hasSelection,
    required this.onSelectAll,
    required this.onDeleteSelected,
  });

  final bool allSelected;
  final bool hasSelection;
  final VoidCallback onSelectAll;
  final VoidCallback onDeleteSelected;

  String _label(BuildContext context, String english, String arabic) {
    return context.isArabicLanguage ? arabic : english;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: onSelectAll,
              icon: Icon(
                allSelected ? AppIcons.tick_circle5 : AppIcons.tick_circle,
                size: 18,
              ),
              label: Text(
                allSelected
                    ? _label(
                        context,
                        'Clear selection',
                        '\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0643\u0644',
                      )
                    : _label(
                        context,
                        'Select all',
                        '\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0643\u0644',
                      ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: BorderSide(
                  color: AppColors.primary.withValues(alpha: 0.28),
                ),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: hasSelection ? onDeleteSelected : null,
              icon: const Icon(AppIcons.trash, size: 18),
              label: Text(
                _label(
                  context,
                  'Delete selected',
                  '\u062d\u0630\u0641 \u0627\u0644\u0645\u062d\u062f\u062f',
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                disabledBackgroundColor: AppColors.error.withValues(
                  alpha: 0.18,
                ),
                disabledForegroundColor: AppColors.error.withValues(
                  alpha: 0.50,
                ),
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationSummary extends StatelessWidget {
  const _NotificationSummary({required this.isDark, required this.unreadCount});

  final bool isDark;
  final int unreadCount;

  String _unreadLabel(BuildContext context) {
    if (context.isArabicLanguage) {
      if (unreadCount == 1) {
        return '\u062a\u062d\u062f\u064a\u062b \u0648\u0627\u062d\u062f \u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621';
      }

      return '$unreadCount \u062a\u062d\u062f\u064a\u062b \u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621';
    }

    return '$unreadCount unread update${unreadCount == 1 ? '' : 's'}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: isDark ? 0.16 : 0.22),
            blurRadius: 22,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              AppIcons.notification_bing,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _unreadLabel(context),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  context.tr(
                    'Stay close to orders, offers and account activity.',
                  ),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.78),
                    height: 1.35,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationDismissBackground extends StatelessWidget {
  const _NotificationDismissBackground();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.only(end: 22),
      decoration: BoxDecoration(
        color: AppColors.error,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: AlignmentDirectional.centerEnd,
      child: const Icon(AppIcons.trash, color: Colors.white, size: 24),
    );
  }
}
