import 'package:flutter/material.dart';
import 'package:yalla_market/core/localization/app_translations.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/formatters/app_currency.dart';
import '../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/presentation/widgets/texts/app_currency_text.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../cart/domain/entities/cart_item.dart';
import '../../../cart/presentation/cubit/cart_cubit.dart';
import '../../../personalization/domain/entities/address.dart';
import '../../../personalization/presentation/cubit/address_cubit.dart';
import '../../../personalization/presentation/cubit/address_state.dart';
import '../../../personalization/presentation/views/address/address_display_text.dart';
import '../../domain/entities/order.dart';
import '../cubit/checkout_cubit.dart';
import '../cubit/checkout_state.dart';
import '../cubit/order_history_cubit.dart';
import 'checkout/checkout_bottom_sheets.dart';

part 'checkout_review_items.dart';
part 'checkout_order_summary.dart';
part 'checkout_delivery_sections.dart';
part 'checkout_action_and_shared.dart';

class CheckoutView extends StatelessWidget {
  const CheckoutView({super.key});

  static const double _shippingFee = 5;
  static const double _taxRate = 0.10;

  double _subtotal(List<CartItemData> items) {
    return items.fold(0, (sum, item) => sum + item.price * item.quantity);
  }

  int _itemCount(List<CartItemData> items) {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CheckoutCubit, CheckoutState>(
      listenWhen: (previous, current) =>
          previous.runtimeType != current.runtimeType,
      listener: (context, state) {
        if (state is CheckoutSuccess) {
          context.read<CartCubit>().clearLocalCart();
          context.read<OrderHistoryCubit>().loadOrders();
          Navigator.pushNamed(context, AppRoutes.processingOrder);
        }

        if (state is CheckoutFailure) {
          CustomSnackBar.showError(
            context: context,
            title: 'Order confirmation failed',
            message: state.message,
          );
        }
      },
      builder: (context, checkoutState) {
        return BlocBuilder<CartCubit, List<CartItemData>>(
          builder: (context, cartItems) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            final backgroundColor = isDark
                ? AppColors.darkBackground
                : const Color(0xFFF7F8FB);
            final subtotal = _subtotal(cartItems);
            final shippingFee = cartItems.isEmpty ? 0.0 : _shippingFee;
            final taxFee = subtotal * _taxRate;
            final total = subtotal + shippingFee + taxFee;

            return BlocBuilder<AddressCubit, AddressState>(
              builder: (context, addressState) {
                final selectedAddress = addressState.selectedAddress;

                return Scaffold(
                  backgroundColor: backgroundColor,
                  body: SafeArea(
                    child: cartItems.isEmpty
                        ? Column(
                            children: [
                              const Padding(
                                padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
                                child: PageTopBar(
                                  title: 'Order Review',
                                  subtitle: 'Confirm items and payment',
                                ),
                              ),
                              Expanded(
                                child: _EmptyCheckoutState(isDark: isDark),
                              ),
                            ],
                          )
                        : SingleChildScrollView(
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const PageTopBar(
                                  title: 'Order Review',
                                  subtitle: 'Confirm items and payment',
                                ),
                                const SizedBox(height: 18),
                                _ReviewItemsSection(
                                  items: cartItems,
                                  itemCount: _itemCount(cartItems),
                                  isDark: isDark,
                                ),
                                const SizedBox(height: 14),
                                _OrderSummaryCard(
                                  subtotal: subtotal,
                                  shippingFee: shippingFee,
                                  taxFee: taxFee,
                                  total: total,
                                  isDark: isDark,
                                ),
                                const SizedBox(height: 14),
                                _PaymentMethodCard(isDark: isDark),
                                const SizedBox(height: 14),
                                _ShippingAddressCard(
                                  isDark: isDark,
                                  address: selectedAddress,
                                  isLoading:
                                      addressState is AddressLoading &&
                                      selectedAddress == null,
                                ),
                              ],
                            ),
                          ),
                  ),
                  bottomNavigationBar: cartItems.isEmpty
                      ? null
                      : _CheckoutActionBar(
                          total: total,
                          isDark: isDark,
                          isLoading: checkoutState is CheckoutLoading,
                          onCheckout: () {
                            if (selectedAddress == null) {
                              CustomSnackBar.showError(
                                context: context,
                                title: 'Shipping address required',
                                message: 'Add or select an address first.',
                              );
                              return;
                            }

                            context.read<CheckoutCubit>().createOrder(
                              shippingAddress: _shippingAddressFrom(
                                selectedAddress,
                              ),
                              items: cartItems
                                  .map(OrderItemData.fromCartItem)
                                  .toList(growable: false),
                              paymentMethod: 'cash_on_delivery',
                              shippingFee: shippingFee,
                              taxTotal: taxFee,
                            );
                          },
                        ),
                );
              },
            );
          },
        );
      },
    );
  }
}

ShippingAddressData _shippingAddressFrom(AddressData address) {
  return ShippingAddressData(
    fullName: address.name,
    phone: address.phoneNumber,
    line1: address.street,
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode,
  );
}
