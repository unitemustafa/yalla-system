import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';

class ProfileMenuTile extends StatelessWidget {
  const ProfileMenuTile({
    super.key,
    required this.title,
    required this.value,
    this.icon = AppIcons.arrow_right_34,
    this.leadingIcon,
    this.onTap,
    this.isDestructive = false,
    this.showTrailingIcon = true,
  });

  final String title, value;
  final IconData icon;
  final IconData? leadingIcon;
  final VoidCallback? onTap;
  final bool isDestructive;
  final bool showTrailingIcon;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = isDestructive ? AppColors.error : AppColors.primary;
    final textColor = isDestructive
        ? AppColors.error
        : (isDark ? Colors.white : AppColors.lightTextPrimary);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final effectiveIcon =
        icon == AppIcons.arrow_right_34 || icon == AppIcons.arrow_right_3
        ? (Directionality.of(context) == TextDirection.rtl
              ? AppIcons.arrow_left_2
              : AppIcons.arrow_right_3)
        : icon;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Row(
            children: [
              if (leadingIcon != null) ...[
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: isDark ? 0.18 : 0.10),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(leadingIcon, size: 21, color: accentColor),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                flex: 4,
                child: Text(
                  context.tr(title),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: mutedColor,
                    fontWeight: FontWeight.w700,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                flex: 6,
                child: Text(
                  context.tr(value),
                  textAlign: TextAlign.end,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w800,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (showTrailingIcon) ...[
                const SizedBox(width: 10),
                Icon(effectiveIcon, size: 18, color: mutedColor),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
