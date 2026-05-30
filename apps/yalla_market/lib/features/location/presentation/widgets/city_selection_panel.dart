import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../domain/entities/city_data.dart';
import '../cubit/location_state.dart';

class CitySelectionPanel extends StatelessWidget {
  const CitySelectionPanel({
    super.key,
    required this.state,
    required this.onCitySelected,
    required this.onUseCurrentLocation,
    this.compact = false,
  });

  final LocationState state;
  final ValueChanged<CityData> onCitySelected;
  final VoidCallback onUseCurrentLocation;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final isDetecting = state is LocationDetecting;
    final isSaving = state is LocationSaving;
    final isBusy = isDetecting || isSaving || state is LocationLoading;
    final error = state is LocationFailure
        ? (state as LocationFailure).message
        : null;

    return Column(
      mainAxisSize: compact ? MainAxisSize.min : MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _LocationIntro(compact: compact),
        const SizedBox(height: 18),
        AppActionButton(
          label: isDetecting
              ? 'Detecting your location...'
              : 'Use my current location',
          icon: AppIcons.routing,
          isLoading: isDetecting,
          onPressed: isBusy ? null : onUseCurrentLocation,
          variant: AppActionButtonVariant.outlined,
        ),
        if (error != null) ...[
          const SizedBox(height: 12),
          _LocationError(message: error),
        ],
        const SizedBox(height: 20),
        Text(
          context.tr('Choose manually'),
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 10),
        ...CityData.supported.map(
          (city) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _CityTile(
              city: city,
              selected: state.selectedCity?.slug == city.slug,
              disabled: isBusy,
              onTap: () => onCitySelected(city),
            ),
          ),
        ),
      ],
    );
  }
}

class _LocationIntro extends StatelessWidget {
  const _LocationIntro({required this.compact});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: compact ? 48 : 58,
          height: compact ? 48 : 58,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            AppIcons.location,
            color: AppColors.primary,
            size: 28,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.tr('Choose your city'),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontSize: compact ? 21 : 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                context.tr('So we can show products available in your area.'),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: mutedColor,
                  height: 1.42,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _LocationError extends StatelessWidget {
  const _LocationError({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: isDark ? 0.18 : 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.20)),
      ),
      child: Row(
        children: [
          const Icon(AppIcons.warning_2, color: AppColors.error, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              context.tr(message),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.error,
                height: 1.35,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CityTile extends StatelessWidget {
  const _CityTile({
    required this.city,
    required this.selected,
    required this.disabled,
    required this.onTap,
  });

  final CityData city;
  final bool selected;
  final bool disabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = selected
        ? AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.10)
        : isDark
        ? AppColors.darkCardColor
        : Colors.white;
    final borderColor = selected
        ? AppColors.primary.withValues(alpha: 0.42)
        : isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);
    final textColor = selected
        ? AppColors.primary
        : isDark
        ? Colors.white
        : AppColors.lightTextPrimary;

    return Material(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: disabled ? null : onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Icon(
                selected ? AppIcons.tick_circle5 : AppIcons.location,
                color: selected ? AppColors.primary : textColor,
                size: 21,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  context.tr(city.name),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(AppIcons.arrow_right_3, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
