import 'package:flutter/material.dart';
import 'package:yalla_market/core/localization/app_translations.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../../core/utils/validators.dart';
import 'address_entry.dart';

class AddNewAddressView extends StatefulWidget {
  const AddNewAddressView({super.key, this.address});

  final AddressEntry? address;

  @override
  State<AddNewAddressView> createState() => _AddNewAddressViewState();
}

class _AddNewAddressViewState extends State<AddNewAddressView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _streetController;
  late final TextEditingController _cityController;
  late final TextEditingController _stateController;
  late final TextEditingController _countryController;

  bool get _isEditing => widget.address != null;

  @override
  void initState() {
    super.initState();
    final address = widget.address;

    _nameController = TextEditingController(text: address?.name ?? '');
    _phoneController = TextEditingController(text: address?.phoneNumber ?? '');
    _streetController = TextEditingController(text: address?.street ?? '');
    _cityController = TextEditingController(text: address?.city ?? '');
    _stateController = TextEditingController(text: address?.state ?? '');
    _countryController = TextEditingController(text: address?.country ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  void _saveAddress() {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final existingAddress = widget.address;
    final address = AddressEntry(
      id: existingAddress?.id ?? '',
      name: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      street: _streetController.text.trim(),
      postalCode: existingAddress?.postalCode ?? '',
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      country: _countryController.text.trim(),
    );

    Navigator.pop(context, address);
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
            final maxWidth = constraints.maxWidth >= 760
                ? 640.0
                : constraints.maxWidth;

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: maxWidth),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        PageTopBar(
                          title: _isEditing ? 'Edit Address' : 'Add Address',
                          subtitle: _isEditing
                              ? 'Update this delivery location'
                              : 'Save a delivery location',
                        ),
                        const SizedBox(height: 18),
                        _AddressHero(isDark: isDark, isEditing: _isEditing),
                        const SizedBox(height: 18),
                        _AddressFormCard(
                          isDark: isDark,
                          children: [
                            _AddressTextField(
                              controller: _nameController,
                              icon: AppIcons.user,
                              label: 'Name',
                              validator: _requiredField,
                              textInputAction: TextInputAction.next,
                            ),
                            _AddressTextField(
                              controller: _phoneController,
                              icon: AppIcons.mobile,
                              label: 'Phone Number',
                              keyboardType: TextInputType.phone,
                              validator: _validatePhone,
                              textInputAction: TextInputAction.next,
                            ),
                            _AddressTextField(
                              controller: _streetController,
                              icon: AppIcons.building_31,
                              label: 'Street',
                              validator: _requiredField,
                              textInputAction: TextInputAction.next,
                            ),
                            _ResponsiveFieldPair(
                              first: _AddressTextField(
                                controller: _cityController,
                                icon: AppIcons.building,
                                label: 'City',
                                validator: _requiredField,
                                textInputAction: TextInputAction.next,
                              ),
                              second: _AddressTextField(
                                controller: _stateController,
                                icon: AppIcons.activity,
                                label: 'State',
                                validator: _requiredField,
                                textInputAction: TextInputAction.next,
                              ),
                            ),
                            _AddressTextField(
                              controller: _countryController,
                              icon: AppIcons.global,
                              label: 'Country',
                              validator: _requiredField,
                              textInputAction: TextInputAction.done,
                              onSubmitted: (_) => _saveAddress(),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        AppActionButton(
                          label: _isEditing ? 'Save Changes' : 'Save',
                          icon: AppIcons.tick_circle,
                          onPressed: _saveAddress,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _AddressHero extends StatelessWidget {
  const _AddressHero({required this.isDark, required this.isEditing});

  final bool isDark;
  final bool isEditing;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF25273A) : const Color(0xFFEAF2FF),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: isDark ? 0.22 : 0.14),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              isEditing ? AppIcons.edit : AppIcons.location_add,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr(
                    isEditing
                        ? 'Keep delivery details fresh'
                        : 'Add a new stop',
                  ),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  context.tr(
                    'Complete address details help checkout and delivery move faster.',
                  ),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.lightTextSecondary,
                    height: 1.35,
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

class _AddressFormCard extends StatelessWidget {
  const _AddressFormCard({required this.isDark, required this.children});

  final bool isDark;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardColor : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            children[i],
            if (i != children.length - 1) const SizedBox(height: 14),
          ],
        ],
      ),
    );
  }
}

class _AddressTextField extends StatelessWidget {
  const _AddressTextField({
    required this.controller,
    required this.icon,
    required this.label,
    this.validator,
    this.keyboardType,
    this.textInputAction,
    this.onSubmitted,
  });

  final TextEditingController controller;
  final IconData icon;
  final String label;
  final FormFieldValidator<String>? validator;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      onFieldSubmitted: onSubmitted,
      style: Theme.of(
        context,
      ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
      decoration: InputDecoration(
        prefixIcon: Icon(icon),
        labelText: context.tr(label),
        filled: true,
        fillColor: isDark
            ? Colors.white.withValues(alpha: 0.04)
            : const Color(0xFFF7F8FB),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.08),
          ),
        ),
      ),
    );
  }
}

class _ResponsiveFieldPair extends StatelessWidget {
  const _ResponsiveFieldPair({required this.first, required this.second});

  final Widget first;
  final Widget second;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final stackFields = constraints.maxWidth < 520;

        if (stackFields) {
          return Column(children: [first, const SizedBox(height: 14), second]);
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: first),
            const SizedBox(width: 14),
            Expanded(child: second),
          ],
        );
      },
    );
  }
}
