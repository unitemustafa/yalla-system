import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../constants/app_colors.dart';
import '../../../localization/app_translations.dart';

class ProductSortButton extends StatelessWidget {
  const ProductSortButton({
    super.key,
    required this.value,
    required this.options,
    required this.onChanged,
    this.title = 'Sort products',
  });

  final String value;
  final List<String> options;
  final ValueChanged<String> onChanged;
  final String title;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Material(
      color: panelColor,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: () => _showSortSheet(context, isDark),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          constraints: const BoxConstraints(minHeight: 54),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: isDark ? 0.18 : 0.10,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  AppIcons.sort,
                  color: AppColors.primary,
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      context.tr('Sort by'),
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: mutedColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      context.tr(value),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                AppIcons.arrow_down_1,
                color: isDark ? Colors.white70 : AppColors.lightTextPrimary,
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSortSheet(BuildContext context, bool isDark) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        final sheetColor = isDark ? AppColors.darkCardColor : Colors.white;
        final mutedColor = isDark
            ? AppColors.darkTextSecondary
            : AppColors.lightTextSecondary;

        return LayoutBuilder(
          builder: (context, constraints) {
            final maxSheetHeight = constraints.maxHeight * 0.84;

            return SafeArea(
              child: Align(
                alignment: Alignment.bottomCenter,
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: 520,
                    maxHeight: maxSheetHeight,
                  ),
                  child: Container(
                    margin: const EdgeInsets.all(12),
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
                    decoration: BoxDecoration(
                      color: sheetColor,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.black.withValues(alpha: 0.05),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(
                            alpha: isDark ? 0.28 : 0.12,
                          ),
                          blurRadius: 24,
                          offset: const Offset(0, -8),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 44,
                          height: 4,
                          decoration: BoxDecoration(
                            color: mutedColor.withValues(alpha: 0.28),
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Material(
                              color: Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              child: InkWell(
                                onTap: () => Navigator.pop(context),
                                borderRadius: BorderRadius.circular(8),
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.16)
                                          : Colors.black.withValues(
                                              alpha: 0.12,
                                            ),
                                    ),
                                  ),
                                  child: const Icon(Icons.close_rounded),
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                context.tr(title),
                                textAlign: TextAlign.end,
                                style: Theme.of(context).textTheme.titleLarge
                                    ?.copyWith(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w900,
                                    ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Flexible(
                          child: ListView.separated(
                            shrinkWrap: true,
                            padding: EdgeInsets.only(
                              bottom: MediaQuery.viewInsetsOf(context).bottom,
                            ),
                            itemCount: options.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final option = options[index];
                              return _SortOptionTile(
                                option: option,
                                selected: option == value,
                                onTap: () {
                                  Navigator.pop(context);
                                  onChanged(option);
                                },
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _SortOptionTile extends StatelessWidget {
  const _SortOptionTile({
    required this.option,
    required this.selected,
    required this.onTap,
  });

  final String option;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Material(
      color: selected
          ? AppColors.primary.withValues(alpha: isDark ? 0.20 : 0.10)
          : Colors.transparent,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: SizedBox(
          height: 56,
          child: Row(
            children: [
              const SizedBox(width: 12),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 160),
                child: selected
                    ? const Icon(
                        AppIcons.tick_circle5,
                        key: ValueKey('selected'),
                        color: AppColors.primary,
                        size: 22,
                      )
                    : Icon(
                        AppIcons.sort,
                        key: const ValueKey('sort'),
                        color: mutedColor,
                        size: 18,
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  context.tr(option),
                  textAlign: TextAlign.end,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: selected ? AppColors.primary : mutedColor,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Icon(
                AppIcons.filter_search,
                color: selected ? AppColors.primary : mutedColor,
                size: 18,
              ),
              const SizedBox(width: 12),
            ],
          ),
        ),
      ),
    );
  }
}
