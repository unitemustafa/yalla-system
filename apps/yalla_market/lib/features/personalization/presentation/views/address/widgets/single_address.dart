import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../../../core/constants/app_colors.dart';
import '../../../../../../core/localization/app_translations.dart';

class SingleAddress extends StatelessWidget {
  const SingleAddress({
    super.key,
    required this.selectedAddress,
    required this.name,
    required this.phoneNumber,
    required this.address,
    this.onTap,
    this.onEdit,
    this.onDelete,
  });

  final bool selectedAddress;
  final String name;
  final String phoneNumber;
  final String address;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? Colors.white.withValues(alpha: 0.58)
        : Colors.black.withValues(alpha: 0.56);
    final cardColor = selectedAddress
        ? AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.11)
        : isDark
        ? AppColors.darkCardColor
        : Colors.white;
    final borderColor = selectedAddress
        ? AppColors.primary.withValues(alpha: isDark ? 0.50 : 0.28)
        : isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardColor,
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _AddressAvatar(name: name, isSelected: selectedAddress),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(
                                      color: textColor,
                                      fontWeight: FontWeight.w900,
                                    ),
                              ),
                            ),
                            AnimatedScale(
                              duration: const Duration(milliseconds: 180),
                              scale: selectedAddress ? 1 : 0.82,
                              child: Icon(
                                selectedAddress
                                    ? AppIcons.tick_circle5
                                    : AppIcons.tick_circle,
                                color: selectedAddress
                                    ? AppColors.primary
                                    : mutedColor.withValues(alpha: 0.46),
                                size: 20,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(AppIcons.call, size: 15, color: mutedColor),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                phoneNumber,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(
                                      color: mutedColor,
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                address,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: mutedColor,
                  height: 1.35,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _AddressActionButton(
                    icon: AppIcons.edit_2,
                    label: 'Edit',
                    color: AppColors.primary,
                    onTap: onEdit,
                  ),
                  const SizedBox(width: 10),
                  _AddressActionButton(
                    icon: AppIcons.trash,
                    label: 'Delete',
                    color: AppColors.error,
                    onTap: onDelete,
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

class _AddressAvatar extends StatelessWidget {
  const _AddressAvatar({required this.name, required this.isSelected});

  final String name;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final initial = name.trim().isEmpty ? 'A' : name.trim().substring(0, 1);

    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: isSelected ? 0.18 : 0.09),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Text(
          initial.toUpperCase(),
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _AddressActionButton extends StatelessWidget {
  const _AddressActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Material(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            height: 36,
            alignment: Alignment.center,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 16, color: color),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    context.tr(label),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: color,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
