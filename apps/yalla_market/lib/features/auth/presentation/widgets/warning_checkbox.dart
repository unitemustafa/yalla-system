import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';

class WarningCheckbox extends StatelessWidget {
  const WarningCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
    this.hasError = false,
  });

  final bool value;
  final ValueChanged<bool?> onChanged;
  final bool hasError;

  @override
  Widget build(BuildContext context) {
    return Checkbox(
      value: value,
      onChanged: onChanged,
      checkColor: Colors.white,
      side: BorderSide(
        color: value
            ? AppColors.primary
            : hasError
            ? AppColors.error
            : AppColors.warning,
        width: 1.8,
      ),
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return AppColors.primary;
        }

        return (hasError ? AppColors.error : AppColors.warning).withValues(
          alpha: 0.16,
        );
      }),
    );
  }
}
