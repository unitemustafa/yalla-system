import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../domain/entities/city_data.dart';
import '../cubit/location_state.dart';

enum LocationChoiceMode { automatic, manual }

class CitySelectionPanel extends StatefulWidget {
  const CitySelectionPanel({
    super.key,
    required this.state,
    required this.onCitySelected,
    required this.onUseCurrentLocation,
    this.onOpenSettings,
    this.compact = false,
    this.initialMode = LocationChoiceMode.automatic,
    this.mode,
    this.onModeChanged,
  });

  final LocationState state;
  final ValueChanged<CityData> onCitySelected;
  final VoidCallback onUseCurrentLocation;
  final VoidCallback? onOpenSettings;
  final bool compact;
  final LocationChoiceMode initialMode;
  final LocationChoiceMode? mode;
  final ValueChanged<LocationChoiceMode>? onModeChanged;

  @override
  State<CitySelectionPanel> createState() => _CitySelectionPanelState();
}

class _CitySelectionPanelState extends State<CitySelectionPanel> {
  late LocationChoiceMode _mode;

  @override
  void initState() {
    super.initState();
    _mode = widget.mode ?? widget.initialMode;
  }

  @override
  void didUpdateWidget(covariant CitySelectionPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    final newMode = widget.mode;
    if (newMode != null && newMode != _mode) {
      _mode = newMode;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDetecting = widget.state is LocationDetecting;
    final isSaving = widget.state is LocationSaving;
    final isLoading = widget.state is LocationLoading;
    final isBusy = isDetecting || isSaving || isLoading;
    final manualDisabled = isSaving || isLoading;
    final error = widget.state is LocationFailure
        ? (widget.state as LocationFailure).message
        : null;
    final selectedCity = widget.state.selectedCity;
    final manualCities = CityData.supported.toList(growable: false);

    return Column(
      mainAxisSize: widget.compact ? MainAxisSize.min : MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _LocationIntro(compact: widget.compact),
        const SizedBox(height: 18),
        _ChoiceModeSwitch(selectedMode: _mode, onChanged: _setMode),
        if (error != null && _mode == LocationChoiceMode.automatic) ...[
          const SizedBox(height: 12),
          _LocationError(message: error),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: isBusy ? null : widget.onUseCurrentLocation,
                  child: const Text('Retry'),
                ),
              ),
              if (widget.onOpenSettings != null) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: widget.onOpenSettings,
                    child: const Text('Open settings'),
                  ),
                ),
              ],
            ],
          ),
        ],
        const SizedBox(height: 18),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          child: _mode == LocationChoiceMode.automatic
              ? _AutomaticLocationPanel(
                  key: const ValueKey('automatic-location-choice'),
                  isDetecting: isDetecting,
                  isBusy: isBusy,
                  onUseCurrentLocation: widget.onUseCurrentLocation,
                )
              : Column(
                  key: const ValueKey('manual-location-choice'),
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      context.tr('Change region manually'),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ...manualCities.map(
                      (city) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: _CityTile(
                          city: city,
                          selected: selectedCity?.slug == city.slug,
                          disabled: manualDisabled,
                          onTap: () => _selectSupportedCity(city),
                        ),
                      ),
                    ),
                    if (manualCities.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Text(
                          'No supported cities are available. Retry after checking your connection.',
                        ),
                      ),
                  ],
                ),
        ),
      ],
    );
  }

  void _setMode(LocationChoiceMode mode) {
    if (widget.mode == null) {
      setState(() {
        _mode = mode;
      });
    }
    widget.onModeChanged?.call(mode);
  }

  void _selectSupportedCity(CityData city) {
    widget.onCitySelected(city);
  }
}

class _ChoiceModeSwitch extends StatelessWidget {
  const _ChoiceModeSwitch({
    required this.selectedMode,
    required this.onChanged,
  });

  final LocationChoiceMode selectedMode;
  final ValueChanged<LocationChoiceMode> onChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardColor : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ChoiceModeButton(
              label: 'Automatic',
              icon: AppIcons.routing,
              selected: selectedMode == LocationChoiceMode.automatic,
              onTap: () => onChanged(LocationChoiceMode.automatic),
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: _ChoiceModeButton(
              label: 'Manual',
              icon: AppIcons.edit,
              selected: selectedMode == LocationChoiceMode.manual,
              onTap: () => onChanged(LocationChoiceMode.manual),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChoiceModeButton extends StatelessWidget {
  const _ChoiceModeButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final foreground = selected
        ? Colors.white
        : isDark
        ? AppColors.darkTextPrimary
        : AppColors.lightTextPrimary;

    return Material(
      color: selected ? AppColors.primary : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          height: 44,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: foreground),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  context.tr(label),
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: foreground,
                    fontWeight: FontWeight.w900,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AutomaticLocationPanel extends StatelessWidget {
  const _AutomaticLocationPanel({
    super.key,
    required this.isDetecting,
    required this.isBusy,
    required this.onUseCurrentLocation,
  });

  final bool isDetecting;
  final bool isBusy;
  final VoidCallback onUseCurrentLocation;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          context.tr('Automatic location'),
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 6),
        Text(
          context.tr('GPS can try to detect your area automatically.'),
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: mutedColor,
            height: 1.4,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        AppActionButton(
          label: isDetecting ? 'Detecting location...' : 'Use GPS location',
          icon: AppIcons.location,
          isLoading: isDetecting,
          onPressed: isBusy ? null : onUseCurrentLocation,
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
              if (city.isGeneral) ...[
                const SizedBox(width: 8),
                _RegionBadge(label: context.tr('General')),
              ],
              const Icon(AppIcons.arrow_right_3, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}

class _RegionBadge extends StatelessWidget {
  const _RegionBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: isDark ? 0.18 : 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: AppColors.warning,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
