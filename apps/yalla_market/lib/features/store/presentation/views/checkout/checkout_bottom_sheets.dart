import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import 'package:yalla_market/core/localization/app_translations.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../personalization/domain/entities/address.dart';
import '../../../../personalization/presentation/cubit/address_cubit.dart';
import '../../../../personalization/presentation/cubit/address_state.dart';
import '../../../../personalization/presentation/views/address/address_display_text.dart';
import '../../../../personalization/presentation/views/address/add_new_address_view.dart';
import '../../../../personalization/presentation/views/address/widgets/single_address.dart';

void showPaymentMethodSheet(BuildContext context, bool isDark) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (context) {
      return Container(
        padding: const EdgeInsets.all(16),
        height: MediaQuery.of(context).size.height * 0.55,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[700] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              context.tr('Select Payment Method'),
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                children: [
                  _PaymentTile(
                    name: 'Cash on Delivery',
                    subtitle: 'Pay when your order arrives',
                    icon: AppIcons.money_3,
                    isDark: isDark,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    },
  );
}

void showShippingAddressSheet(BuildContext context, bool isDark) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (sheetContext) {
      return _CheckoutAddressesSheet(isDark: isDark, parentContext: context);
    },
  );
}

class _PaymentTile extends StatelessWidget {
  const _PaymentTile({
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.isDark,
  });

  final String name;
  final String subtitle;
  final IconData icon;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 60,
        height: 40,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.primary, size: 22),
      ),
      title: Text(
        context.tr(name),
        style: Theme.of(
          context,
        ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
      ),
      subtitle: Text(
        context.tr(subtitle),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: isDark ? Colors.white60 : Colors.black54,
          fontWeight: FontWeight.w600,
        ),
      ),
      trailing: Icon(AppIcons.tick_circle, size: 18, color: AppColors.primary),
      onTap: () => Navigator.pop(context),
    );
  }
}

class _CheckoutAddressesSheet extends StatelessWidget {
  const _CheckoutAddressesSheet({
    required this.isDark,
    required this.parentContext,
  });

  final bool isDark;
  final BuildContext parentContext;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      height: MediaQuery.of(context).size.height * 0.65,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[700] : Colors.grey[300],
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            context.tr('Select Address'),
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: BlocBuilder<AddressCubit, AddressState>(
              builder: (context, state) {
                if (state is AddressLoading && state.addresses.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state.addresses.isEmpty) {
                  return Center(
                    child: Text(
                      context.tr('Add an address to start checkout faster.'),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: isDark ? Colors.white60 : Colors.black54,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  itemCount: state.addresses.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final address = state.addresses[index];
                    return SingleAddress(
                      selectedAddress: state.selectedAddressId == address.id,
                      name: address.name,
                      phoneNumber: address.phoneNumber,
                      address: localizedAddressText(context, address),
                      onTap: () async {
                        await context.read<AddressCubit>().selectAddress(
                          address.id,
                        );
                        if (context.mounted) Navigator.pop(context);
                      },
                    );
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: () => _openAddressFormFromCheckout(
                parentContext: parentContext,
                sheetContext: context,
              ),
              child: Text(
                context.tr('Add new address'),
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

Future<void> _openAddressFormFromCheckout({
  required BuildContext parentContext,
  required BuildContext sheetContext,
}) async {
  Navigator.of(sheetContext).pop();
  final result = await Navigator.of(parentContext).push<AddressData>(
    MaterialPageRoute(builder: (_) => const AddNewAddressView()),
  );

  if (result == null || !parentContext.mounted) return;
  await parentContext.read<AddressCubit>().saveAddress(result);
}
