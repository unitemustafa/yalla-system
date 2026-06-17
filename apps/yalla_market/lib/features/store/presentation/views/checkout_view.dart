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
import '../../../../core/utils/validators.dart';
import '../../../cart/domain/entities/cart_item.dart';
import '../../../cart/presentation/cubit/cart_cubit.dart';
import '../../../location/domain/entities/city_data.dart';
import '../../../personalization/domain/entities/address.dart';
import '../../domain/entities/order.dart';
import '../cubit/checkout_cubit.dart';
import '../cubit/checkout_state.dart';
import '../cubit/order_history_cubit.dart';
import 'checkout/checkout_bottom_sheets.dart';

part 'checkout_review_items.dart';
part 'checkout_order_summary.dart';
part 'checkout_delivery_sections.dart';
part 'checkout_action_and_shared.dart';

class CheckoutView extends StatefulWidget {
  const CheckoutView({super.key});

  @override
  State<CheckoutView> createState() => _CheckoutViewState();
}

class _CheckoutViewState extends State<CheckoutView> {
  static const double _shippingFee = 5;

  final _addressFormKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _streetController = TextEditingController();
  final _manualCityController = TextEditingController();

  CityData? _selectedCity;
  bool _isManualCity = false;
  bool _isAddressExpanded = true;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    _manualCityController.dispose();
    super.dispose();
  }

  double _subtotal(List<CartItemData> items) {
    return items.fold(0, (sum, item) => sum + item.price * item.quantity);
  }

  int _itemCount(List<CartItemData> items) {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  bool get _hasFixedShippingCity => !_isManualCity && _selectedCity != null;

  String get _cityName {
    if (_isManualCity) return _manualCityController.text.trim();
    return _selectedCity?.name.trim() ?? '';
  }

  AddressData _addressFromForm() {
    return AddressData(
      id: '',
      name: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      street: _streetController.text.trim(),
      postalCode: '',
      city: _cityName,
      state: '',
      country: 'Egypt',
    );
  }

  String? _requiredField(String? value) {
    if (value == null || value.trim().isEmpty) {
      return context.tr('This field is required');
    }
    return null;
  }

  String? _validatePhone(String? value) {
    return Validators.egyptianMobile(value);
  }

  String? _validateCitySelection(String? value) {
    if (_isManualCity) return null;
    if (_selectedCity == null) return context.tr('City name is required');
    return null;
  }

  String _shippingFeeLabel(double shippingFee) {
    if (!_hasFixedShippingCity) return _notSpecifiedLabel(context);
    return _formatMoney(shippingFee);
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
            final shippingFee = cartItems.isEmpty || !_hasFixedShippingCity
                ? 0.0
                : _shippingFee;
            final total = subtotal + shippingFee;
            final deliveryNote = _isManualCity ? _deliveryNote(context) : null;

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
                          Expanded(child: _EmptyCheckoutState(isDark: isDark)),
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
                              shippingFeeLabel: _shippingFeeLabel(shippingFee),
                              isShippingFeeFixed: _hasFixedShippingCity,
                              total: total,
                              isDark: isDark,
                            ),
                            const SizedBox(height: 14),
                            _PaymentMethodCard(isDark: isDark),
                            const SizedBox(height: 14),
                            _ShippingAddressCard(
                              isDark: isDark,
                              formKey: _addressFormKey,
                              nameController: _nameController,
                              phoneController: _phoneController,
                              streetController: _streetController,
                              manualCityController: _manualCityController,
                              selectedCity: _selectedCity,
                              isManualCity: _isManualCity,
                              isExpanded: _isAddressExpanded,
                              requiredValidator: _requiredField,
                              phoneValidator: _validatePhone,
                              cityValidator: _validateCitySelection,
                              onToggleExpanded: () {
                                setState(() {
                                  _isAddressExpanded = !_isAddressExpanded;
                                });
                              },
                              onCityChanged: (value) {
                                setState(() {
                                  _isManualCity = value == _manualCityOption;
                                  _selectedCity = _isManualCity
                                      ? null
                                      : CityData.fromSlug(value);
                                  if (!_isManualCity) {
                                    _manualCityController.clear();
                                  }
                                });
                              },
                            ),
                          ],
                        ),
                      ),
              ),
              bottomNavigationBar: cartItems.isEmpty
                  ? null
                  : _CheckoutActionBar(
                      total: total,
                      deliveryNote: deliveryNote,
                      isDark: isDark,
                      isLoading: checkoutState is CheckoutLoading,
                      onCheckout: () {
                        if (!(_addressFormKey.currentState?.validate() ??
                            false)) {
                          CustomSnackBar.showError(
                            context: context,
                            title: 'Shipping address required',
                            message: 'Complete the delivery address first.',
                          );
                          return;
                        }

                        final selectedAddress = _addressFromForm();
                        final checkoutProblems = _checkoutRegionProblems(
                          address: selectedAddress,
                          items: cartItems,
                          allowCustomDeliveryCity: _isManualCity,
                        );
                        if (checkoutProblems.isNotEmpty) {
                          CustomSnackBar.showError(
                            context: context,
                            title: 'Cannot complete order',
                            message:
                                'Cannot complete order because:\n\n${checkoutProblems.join('\n')}',
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
                          taxTotal: 0.0,
                        );
                      },
                    ),
            );
          },
        );
      },
    );
  }
}

String _notSpecifiedLabel(BuildContext context) {
  return context.isArabicLanguage ? 'غير محدد' : 'Not specified';
}

String _deliveryNote(BuildContext context) {
  return context.isArabicLanguage ? '+ دليفيري' : '+ delivery';
}

List<String> _checkoutRegionProblems({
  required AddressData address,
  required List<CartItemData> items,
  bool allowCustomDeliveryCity = false,
}) {
  if (allowCustomDeliveryCity) return const [];

  final deliveryRegion = _regionFromAddress(address);
  final deliverySlug = deliveryRegion.slug;
  final problems = <String>[];

  for (final item in items) {
    if (item.isAvailableForRegion(deliverySlug)) continue;

    if (item.isOffer) {
      final allowedRegion = item.regionNames.isNotEmpty
          ? item.regionNames.join(', ')
          : item.regionSlugs.join(', ');
      if (allowedRegion.trim().isNotEmpty) {
        problems.add(
          'This offer is available only in $allowedRegion and cannot be applied to the selected address.',
        );
      } else {
        problems.add(
          'This offer is not available for the selected delivery area.',
        );
      }
    } else {
      problems.add(
        'This product is not available for the selected delivery area.',
      );
    }
  }

  return problems;
}

CityData _regionFromAddress(AddressData address) {
  final parts = [
    address.city,
    address.state,
    address.street,
    address.country,
  ].where((part) => part.trim().isNotEmpty).join(' ');

  return CityData.fromName(parts) ?? CityData.general;
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
