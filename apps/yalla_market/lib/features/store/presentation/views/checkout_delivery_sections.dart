part of 'checkout_view.dart';

const String _manualCityOption = '__manual_city__';

class _PaymentMethodCard extends StatelessWidget {
  const _PaymentMethodCard({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return _SectionCard(
      isDark: isDark,
      title: 'Payment Method',
      icon: AppIcons.money_3,
      actionLabel: 'Change',
      onAction: () => showPaymentMethodSheet(context, isDark),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              AppIcons.money_3,
              color: AppColors.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr('Cash on Delivery'),
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  context.tr('Pay when your order arrives'),
                  style: TextStyle(
                    color: mutedColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          _SoftBadge(
            label: 'Default',
            icon: AppIcons.tick_circle,
            isDark: isDark,
          ),
        ],
      ),
    );
  }
}

class _ShippingAddressCard extends StatelessWidget {
  const _ShippingAddressCard({
    required this.isDark,
    required this.formKey,
    required this.nameController,
    required this.phoneController,
    required this.streetController,
    required this.manualCityController,
    required this.selectedCity,
    required this.isManualCity,
    required this.isExpanded,
    required this.requiredValidator,
    required this.phoneValidator,
    required this.cityValidator,
    required this.onToggleExpanded,
    required this.onCityChanged,
  });

  final bool isDark;
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final TextEditingController streetController;
  final TextEditingController manualCityController;
  final CityData? selectedCity;
  final bool isManualCity;
  final bool isExpanded;
  final FormFieldValidator<String> requiredValidator;
  final FormFieldValidator<String> phoneValidator;
  final FormFieldValidator<String> cityValidator;
  final VoidCallback onToggleExpanded;
  final ValueChanged<String?> onCityChanged;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final cityValue = isManualCity ? _manualCityOption : selectedCity?.slug;

    return _SectionCard(
      isDark: isDark,
      title: 'Shipping Address',
      icon: AppIcons.location,
      trailing: IconButton(
        onPressed: onToggleExpanded,
        icon: RotatedBox(
          quarterTurns: isExpanded ? 2 : 0,
          child: Icon(AppIcons.arrow_down_1, color: mutedColor, size: 20),
        ),
        tooltip: isExpanded ? 'Collapse' : 'Expand',
      ),
      child: AnimatedCrossFade(
        firstChild: _CollapsedAddressSummary(
          isDark: isDark,
          name: nameController.text.trim(),
          city: isManualCity
              ? manualCityController.text.trim()
              : selectedCity?.displayName(arabic: context.isArabicLanguage) ??
                    '',
        ),
        secondChild: Form(
          key: formKey,
          child: Column(
            children: [
              _CheckoutAddressTextField(
                controller: nameController,
                icon: AppIcons.user,
                label: 'Name',
                validator: requiredValidator,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 14),
              _CheckoutAddressTextField(
                controller: phoneController,
                icon: AppIcons.mobile,
                label: 'Phone Number',
                keyboardType: TextInputType.phone,
                validator: phoneValidator,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 14),
              FormField<String>(
                key: ValueKey(cityValue),
                initialValue: cityValue,
                validator: cityValidator,
                builder: (field) {
                  final selectedText = isManualCity
                      ? (context.isArabicLanguage
                            ? 'إدخال يدوي'
                            : 'Manual entry')
                      : selectedCity?.displayName(
                              arabic: context.isArabicLanguage,
                            ) ??
                            '';

                  return InkWell(
                    onTap: () async {
                      final picked = await _openCityPicker(
                        context: context,
                        isDark: isDark,
                        selectedValue: cityValue,
                      );
                      if (picked == null) return;
                      field.didChange(picked);
                      onCityChanged(picked);
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: InputDecorator(
                      decoration: _checkoutInputDecoration(
                        context: context,
                        isDark: isDark,
                        icon: AppIcons.building,
                        label: 'Delivery City',
                        errorText: field.errorText,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              selectedText.isEmpty
                                  ? (context.isArabicLanguage
                                        ? 'اختار المدينة'
                                        : 'Choose city')
                                  : selectedText,
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(
                                    color: selectedText.isEmpty
                                        ? mutedColor
                                        : null,
                                    fontWeight: FontWeight.w800,
                                  ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            AppIcons.arrow_down_1,
                            color: mutedColor,
                            size: 18,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              if (isManualCity) ...[
                const SizedBox(height: 14),
                _CheckoutAddressTextField(
                  controller: manualCityController,
                  icon: AppIcons.edit_2,
                  label: 'Enter your city',
                  validator: requiredValidator,
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 8),
                _ShippingNote(
                  isDark: isDark,
                  text: context.isArabicLanguage
                      ? 'مصاريف الشحن هتظهر دليفيري وتتحدد بعد مراجعة المدينة.'
                      : 'Shipping will show as Delivery and is confirmed after reviewing the city.',
                ),
              ],
              if (!isManualCity && selectedCity == null) ...[
                const SizedBox(height: 8),
                _ShippingNote(
                  isDark: isDark,
                  text: context.isArabicLanguage
                      ? 'مصاريف الشحن مش هتتحدد غير لما تختار مدينة متاح لها التوصيل.'
                      : 'Shipping fee is only fixed after choosing a supported delivery city.',
                ),
              ],
              const SizedBox(height: 14),
              _CheckoutAddressTextField(
                controller: streetController,
                icon: AppIcons.building_31,
                label: 'Street',
                validator: requiredValidator,
                textInputAction: TextInputAction.done,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(AppIcons.location, color: mutedColor, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      context.tr(
                        'Complete address details help checkout and delivery move faster.',
                      ),
                      style: TextStyle(
                        color: mutedColor,
                        fontSize: 12,
                        height: 1.35,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        crossFadeState: isExpanded
            ? CrossFadeState.showSecond
            : CrossFadeState.showFirst,
        duration: const Duration(milliseconds: 180),
      ),
    );
  }
}

class _CollapsedAddressSummary extends StatelessWidget {
  const _CollapsedAddressSummary({
    required this.isDark,
    required this.name,
    required this.city,
  });

  final bool isDark;
  final String name;
  final String city;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final text = [
      if (name.isNotEmpty) name,
      if (city.isNotEmpty) city,
    ].join(' • ');

    return Row(
      children: [
        Icon(AppIcons.location, color: mutedColor, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text.isEmpty
                ? (context.isArabicLanguage
                      ? 'افتح لإدخال عنوان الشحن'
                      : 'Open to enter shipping address')
                : text,
            style: TextStyle(
              color: mutedColor,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _CheckoutAddressTextField extends StatelessWidget {
  const _CheckoutAddressTextField({
    required this.controller,
    required this.icon,
    required this.label,
    required this.validator,
    this.keyboardType,
    this.textInputAction,
  });

  final TextEditingController controller;
  final IconData icon;
  final String label;
  final FormFieldValidator<String> validator;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      style: Theme.of(
        context,
      ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
      decoration: _checkoutInputDecoration(
        context: context,
        isDark: isDark,
        icon: icon,
        label: label,
      ),
    );
  }
}

class _ShippingNote extends StatelessWidget {
  const _ShippingNote({required this.isDark, required this.text});

  final bool isDark;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          AppIcons.info_circle,
          color: isDark
              ? AppColors.darkTextSecondary
              : AppColors.lightTextSecondary,
          size: 15,
        ),
        const SizedBox(width: 7),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: isDark
                  ? AppColors.darkTextSecondary
                  : AppColors.lightTextSecondary,
              fontSize: 12,
              height: 1.35,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

InputDecoration _checkoutInputDecoration({
  required BuildContext context,
  required bool isDark,
  required IconData icon,
  required String label,
  String? errorText,
}) {
  return InputDecoration(
    prefixIcon: Icon(icon),
    labelText: context.tr(label),
    errorText: errorText,
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
  );
}

Future<String?> _openCityPicker({
  required BuildContext context,
  required bool isDark,
  required String? selectedValue,
}) async {
  return showModalBottomSheet<String>(
    context: context,
    isScrollControlled: true,
    backgroundColor: isDark ? AppColors.darkCardColor : Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (context) {
      return _CityPickerSheet(isDark: isDark, selectedValue: selectedValue);
    },
  );
}

class _CityPickerSheet extends StatefulWidget {
  const _CityPickerSheet({required this.isDark, required this.selectedValue});

  final bool isDark;
  final String? selectedValue;

  @override
  State<_CityPickerSheet> createState() => _CityPickerSheetState();
}

class _CityPickerSheetState extends State<_CityPickerSheet> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.trim().toLowerCase();
    final cities = CityData.dashboardRegions
        .where((city) {
          if (query.isEmpty) return true;
          final english = city.name.toLowerCase();
          final localized = city
              .displayName(arabic: context.isArabicLanguage)
              .toLowerCase();
          return english.contains(query) || localized.contains(query);
        })
        .toList(growable: false);

    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          16,
          12,
          16,
          16 + MediaQuery.of(context).viewInsets.bottom,
        ),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.68,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: widget.isDark
                        ? Colors.white.withValues(alpha: 0.18)
                        : Colors.black.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                context.isArabicLanguage
                    ? 'اختار مدينة التوصيل'
                    : 'Choose delivery city',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                textInputAction: TextInputAction.search,
                decoration: _checkoutInputDecoration(
                  context: context,
                  isDark: widget.isDark,
                  icon: AppIcons.search_normal,
                  label: context.isArabicLanguage
                      ? 'ابحث عن مدينة'
                      : 'Search city',
                ),
              ),
              const SizedBox(height: 12),
              _CityOptionTile(
                isDark: widget.isDark,
                icon: AppIcons.edit_2,
                title: context.isArabicLanguage
                    ? 'لو مدينتك مش موجودة اكتبها يدوي'
                    : 'If your city is not listed, enter it manually',
                subtitle: context.isArabicLanguage
                    ? 'الشحن هيفضل غير محدد لحد المراجعة'
                    : 'Shipping stays unspecified until review',
                isSelected: widget.selectedValue == _manualCityOption,
                onTap: () => Navigator.pop(context, _manualCityOption),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: ListView.separated(
                  itemCount: cities.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final city = cities[index];
                    return _CityOptionTile(
                      isDark: widget.isDark,
                      icon: AppIcons.location,
                      title: city.displayName(arabic: context.isArabicLanguage),
                      subtitle: context.isArabicLanguage
                          ? 'متاح لها التوصيل'
                          : 'Delivery available',
                      isSelected: widget.selectedValue == city.slug,
                      onTap: () => Navigator.pop(context, city.slug),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CityOptionTile extends StatelessWidget {
  const _CityOptionTile({
    required this.isDark,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  final bool isDark;
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Material(
      color: isSelected
          ? AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.08)
          : (isDark
                ? Colors.white.withValues(alpha: 0.04)
                : const Color(0xFFF7F8FB)),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected
                  ? AppColors.primary.withValues(alpha: 0.42)
                  : (isDark
                        ? Colors.white.withValues(alpha: 0.08)
                        : Colors.black.withValues(alpha: 0.06)),
            ),
          ),
          child: Row(
            children: [
              _IconTile(icon: icon, isDark: isDark),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: mutedColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              if (isSelected)
                const Icon(
                  AppIcons.tick_circle,
                  color: AppColors.primary,
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.isDark,
    required this.title,
    required this.icon,
    this.actionLabel,
    this.onAction,
    this.trailing,
    required this.child,
  });

  final bool isDark;
  final String title;
  final IconData icon;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Widget? trailing;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: panelColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _IconTile(icon: icon, isDark: isDark),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  context.tr(title),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              if (actionLabel != null && onAction != null)
                TextButton.icon(
                  onPressed: onAction,
                  icon: const Icon(AppIcons.edit_2, size: 14),
                  label: Text(context.tr(actionLabel!)),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    minimumSize: const Size(0, 34),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    textStyle: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ?trailing,
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}
