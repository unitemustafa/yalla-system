import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../domain/entities/city_data.dart';
import '../cubit/location_state.dart';

class CitySelectionPanel extends StatefulWidget {
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
  State<CitySelectionPanel> createState() => _CitySelectionPanelState();
}

class _CitySelectionPanelState extends State<CitySelectionPanel> {
  late final TextEditingController _customCityController;
  bool _isOtherExpanded = false;
  String? _customCityError;

  @override
  void initState() {
    super.initState();
    final selectedCity = widget.state.selectedCity;
    final selectedCustomCity =
        selectedCity != null && !CityData.isSupportedSlug(selectedCity.slug);

    _isOtherExpanded = selectedCustomCity;
    _customCityController = TextEditingController(
      text: selectedCustomCity ? selectedCity.name : '',
    );
  }

  @override
  void didUpdateWidget(covariant CitySelectionPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    final selectedCity = widget.state.selectedCity;
    final selectedCustomCity =
        selectedCity != null && !CityData.isSupportedSlug(selectedCity.slug);

    if (selectedCustomCity && oldWidget.state.selectedCity != selectedCity) {
      _isOtherExpanded = true;
      _customCityController.text = selectedCity.name;
    }
  }

  @override
  void dispose() {
    _customCityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDetecting = widget.state is LocationDetecting;
    final isSaving = widget.state is LocationSaving;
    final isBusy = isDetecting || isSaving || widget.state is LocationLoading;
    final error = widget.state is LocationFailure
        ? (widget.state as LocationFailure).message
        : null;
    final selectedCity = widget.state.selectedCity;
    final selectedCustomCity =
        selectedCity != null && !CityData.isSupportedSlug(selectedCity.slug);

    return Column(
      mainAxisSize: widget.compact ? MainAxisSize.min : MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _LocationIntro(compact: widget.compact),
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
              selected: selectedCity?.slug == city.slug,
              disabled: isBusy,
              onTap: () => _selectSupportedCity(city),
            ),
          ),
        ),
        _CityTile(
          city: const CityData(name: 'Other', slug: 'other'),
          selected: selectedCustomCity || _isOtherExpanded,
          disabled: isBusy,
          onTap: _showOtherCity,
        ),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          child: _isOtherExpanded
              ? Padding(
                  key: const ValueKey('custom-city-section'),
                  padding: const EdgeInsets.only(top: 10),
                  child: _CustomCitySection(
                    controller: _customCityController,
                    errorText: _customCityError,
                    enabled: !isBusy,
                    isDetecting: isDetecting,
                    isSaving: isSaving,
                    onSave: _saveCustomCity,
                    onUseCurrentLocation: widget.onUseCurrentLocation,
                  ),
                )
              : const SizedBox.shrink(key: ValueKey('custom-city-empty')),
        ),
      ],
    );
  }

  void _selectSupportedCity(CityData city) {
    setState(() {
      _isOtherExpanded = false;
      _customCityError = null;
    });
    widget.onCitySelected(city);
  }

  void _showOtherCity() {
    setState(() {
      _isOtherExpanded = true;
      _customCityError = null;
    });
  }

  void _saveCustomCity() {
    final city = CityData.fromCustomName(_customCityController.text);
    if (city == null) {
      setState(() => _customCityError = 'City name is required');
      return;
    }

    setState(() => _customCityError = null);
    widget.onCitySelected(city);
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

class _CustomCitySection extends StatelessWidget {
  const _CustomCitySection({
    required this.controller,
    required this.errorText,
    required this.enabled,
    required this.isDetecting,
    required this.isSaving,
    required this.onSave,
    required this.onUseCurrentLocation,
  });

  final TextEditingController controller;
  final String? errorText;
  final bool enabled;
  final bool isDetecting;
  final bool isSaving;
  final VoidCallback onSave;
  final VoidCallback onUseCurrentLocation;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.10)
        : Colors.black.withValues(alpha: 0.08);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          enabled: enabled,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) {
            if (enabled) onSave();
          },
          decoration: InputDecoration(
            labelText: context.tr('Enter your city'),
            errorText: errorText == null ? null : context.tr(errorText!),
            filled: true,
            fillColor: fillColor,
            prefixIcon: const Icon(AppIcons.location_add, size: 20),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(height: 10),
        AppActionButton(
          label: 'Save city',
          icon: AppIcons.tick_circle,
          isLoading: isSaving,
          onPressed: enabled ? onSave : null,
        ),
        const SizedBox(height: 10),
        AppActionButton(
          label: isDetecting
              ? 'Detecting your location...'
              : 'Use my current location',
          icon: AppIcons.routing,
          isLoading: isDetecting,
          onPressed: enabled ? onUseCurrentLocation : null,
          variant: AppActionButtonVariant.outlined,
        ),
      ],
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
