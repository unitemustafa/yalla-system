import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import 'package:yalla_market/core/localization/app_translations.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../domain/entities/address.dart';
import '../../cubit/address_cubit.dart';
import '../../cubit/address_state.dart';
import 'address_display_text.dart';
import 'add_new_address_view.dart';
import 'widgets/single_address.dart';

class AddressesView extends StatelessWidget {
  const AddressesView({super.key});

  Future<void> _openAddressForm(
    BuildContext context, {
    AddressData? address,
  }) async {
    final result = await Navigator.push<AddressData>(
      context,
      MaterialPageRoute(builder: (_) => AddNewAddressView(address: address)),
    );

    if (result == null || !context.mounted) return;

    final saved = await context.read<AddressCubit>().saveAddress(result);
    if (!saved || !context.mounted) return;

    CustomSnackBar.showSuccess(
      context: context,
      title: address == null ? 'Address saved' : 'Address updated',
      message: result.name,
    );
  }

  Future<void> _deleteAddress(BuildContext context, AddressData address) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          title: Text(
            context.tr('Delete address?'),
            textAlign: TextAlign.center,
          ),
          content: Text(
            context.tr(
              'Remove ${address.name} from your saved delivery locations?',
            ),
            textAlign: TextAlign.center,
          ),
          actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          actions: [
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: Text(context.tr('Cancel')),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.error,
                    ),
                    child: Text(
                      context.tr('Delete'),
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );

    if (confirmed != true || !context.mounted) return;

    final deleted = await context.read<AddressCubit>().deleteAddress(
      address.id,
    );
    if (!deleted || !context.mounted) return;

    CustomSnackBar.showRemoved(
      context: context,
      title: 'Address deleted',
      message: address.name,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return BlocConsumer<AddressCubit, AddressState>(
      listenWhen: (previous, current) =>
          current is AddressFailure &&
          (previous is! AddressFailure || previous.message != current.message),
      listener: (context, state) {
        if (state is AddressFailure) {
          CustomSnackBar.showError(
            context: context,
            title: 'Address update failed',
            message: state.message,
          );
        }
      },
      builder: (context, state) {
        final addresses = state.addresses;
        final selectedAddressId = state.selectedAddressId;
        final isInitialLoading = state is AddressLoading && addresses.isEmpty;

        return Scaffold(
          backgroundColor: backgroundColor,
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => _openAddressForm(context),
            backgroundColor: AppColors.primary,
            icon: const Icon(AppIcons.add, color: Colors.white),
            label: Text(
              context.tr('Add'),
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          body: SafeArea(
            child: isInitialLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16.0, 12.0, 16.0, 90.0),
                    itemCount: addresses.length + 2,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return const PageTopBar(
                          title: 'Addresses',
                          subtitle: 'Choose where orders should arrive',
                        );
                      }

                      if (index == 1) {
                        return _AddressSummaryCard(
                          isDark: isDark,
                          totalCount: addresses.length,
                          selectedName: state.selectedAddress?.name,
                        );
                      }

                      final address = addresses[index - 2];

                      return SingleAddress(
                        selectedAddress: selectedAddressId == address.id,
                        name: address.name,
                        phoneNumber: address.phoneNumber,
                        address: localizedAddressText(context, address),
                        onTap: () => context.read<AddressCubit>().selectAddress(
                          address.id,
                        ),
                        onEdit: () =>
                            _openAddressForm(context, address: address),
                        onDelete: () => _deleteAddress(context, address),
                      );
                    },
                  ),
          ),
        );
      },
    );
  }
}

class _AddressSummaryCard extends StatelessWidget {
  const _AddressSummaryCard({
    required this.isDark,
    required this.totalCount,
    required this.selectedName,
  });

  final bool isDark;
  final int totalCount;
  final String? selectedName;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF25273A) : const Color(0xFFEAF2FF),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.14)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(AppIcons.location, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.savedLocations(totalCount),
                  style: Theme.of(
                    context,
                  ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 2),
                Text(
                  context.tr(
                    selectedName == null
                        ? 'Add an address to start checkout faster.'
                        : '$selectedName is selected for checkout.',
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.lightTextSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
