import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';

const List<PhoneCountry> kPhoneCountries = [
  PhoneCountry(
    name: 'Egypt',
    isoCode: 'EG',
    dialCode: '+20',
    minDigits: 10,
    maxDigits: 11,
  ),
  PhoneCountry(
    name: 'United States',
    isoCode: 'US',
    dialCode: '+1',
    minDigits: 10,
    maxDigits: 10,
  ),
  PhoneCountry(
    name: 'United Kingdom',
    isoCode: 'UK',
    dialCode: '+44',
    minDigits: 10,
    maxDigits: 10,
  ),
  PhoneCountry(
    name: 'Saudi Arabia',
    isoCode: 'SA',
    dialCode: '+966',
    minDigits: 9,
    maxDigits: 9,
  ),
  PhoneCountry(
    name: 'Iraq',
    isoCode: 'IQ',
    dialCode: '+964',
    minDigits: 10,
    maxDigits: 11,
  ),
  PhoneCountry(
    name: 'United Arab Emirates',
    isoCode: 'AE',
    dialCode: '+971',
    minDigits: 9,
    maxDigits: 9,
  ),
  PhoneCountry(
    name: 'India',
    isoCode: 'IN',
    dialCode: '+91',
    minDigits: 10,
    maxDigits: 10,
  ),
  PhoneCountry(
    name: 'Pakistan',
    isoCode: 'PK',
    dialCode: '+92',
    minDigits: 10,
    maxDigits: 10,
  ),
  PhoneCountry(
    name: 'Turkey',
    isoCode: 'TR',
    dialCode: '+90',
    minDigits: 10,
    maxDigits: 10,
  ),
];

class PhoneCountry {
  const PhoneCountry({
    required this.name,
    required this.isoCode,
    required this.dialCode,
    required this.minDigits,
    required this.maxDigits,
  });

  final String name;
  final String isoCode;
  final String dialCode;
  final int minDigits;
  final int maxDigits;
}

String normalizePhoneForCountry(PhoneCountry country, String value) {
  final digits = value.replaceAll(RegExp(r'\D'), '');
  if (digits.isEmpty) return '';

  final dialDigits = country.dialCode.replaceAll(RegExp(r'\D'), '');
  var normalizedDigits = digits;
  if (normalizedDigits.startsWith('00')) {
    normalizedDigits = normalizedDigits.substring(2);
  }

  var nationalDigits = normalizedDigits;
  if (normalizedDigits.startsWith(dialDigits) &&
      normalizedDigits.length > dialDigits.length) {
    nationalDigits = normalizedDigits.substring(dialDigits.length);
  }

  if (_dropsDomesticTrunkPrefix(country) && nationalDigits.startsWith('0')) {
    nationalDigits = nationalDigits.substring(1);
  }

  return '${country.dialCode}$nationalDigits';
}

bool _dropsDomesticTrunkPrefix(PhoneCountry country) {
  return country.isoCode != 'US' && country.isoCode != 'IN';
}

class CountryPickerSheet extends StatefulWidget {
  const CountryPickerSheet({
    super.key,
    required this.countries,
    required this.selectedCountry,
  });

  final List<PhoneCountry> countries;
  final PhoneCountry selectedCountry;

  @override
  State<CountryPickerSheet> createState() => _CountryPickerSheetState();
}

class _CountryPickerSheetState extends State<CountryPickerSheet> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final sheetColor = isDarkMode ? const Color(0xFF222326) : Colors.white;
    final textColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.58)
        : Colors.black.withValues(alpha: 0.52);
    final query = _searchController.text.trim().toLowerCase();
    final countries = query.isEmpty
        ? widget.countries
        : widget.countries.where((country) {
            final translatedName = context.tr(country.name).toLowerCase();
            return country.name.toLowerCase().contains(query) ||
                translatedName.contains(query) ||
                country.isoCode.toLowerCase().contains(query) ||
                country.dialCode.contains(query);
          }).toList();

    return SafeArea(
      top: false,
      child: Container(
        height: MediaQuery.sizeOf(context).height * 0.68,
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 18),
        decoration: BoxDecoration(
          color: sheetColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          border: Border.all(
            color: isDarkMode
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.06),
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: mutedColor.withValues(alpha: 0.45),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(
                      alpha: isDarkMode ? 0.18 : 0.10,
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    AppIcons.global,
                    color: AppColors.primary,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    context.tr('Select country'),
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: textColor,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: textColor,
                fontWeight: FontWeight.w700,
              ),
              decoration: InputDecoration(
                hintText: context.tr('Search country or code'),
                prefixIcon: Icon(
                  AppIcons.search_normal,
                  color: mutedColor,
                  size: 20,
                ),
                filled: true,
                fillColor: isDarkMode
                    ? Colors.white.withValues(alpha: 0.04)
                    : const Color(0xFFF5F6FA),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 14,
                ),
                hintStyle: TextStyle(
                  color: mutedColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: countries.isEmpty
                  ? Center(
                      child: Text(
                        context.tr('No countries found'),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: mutedColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: EdgeInsets.zero,
                      itemCount: countries.length,
                      separatorBuilder: (_, _) => Divider(
                        height: 1,
                        color: isDarkMode
                            ? Colors.white.withValues(alpha: 0.06)
                            : Colors.black.withValues(alpha: 0.06),
                      ),
                      itemBuilder: (context, index) {
                        final country = countries[index];
                        final isSelected = country == widget.selectedCountry;

                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          minLeadingWidth: 42,
                          leading: CircleAvatar(
                            radius: 20,
                            backgroundColor: AppColors.primary.withValues(
                              alpha: isSelected ? 0.18 : 0.08,
                            ),
                            child: Text(
                              country.isoCode,
                              style: TextStyle(
                                color: isSelected
                                    ? AppColors.primary
                                    : textColor.withValues(alpha: 0.72),
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          title: Text(
                            context.tr(country.name),
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: textColor,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          subtitle: Text(
                            country.dialCode,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: mutedColor,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          trailing: isSelected
                              ? const Icon(
                                  AppIcons.tick_circle,
                                  color: AppColors.primary,
                                )
                              : null,
                          onTap: () => Navigator.of(context).pop(country),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class PhoneCountryPrefix extends StatelessWidget {
  const PhoneCountryPrefix({
    super.key,
    required this.country,
    required this.isDarkMode,
    required this.onTap,
  });

  final PhoneCountry country;
  final bool isDarkMode;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final textColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.82)
        : Colors.black.withValues(alpha: 0.66);
    final dividerColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.10)
        : Colors.black.withValues(alpha: 0.10);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
        child: Padding(
          padding: const EdgeInsetsDirectional.only(start: 12, end: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  context.tr('${country.isoCode} ${country.dialCode}'),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Icon(AppIcons.arrow_down_1, size: 14, color: textColor),
              const SizedBox(width: 8),
              Container(width: 1, height: 24, color: dividerColor),
            ],
          ),
        ),
      ),
    );
  }
}
