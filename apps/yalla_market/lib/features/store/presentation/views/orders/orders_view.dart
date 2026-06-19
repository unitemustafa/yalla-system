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
import 'widgets/custom_date_range_sheet.dart';
import 'widgets/order_list_item.dart';

class OrdersView extends StatefulWidget {
  const OrdersView({super.key});

  @override
  State<OrdersView> createState() => _OrdersViewState();
}

enum _OrdersDateFilter { today, week, month, custom }

class _OrdersViewState extends State<OrdersView> {
  static final List<_OrderData> _orders = DemoOrders.all
      .map(_OrderData.fromDemo)
      .toList(growable: false);

  _OrdersDateFilter? _dateFilter;
  DateTimeRange? _customDateRange;

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
        final filteredOrders = _filterOrders(orders);

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
                    itemCount: filteredOrders.isEmpty
                        ? 4
                        : filteredOrders.length + 3,
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
                        return _OrdersDateFilterBar(
                          selected: _dateFilter,
                          customRange: _customDateRange,
                          onChanged: (filter) =>
                              _selectDateFilter(context, filter),
                        );
                      }

                      if (index == 2) {
                        return _OrdersSummaryCard(
                          isDark: isDark,
                          orders: filteredOrders,
                        );
                      }

                      if (filteredOrders.isEmpty) {
                        return _OrdersEmptyFilterState(isDark: isDark);
                      }

                      final order = filteredOrders[index - 3];

                      return OrderListItem(
                        status: order.status,
                        date: order.date,
                        orderId: order.orderId,
                        shippingDate: order.shippingDate,
                        itemCount: order.itemCount,
                        total: order.total,
                        statusColor: order.statusColor,
                        products: order.products
                            .map(
                              (product) => OrderListItemProduct(
                                title: product.title,
                                brand: product.brand,
                                quantity: product.quantity,
                              ),
                            )
                            .toList(growable: false),
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
      placedAt: order.placedAt,
      date: _formatDate(order.placedAt),
      orderId: order.orderNumber,
      shippingDate: _formatDate(order.estimatedDeliveryAt),
      itemCount: order.itemCount,
      total: _formatMoney(order.total),
      products: order.items
          .map(
            (item) => _OrderProductData(
              title: item.title.trim().isEmpty ? 'Item' : item.title,
              brand: item.brand,
              quantity: item.quantity,
              total: _formatMoney(item.lineTotal),
            ),
          )
          .toList(growable: false),
    );
  }

  String _formatDate(DateTime? value) {
    if (value == null) return '-';
    return '${value.day.toString().padLeft(2, '0')} '
        '${_monthName(value.month)} ${value.year}';
  }

  List<_OrderData> _filterOrders(List<_OrderData> orders) {
    final range = _selectedDateRange;
    if (range == null) return orders;

    return orders
        .where((order) {
          final date = _dateOnly(order.placedAt);
          return !date.isBefore(range.start) && !date.isAfter(range.end);
        })
        .toList(growable: false);
  }

  ({DateTime start, DateTime end})? get _selectedDateRange {
    final now = _dateOnly(DateTime.now());

    return switch (_dateFilter) {
      null => null,
      _OrdersDateFilter.today => (start: now, end: now),
      _OrdersDateFilter.week => (
        start: now.subtract(const Duration(days: 6)),
        end: now,
      ),
      _OrdersDateFilter.month => (
        start: DateTime(now.year, now.month),
        end: DateTime(now.year, now.month + 1, 0),
      ),
      _OrdersDateFilter.custom =>
        _customDateRange == null
            ? null
            : (
                start: _dateOnly(_customDateRange!.start),
                end: _dateOnly(_customDateRange!.end),
              ),
    };
  }

  Future<void> _selectDateFilter(
    BuildContext context,
    _OrdersDateFilter filter,
  ) async {
    if (filter != _OrdersDateFilter.custom) {
      setState(() => _dateFilter = filter);
      return;
    }

    final now = _dateOnly(DateTime.now());
    final range = await showModalBottomSheet<DateTimeRange>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CustomDateRangeSheet(
        firstDate: DateTime(now.year - 5),
        lastDate: DateTime(now.year + 1, 12, 31),
        initialRange:
            _customDateRange ??
            DateTimeRange(
              start: now.subtract(const Duration(days: 30)),
              end: now,
            ),
      ),
    );

    if (range == null) return;

    setState(() {
      _dateFilter = filter;
      _customDateRange = range;
    });
  }

  DateTime _dateOnly(DateTime value) {
    return DateTime(value.year, value.month, value.day);
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
            constraints: BoxConstraints(
              maxHeight: MediaQuery.sizeOf(context).height * 0.86,
            ),
            child: SingleChildScrollView(
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
                  if (order.products.isNotEmpty) ...[
                    const SizedBox(height: 18),
                    _OrderProductsSection(
                      products: order.products,
                      itemCount: order.itemCount,
                      mutedColor: mutedColor,
                      isDark: isDark,
                    ),
                  ],
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
                      icon: const Icon(
                        AppIcons.tick_circle,
                        color: Colors.white,
                      ),
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
            label: 'Shipment on the way',
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

class _OrdersDateFilterBar extends StatelessWidget {
  const _OrdersDateFilterBar({
    required this.selected,
    required this.customRange,
    required this.onChanged,
  });

  final _OrdersDateFilter? selected;
  final DateTimeRange? customRange;
  final ValueChanged<_OrdersDateFilter> onChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final options = [
      (_OrdersDateFilter.today, 'Today'),
      (_OrdersDateFilter.week, 'This week'),
      (_OrdersDateFilter.month, 'This month'),
      (_OrdersDateFilter.custom, _customLabel(context)),
    ];

    return SizedBox(
      height: 42,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemBuilder: (context, index) {
          final option = options[index];
          final isSelected = selected == option.$1;
          final foregroundColor = isSelected
              ? Colors.white
              : isDark
              ? AppColors.darkTextSecondary
              : AppColors.lightTextPrimary;

          return ChoiceChip(
            selected: isSelected,
            showCheckmark: false,
            label: Text(
              context.tr(option.$2),
              style: TextStyle(
                color: foregroundColor,
                fontWeight: FontWeight.w900,
              ),
            ),
            avatar: option.$1 == _OrdersDateFilter.custom
                ? Icon(AppIcons.calendar, size: 16, color: foregroundColor)
                : null,
            selectedColor: AppColors.primary,
            backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
            side: BorderSide(
              color: isSelected
                  ? AppColors.primary
                  : isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.06),
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            onSelected: (_) => onChanged(option.$1),
          );
        },
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemCount: options.length,
      ),
    );
  }

  String _customLabel(BuildContext context) {
    final range = customRange;
    if (selected != _OrdersDateFilter.custom || range == null) {
      return 'Custom';
    }

    return '${_shortDate(range.start)} - ${_shortDate(range.end)}';
  }

  String _shortDate(DateTime value) {
    return '${value.day.toString().padLeft(2, '0')}/'
        '${value.month.toString().padLeft(2, '0')}';
  }
}

class _OrdersEmptyFilterState extends StatelessWidget {
  const _OrdersEmptyFilterState({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardColor : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.06),
        ),
      ),
      child: Column(
        children: [
          Icon(AppIcons.calendar, color: mutedColor, size: 28),
          const SizedBox(height: 10),
          Text(
            context.tr('No orders in this period'),
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: mutedColor,
              fontWeight: FontWeight.w900,
            ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor = isDark
        ? AppColors.darkTextSecondary
        : Colors.black.withValues(alpha: 0.52);

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
                    color: labelColor,
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

class _OrderProductsSection extends StatelessWidget {
  const _OrderProductsSection({
    required this.products,
    required this.itemCount,
    required this.mutedColor,
    required this.isDark,
  });

  final List<_OrderProductData> products;
  final int itemCount;
  final Color mutedColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.07)
        : Colors.black.withValues(alpha: 0.06);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.04)
            : AppColors.primary.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(AppIcons.shopping_bag, size: 18, color: mutedColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  context.tr('Products'),
                  style: Theme.of(
                    context,
                  ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w900),
                ),
              ),
              Text(
                context.productCount(itemCount),
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: mutedColor,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          for (final product in products) ...[
            _OrderProductRow(product: product, mutedColor: mutedColor),
            if (product != products.last)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Divider(height: 1, color: borderColor),
              ),
          ],
        ],
      ),
    );
  }
}

class _OrderProductRow extends StatelessWidget {
  const _OrderProductRow({required this.product, required this.mutedColor});

  final _OrderProductData product;
  final Color mutedColor;

  @override
  Widget build(BuildContext context) {
    final brand = product.brand.trim();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          constraints: const BoxConstraints(minWidth: 32),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            'x${product.quantity}',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr(product.title),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
              if (brand.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  context.tr(brand),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: mutedColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ],
          ),
        ),
        if (product.total != null) ...[
          const SizedBox(width: 10),
          AppCurrencyText(
            text: product.total!,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w900),
          ),
        ],
      ],
    );
  }
}

class _OrderData {
  const _OrderData({
    required this.status,
    required this.placedAt,
    required this.date,
    required this.orderId,
    required this.shippingDate,
    required this.itemCount,
    required this.total,
    required this.products,
  });

  final String status;
  final DateTime placedAt;
  final String date;
  final String orderId;
  final String shippingDate;
  final int itemCount;
  final String total;
  final List<_OrderProductData> products;

  factory _OrderData.fromDemo(DemoOrderData order) {
    final status = order.status == 'Delivered'
        ? 'Delivered'
        : 'Shipment on the way';

    return _OrderData(
      status: status,
      placedAt: _parseDemoOrderDate(order.date),
      date: order.date,
      orderId: order.orderId,
      shippingDate: order.shippingDate,
      itemCount: order.itemCount,
      total: order.total,
      products: order.items
          .map(
            (item) => _OrderProductData(
              title: item.title,
              brand: item.brand,
              quantity: item.quantity,
              total: item.total,
            ),
          )
          .toList(growable: false),
    );
  }

  Color get statusColor {
    return status == 'Delivered' ? AppColors.success : AppColors.warning;
  }
}

DateTime _parseDemoOrderDate(String value) {
  final parts = value.trim().split(RegExp(r'\s+'));
  if (parts.length != 3) return DateTime.now();

  final day = int.tryParse(parts[0]) ?? DateTime.now().day;
  final year = int.tryParse(parts[2]) ?? DateTime.now().year;
  final month =
      const {
        'Jan': 1,
        'Feb': 2,
        'Mar': 3,
        'Apr': 4,
        'May': 5,
        'Jun': 6,
        'Jul': 7,
        'Aug': 8,
        'Sep': 9,
        'Oct': 10,
        'Nov': 11,
        'Dec': 12,
      }[parts[1]] ??
      DateTime.now().month;

  return DateTime(year, month, day);
}

class _OrderProductData {
  const _OrderProductData({
    required this.title,
    required this.quantity,
    this.brand = '',
    this.total,
  });

  final String title;
  final int quantity;
  final String brand;
  final String? total;
}
