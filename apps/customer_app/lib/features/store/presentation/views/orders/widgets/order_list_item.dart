import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../../../core/constants/app_colors.dart';
import '../../../../../../core/localization/app_translations.dart';
import '../../../../../../core/presentation/widgets/texts/app_currency_text.dart';

class OrderListItem extends StatelessWidget {
  const OrderListItem({
    super.key,
    required this.status,
    required this.date,
    required this.orderId,
    required this.shippingDate,
    required this.itemCount,
    required this.total,
    required this.statusColor,
    this.onTap,
  });

  final String status;
  final String date;
  final String orderId;
  final String shippingDate;
  final int itemCount;
  final String total;
  final Color statusColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final mutedColor = isDark
        ? Colors.white.withValues(alpha: 0.58)
        : Colors.black.withValues(alpha: 0.54);
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final forwardIcon = Directionality.of(context) == TextDirection.rtl
        ? AppIcons.arrow_left_2
        : AppIcons.arrow_right_3;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: panelColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor),
            boxShadow: isDark
                ? null
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.035),
                      blurRadius: 14,
                      offset: const Offset(0, 7),
                    ),
                  ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: statusColor.withValues(
                        alpha: isDark ? 0.18 : 0.10,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(AppIcons.box, color: statusColor, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            _StatusChip(
                              status: status,
                              statusColor: statusColor,
                              isDark: isDark,
                            ),
                            Text(
                              orderId,
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(
                                    color: mutedColor,
                                    fontWeight: FontWeight.w800,
                                  ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 7),
                        Text(
                          date,
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(
                                color: textColor,
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                      ],
                    ),
                  ),
                  Icon(forwardIcon, size: 18, color: mutedColor),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: _OrderMeta(
                      icon: AppIcons.calendar_1,
                      label: 'Shipping Date',
                      value: shippingDate,
                      mutedColor: mutedColor,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _OrderMeta(
                      icon: AppIcons.shopping_bag,
                      label: 'Items',
                      value: context.productCount(itemCount),
                      mutedColor: mutedColor,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _OrderMeta(
                      icon: AppIcons.receipt_text,
                      label: 'Total',
                      value: total,
                      mutedColor: mutedColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.status,
    required this.statusColor,
    required this.isDark,
  });

  final String status;
  final Color statusColor;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: isDark ? 0.18 : 0.10),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        context.tr(status),
        style: TextStyle(
          color: statusColor,
          fontSize: 12,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _OrderMeta extends StatelessWidget {
  const _OrderMeta({
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
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: mutedColor),
        const SizedBox(width: 6),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr(label),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: mutedColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              AppCurrencyText(
                text: context.tr(value),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(
                  context,
                ).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w900),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
