import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';

class PasswordStrengthMeter extends StatelessWidget {
  const PasswordStrengthMeter({super.key, required this.controller});

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return ValueListenableBuilder<TextEditingValue>(
      valueListenable: controller,
      builder: (context, value, _) {
        final password = value.text;
        final requirements = _requirementsFor(context, password);

        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final requirement in requirements)
                _PasswordRequirementRow(
                  label: requirement.label,
                  isMet: requirement.isMet,
                  isDark: isDark,
                ),
            ],
          ),
        );
      },
    );
  }

  List<_PasswordRequirement> _requirementsFor(
    BuildContext context,
    String password,
  ) {
    final isArabic = context.isArabicLanguage;

    return [
      _PasswordRequirement(
        label: isArabic ? '8 حروف على الأقل' : 'At least 8 characters',
        isMet: password.length >= 8,
      ),
      _PasswordRequirement(
        label: isArabic ? 'حرف كبير وصغير' : 'Uppercase and lowercase letters',
        isMet:
            RegExp(r'[A-Z]').hasMatch(password) &&
            RegExp(r'[a-z]').hasMatch(password),
      ),
      _PasswordRequirement(
        label: isArabic ? 'رقم ورمز خاص' : 'Number and special character',
        isMet:
            RegExp(r'\d').hasMatch(password) &&
            RegExp(r'[^A-Za-z0-9]').hasMatch(password),
      ),
    ];
  }
}

class _PasswordRequirement {
  const _PasswordRequirement({required this.label, required this.isMet});

  final String label;
  final bool isMet;
}

class _PasswordRequirementRow extends StatelessWidget {
  const _PasswordRequirementRow({
    required this.label,
    required this.isMet,
    required this.isDark,
  });

  final String label;
  final bool isMet;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final inactiveColor = isDark
        ? Colors.white.withValues(alpha: 0.42)
        : Colors.black.withValues(alpha: 0.44);
    final color = isMet ? AppColors.success : inactiveColor;

    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: Row(
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 160),
            child: Icon(
              isMet ? AppIcons.tick_circle : AppIcons.record_circle,
              key: ValueKey(isMet),
              size: 17,
              color: color,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: color,
                fontSize: 12,
                height: 1.25,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
