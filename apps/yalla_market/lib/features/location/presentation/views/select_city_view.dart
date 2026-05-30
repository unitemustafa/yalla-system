import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../store/presentation/cubit/product_catalog_cubit.dart';
import '../../../store/presentation/cubit/product_discovery_cubit.dart';
import '../../domain/entities/city_data.dart';
import '../cubit/location_cubit.dart';
import '../cubit/location_state.dart';
import '../widgets/city_selection_panel.dart';

class SelectCityView extends StatelessWidget {
  const SelectCityView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final maxWidth = constraints.maxWidth >= 640
                ? 480.0
                : constraints.maxWidth;

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: maxWidth),
                  child: BlocBuilder<LocationCubit, LocationState>(
                    builder: (context, state) {
                      return CitySelectionPanel(
                        state: state,
                        onCitySelected: (city) => _selectCity(context, city),
                        onUseCurrentLocation: () =>
                            _useCurrentLocation(context),
                      );
                    },
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Future<void> _selectCity(BuildContext context, CityData city) async {
    final selectedCity = await context.read<LocationCubit>().selectCity(city);
    if (!context.mounted || selectedCity == null) return;
    await _finishSelection(context);
  }

  Future<void> _useCurrentLocation(BuildContext context) async {
    final selectedCity = await context
        .read<LocationCubit>()
        .useCurrentLocation();
    if (!context.mounted || selectedCity == null) return;
    await _finishSelection(context);
  }

  Future<void> _finishSelection(BuildContext context) async {
    await context.read<ProductCatalogCubit>().loadProducts(force: true);
    if (!context.mounted) return;
    await context.read<ProductDiscoveryCubit>().loadDiscovery(force: true);
    if (!context.mounted) return;

    CustomSnackBar.showSuccess(
      context: context,
      title: 'City saved',
      message: 'Products will refresh for your selected city.',
    );
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.navigationMenu,
      (route) => false,
    );
  }
}
