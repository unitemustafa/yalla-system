import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import 'package:yalla_market/core/localization/app_translations.dart';

import '../../../../../core/constants/app_colors.dart';

void showPaymentMethodSheet(BuildContext context, bool isDark) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (context) {
      return Container(
        padding: const EdgeInsets.all(16),
        height: MediaQuery.of(context).size.height * 0.55,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[700] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              context.tr('Select Payment Method'),
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                children: [
                  _PaymentTile(
                    name: 'Cash on Delivery',
                    subtitle: 'Pay when your order arrives',
                    icon: AppIcons.money_3,
                    isDark: isDark,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    },
  );
}

class _PaymentTile extends StatelessWidget {
  const _PaymentTile({
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.isDark,
  });

  final String name;
  final String subtitle;
  final IconData icon;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 60,
        height: 40,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.primary, size: 22),
      ),
      title: Text(
        context.tr(name),
        style: Theme.of(
          context,
        ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
      ),
      subtitle: Text(
        context.tr(subtitle),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: isDark ? Colors.white60 : Colors.black54,
          fontWeight: FontWeight.w600,
        ),
      ),
      trailing: Icon(AppIcons.tick_circle, size: 18, color: AppColors.primary),
      onTap: () => Navigator.pop(context),
    );
  }
}
