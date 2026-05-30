import 'package:flutter/material.dart';
import 'package:yalla_market/core/localization/app_translations.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/formatters/app_currency.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/states/app_state_view.dart';
import '../../../../../core/presentation/widgets/texts/app_currency_text.dart';
import '../../../data/demo/demo_orders.dart';
import '../../../domain/entities/order.dart';
import '../../cubit/order_history_cubit.dart';
import '../../cubit/order_history_state.dart';
import 'widgets/order_list_item.dart';

class OrdersView extends StatefulWidget {
  const OrdersView({super.key});

  @override
  State<OrdersView> createState() => _OrdersViewState();
}

class _OrdersViewState extends State<OrdersView> {
  static final List<_OrderData> _orders = DemoOrders.all
      .map(_OrderData.fromDemo)
      .toList(growable: false);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<OrderHistoryCubit>().loadOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return BlocBuilder<OrderHistoryCubit, OrderHistoryState>(
      builder: (context, state) {
        final loadedOrders = state is OrderHistoryReady
            ? state.orders.map(_mapStoredOrder).toList(growable: false)
            : state is OrderHistoryFailure
            ? state.orders.map(_mapStoredOrder).toList(growable: false)
            : const <_OrderData>[];
        final orders = loadedOrders.isEmpty ? _orders : loadedOrders;

        return Scaffold(
          backgroundColor: backgroundColor,
          body: SafeArea(
            child: state is OrderHistoryLoading
                ? const AppLoadingState(message: 'Loading orders...')
                : state is OrderHistoryFailure && loadedOrders.isEmpty
                ? AppErrorState(
                    title: 'Orders could not load',
                    message: state.message,
                    onRetry: context.read<OrderHistoryCubit>().loadOrders,
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                    itemCount: orders.length + 2,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return const PageTopBar(
                          title: 'My Orders',
                          subtitle: 'Track current and previous purchases',
                        );
                      }

                      if (index == 1) {
                        return _OrdersSummaryCard(
                          isDark: isDark,
                          orders: orders,
                        );
                      }

                      final order = orders[index - 2];

                      return OrderListItem(
                        status: order.status,
                        date: order.date,
                        orderId: order.orderId,
                        shippingDate: order.shippingDate,
                        itemCount: order.itemCount,
                        total: order.total,
                        statusColor: order.statusColor,
                        onTap: () => _showOrderDetails(context, order),
                      );
                    },
                  ),
          ),
        );
      },
    );
  }

  _OrderData _mapStoredOrder(OrderData order) {
    return _OrderData(
      status: order.statusLabel,
      date: _formatDate(order.placedAt),
      orderId: order.orderNumber,
      shippingDate: _formatDate(order.estimatedDeliveryAt),
      itemCount: order.itemCount,
      total: _formatMoney(order.total),
    );
  }

  String _formatDate(DateTime? value) {
    if (value == null) return 'Pending';
    return '${value.day.toString().padLeft(2, '0')} '
        '${_monthName(value.month)} ${value.year}';
  }

  String _formatMoney(double value) =>
      AppCurrency.format(value, fractionDigits: 2, trimTrailingZero: false);

  String _monthName(int month) {
    const names = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return names[(month - 1).clamp(0, names.length - 1)];
  }

  void _showOrderDetails(BuildContext context, _OrderData order) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final sheetColor = isDark ? const Color(0xFF222326) : Colors.white;
    final mutedColor = isDark
        ? Colors.white.withValues(alpha: 0.62)
        : Colors.black.withValues(alpha: 0.58);

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return SafeArea(
          top: false,
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            decoration: BoxDecoration(
              color: sheetColor,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.06),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: mutedColor.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: order.statusColor.withValues(
                          alpha: isDark ? 0.18 : 0.10,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        AppIcons.box,
                        color: order.statusColor,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            context.tr(order.status),
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(
                                  color: order.statusColor,
                                  fontWeight: FontWeight.w900,
                                ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            order.orderId,
                            style: Theme.of(context).textTheme.bodySmall
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
                const SizedBox(height: 18),
                _DetailRow(
                  icon: AppIcons.calendar,
                  label: 'Order date',
                  value: order.date,
                  mutedColor: mutedColor,
                ),
                const SizedBox(height: 12),
                _DetailRow(
                  icon: AppIcons.calendar_1,
                  label: 'Shipping date',
                  value: order.shippingDate,
                  mutedColor: mutedColor,
                ),
                const SizedBox(height: 12),
                _DetailRow(
                  icon: AppIcons.shopping_bag,
                  label: 'Items',
                  value: context.productCount(order.itemCount),
                  mutedColor: mutedColor,
                ),
                const SizedBox(height: 12),
                _DetailRow(
                  icon: AppIcons.receipt_text,
                  label: 'Total',
                  value: order.total,
                  mutedColor: mutedColor,
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(AppIcons.tick_circle, color: Colors.white),
                    label: Text(
                      context.tr('Done'),
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _OrdersSummaryCard extends StatelessWidget {
  const _OrdersSummaryCard({required this.isDark, required this.orders});

  final bool isDark;
  final List<_OrderData> orders;

  @override
  Widget build(BuildContext context) {
    final deliveredCount = orders
        .where((order) => order.status == 'Delivered')
        .length;
    final activeCount = orders.length - deliveredCount;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF25273A) : const Color(0xFFEAF2FF),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.14)),
      ),
      child: Row(
        children: [
          _SummaryPill(
            icon: AppIcons.receipt_text,
            value: '${orders.length}',
            label: 'Total',
            color: AppColors.primary,
          ),
          const SizedBox(width: 10),
          _SummaryPill(
            icon: AppIcons.truck_fast,
            value: '$activeCount',
            label: 'Active',
            color: AppColors.warning,
          ),
          const SizedBox(width: 10),
          _SummaryPill(
            icon: AppIcons.tick_circle,
            value: '$deliveredCount',
            label: 'Delivered',
            color: AppColors.success,
          ),
        ],
      ),
    );
  }
}

class _SummaryPill extends StatelessWidget {
  const _SummaryPill({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppCurrencyText(
                  text: context.tr(value),
                  style: Theme.of(
                    context,
                  ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w900),
                ),
                Text(
                  context.tr(label),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: Colors.black.withValues(alpha: 0.52),
                    fontWeight: FontWeight.w700,
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

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.mutedColor,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color mutedColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 19, color: mutedColor),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            context.tr(label),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: mutedColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        AppCurrencyText(
          text: context.tr(value),
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
      ],
    );
  }
}

class _OrderData {
  const _OrderData({
    required this.status,
    required this.date,
    required this.orderId,
    required this.shippingDate,
    required this.itemCount,
    required this.total,
  });

  final String status;
  final String date;
  final String orderId;
  final String shippingDate;
  final int itemCount;
  final String total;

  factory _OrderData.fromDemo(DemoOrderData order) {
    return _OrderData(
      status: order.status,
      date: order.date,
      orderId: order.orderId,
      shippingDate: order.shippingDate,
      itemCount: order.itemCount,
      total: order.total,
    );
  }

  Color get statusColor {
    return switch (status) {
      'Delivered' || 'Completed' => AppColors.success,
      'Shipment on the way' => AppColors.warning,
      'Shipped' || 'Processing' => AppColors.warning,
      'Cancelled' => AppColors.error,
      _ => AppColors.primary,
    };
  }
}
