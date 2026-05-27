import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/presentation/widgets/states/app_state_view.dart';

part 'notification_toolbar_widgets.dart';
part 'notification_card_widgets.dart';
part 'notification_detail_widgets.dart';

class NotificationsView extends StatefulWidget {
  const NotificationsView({super.key});

  @override
  State<NotificationsView> createState() => _NotificationsViewState();
}

class _NotificationsViewState extends State<NotificationsView> {
  static const _initialNotifications = [
    _NotificationData(
      id: 'order-confirmed',
      icon: AppIcons.bag_tick,
      title: 'Order confirmed',
      message: 'Your sports order is being prepared.',
      time: '2 min ago',
      color: AppColors.success,
      unread: true,
    ),
    _NotificationData(
      id: 'popular-categories',
      icon: AppIcons.category,
      title: 'Popular categories updated',
      message: 'Fresh picks are available in the most requested categories.',
      time: '18 min ago',
      color: AppColors.warning,
      unread: true,
    ),
    _NotificationData(
      id: 'shipment-update',
      icon: AppIcons.truck_fast,
      title: 'Shipment update',
      message: 'Your package is on the way to your address.',
      time: '1 hour ago',
      color: AppColors.primary,
    ),
    _NotificationData(
      id: 'account-secured',
      icon: AppIcons.security_safe,
      title: 'Account secured',
      message: 'A new sign-in was verified successfully.',
      time: 'Yesterday',
      color: Color(0xFF06B6D4),
    ),
  ];

  late final List<_NotificationData> _notifications =
      List<_NotificationData>.of(_initialNotifications);
  final Set<String> _selectedIds = <String>{};
  bool _selectionMode = false;

  int get _unreadCount {
    return _notifications.where((notification) => notification.unread).length;
  }

  bool get _allSelected {
    return _notifications.isNotEmpty &&
        _selectedIds.length == _notifications.length;
  }

  String _label(BuildContext context, String english, String arabic) {
    return context.isArabicLanguage ? arabic : english;
  }

  String _selectedSubtitle(BuildContext context) {
    if (context.isArabicLanguage) {
      return '${_selectedIds.length} \u0645\u062d\u062f\u062f \u0645\u0646 ${_notifications.length}';
    }

    return '${_selectedIds.length} selected of ${_notifications.length}';
  }

  void _enterSelectionMode() {
    if (_notifications.isEmpty) return;
    setState(() => _selectionMode = true);
  }

  void _exitSelectionMode() {
    setState(() {
      _selectionMode = false;
      _selectedIds.clear();
    });
  }

  void _toggleSelected(_NotificationData notification) {
    setState(() {
      _selectionMode = true;
      if (_selectedIds.contains(notification.id)) {
        _selectedIds.remove(notification.id);
      } else {
        _selectedIds.add(notification.id);
      }
    });
  }

  void _toggleSelectAll() {
    setState(() {
      _selectionMode = true;
      if (_allSelected) {
        _selectedIds.clear();
      } else {
        _selectedIds
          ..clear()
          ..addAll(_notifications.map((notification) => notification.id));
      }
    });
  }

  void _deleteSelected() {
    if (_selectedIds.isEmpty) return;

    final removedCount = _selectedIds.length;
    setState(() {
      _notifications.removeWhere(
        (notification) => _selectedIds.contains(notification.id),
      );
      _selectedIds.clear();
      _selectionMode = false;
    });

    CustomSnackBar.showRemoved(
      context: context,
      title: removedCount == 1
          ? _label(
              context,
              'Notification deleted',
              '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631',
            )
          : _label(
              context,
              'Notifications deleted',
              '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
            ),
    );
  }

  void _deleteNotification(_NotificationData notification) {
    setState(() {
      _notifications.removeWhere((item) => item.id == notification.id);
      _selectedIds.remove(notification.id);
      if (_notifications.isEmpty || _selectedIds.isEmpty) {
        _selectionMode = false;
      }
    });

    CustomSnackBar.showRemoved(
      context: context,
      title: _label(
        context,
        'Notification deleted',
        '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631',
      ),
    );
  }

  void _openNotification(_NotificationData notification) {
    var currentNotification = notification;
    final index = _notifications.indexWhere(
      (item) => item.id == notification.id,
    );

    if (index != -1 && _notifications[index].unread) {
      currentNotification = _notifications[index].copyWith(unread: false);
      setState(() => _notifications[index] = currentNotification);
    }

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return _NotificationDetailSheet(
          data: currentNotification,
          isDark: isDark,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final maxContentWidth = constraints.maxWidth >= 760
                ? 680.0
                : constraints.maxWidth;

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: maxContentWidth),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      PageTopBar(
                        title: _selectionMode
                            ? _label(
                                context,
                                'Selected notifications',
                                '\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
                              )
                            : 'Notifications',
                        subtitle: _selectionMode
                            ? _selectedSubtitle(context)
                            : 'Orders, deals and account updates',
                        onBackPressed: _selectionMode
                            ? _exitSelectionMode
                            : null,
                        actions: [
                          if (!_selectionMode)
                            _NotificationActionButton(
                              isDark: isDark,
                              icon: AppIcons.tick_circle,
                              tooltip: _label(
                                context,
                                'Select notifications',
                                '\u062d\u062f\u062f \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
                              ),
                              onPressed: _enterSelectionMode,
                            ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      _NotificationSummary(
                        isDark: isDark,
                        unreadCount: _unreadCount,
                      ),
                      if (_selectionMode && _notifications.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _SelectionToolbar(
                          allSelected: _allSelected,
                          hasSelection: _selectedIds.isNotEmpty,
                          onSelectAll: _toggleSelectAll,
                          onDeleteSelected: _deleteSelected,
                        ),
                      ],
                      const SizedBox(height: 22),
                      if (_notifications.isEmpty)
                        const _EmptyNotificationsView()
                      else ...[
                        Text(
                          context.tr('Today'),
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 10),
                        ..._notifications.map(
                          (notification) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Dismissible(
                              key: ValueKey(notification.id),
                              direction: _selectionMode
                                  ? DismissDirection.none
                                  : DismissDirection.endToStart,
                              background:
                                  const _NotificationDismissBackground(),
                              onDismissed: (_) =>
                                  _deleteNotification(notification),
                              child: _NotificationCard(
                                data: notification,
                                isDark: isDark,
                                unread: notification.unread,
                                selectionMode: _selectionMode,
                                selected: _selectedIds.contains(
                                  notification.id,
                                ),
                                onTap: _selectionMode
                                    ? () => _toggleSelected(notification)
                                    : () => _openNotification(notification),
                                onLongPress: () =>
                                    _toggleSelected(notification),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
