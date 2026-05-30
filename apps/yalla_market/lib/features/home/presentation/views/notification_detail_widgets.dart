part of 'notifications_view.dart';

class _NotificationDetailSheet extends StatelessWidget {
  const _NotificationDetailSheet({required this.data, required this.isDark});

  final _NotificationData data;
  final bool isDark;

  String _label(BuildContext context, String english, String arabic) {
    return context.isArabicLanguage ? arabic : english;
  }

  @override
  Widget build(BuildContext context) {
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;

    return SafeArea(
      top: false,
      child: Container(
        width: double.infinity,
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.72,
        ),
        padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
        decoration: BoxDecoration(
          color: panelColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.32 : 0.14),
              blurRadius: 28,
              offset: const Offset(0, -12),
            ),
          ],
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 46,
                  height: 4,
                  decoration: BoxDecoration(
                    color: mutedColor.withValues(alpha: 0.28),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: data.color.withValues(alpha: isDark ? 0.18 : 0.10),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(data.icon, color: data.color, size: 25),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _label(
                            context,
                            'Notification details',
                            '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631',
                          ),
                          style: Theme.of(context).textTheme.labelMedium
                              ?.copyWith(
                                color: mutedColor,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          context.tr(data.title),
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(
                                color: textColor,
                                fontWeight: FontWeight.w900,
                                height: 1.15,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          context.tr(data.time),
                          style: Theme.of(context).textTheme.labelSmall
                              ?.copyWith(
                                color: mutedColor,
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                context.tr(data.message),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: textColor,
                  height: 1.55,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(AppIcons.tick_circle, size: 18),
                  label: Text(
                    context.tr('Done'),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: BorderSide(
                      color: AppColors.primary.withValues(alpha: 0.30),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyNotificationsView extends StatelessWidget {
  const _EmptyNotificationsView();

  @override
  Widget build(BuildContext context) {
    final title = context.isArabicLanguage
        ? '\u0645\u0641\u064a\u0634 \u0625\u0634\u0639\u0627\u0631\u0627\u062a \u062d\u0627\u0644\u064a\u0627'
        : 'No notifications yet';
    final message = context.isArabicLanguage
        ? '\u0623\u064a \u062a\u062d\u062f\u064a\u062b\u0627\u062a \u0639\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0623\u0648 \u0627\u0644\u0639\u0631\u0648\u0636 \u0623\u0648 \u0627\u0644\u062d\u0633\u0627\u0628 \u0647\u062a\u0638\u0647\u0631 \u0647\u0646\u0627.'
        : 'Order, offer, and account updates will appear here.';

    return SizedBox(
      height: 300,
      child: AppEmptyState(
        title: title,
        message: message,
        icon: AppIcons.notification_bing,
      ),
    );
  }
}

class _NotificationData {
  const _NotificationData({
    required this.id,
    required this.icon,
    required this.title,
    required this.message,
    required this.time,
    required this.color,
    this.unread = false,
  });

  final String id;
  final IconData icon;
  final String title;
  final String message;
  final String time;
  final Color color;
  final bool unread;

  _NotificationData copyWith({bool? unread}) {
    return _NotificationData(
      id: id,
      icon: icon,
      title: title,
      message: message,
      time: time,
      color: color,
      unread: unread ?? this.unread,
    );
  }
}
