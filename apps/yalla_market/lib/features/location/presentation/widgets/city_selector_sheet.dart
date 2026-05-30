import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../domain/entities/city_data.dart';
import '../cubit/location_cubit.dart';
import '../cubit/location_state.dart';
import 'city_selection_panel.dart';

class CitySelectorSheet {
  const CitySelectorSheet._();

  static Future<void> show(
    BuildContext context, {
    Future<void> Function()? onCityChanged,
  }) {
    final locationCubit = context.read<LocationCubit>();

    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return BlocProvider.value(
          value: locationCubit,
          child: _CitySelectorSheetContent(onCityChanged: onCityChanged),
        );
      },
    );
  }
}

class _CitySelectorSheetContent extends StatelessWidget {
  const _CitySelectorSheetContent({this.onCityChanged});

  final Future<void> Function()? onCityChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bottomPadding = MediaQuery.viewInsetsOf(context).bottom;

    return Container(
      margin: const EdgeInsets.all(10),
      padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + bottomPadding),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackground : const Color(0xFFF7F8FB),
        borderRadius: BorderRadius.circular(8),
      ),
      child: SingleChildScrollView(
        child: BlocBuilder<LocationCubit, LocationState>(
          builder: (context, state) {
            return CitySelectionPanel(
              state: state,
              compact: true,
              onCitySelected: (city) => _selectCity(context, city),
              onUseCurrentLocation: () => _useCurrentLocation(context),
            );
          },
        ),
      ),
    );
  }

  Future<void> _selectCity(BuildContext context, CityData city) async {
    final selectedCity = await context.read<LocationCubit>().selectCity(city);
    if (!context.mounted || selectedCity == null) return;

    await onCityChanged?.call();
    if (!context.mounted) return;

    CustomSnackBar.showSuccess(
      context: context,
      title: 'City saved',
      message: 'Products will refresh for your selected city.',
    );
    Navigator.pop(context);
  }

  Future<void> _useCurrentLocation(BuildContext context) async {
    final selectedCity = await context
        .read<LocationCubit>()
        .useCurrentLocation();
    if (!context.mounted || selectedCity == null) return;

    await onCityChanged?.call();
    if (!context.mounted) return;

    CustomSnackBar.showSuccess(
      context: context,
      title: 'City saved',
      message: 'Products will refresh for your selected city.',
    );
    Navigator.pop(context);
  }
}
