import 'package:flutter/material.dart';
import 'package:yalla_market/core/localization/app_translations.dart';

import '../../../../../../../core/constants/app_colors.dart';
import '../../../../../../../core/icons/app_icons.dart';

const double _controlRadius = 18;
const double _actionHeight = 54;
const double _wheelItemExtent = 44;
const double _wheelPickerHeight = 220;

class CustomDateRangeSheet extends StatefulWidget {
  const CustomDateRangeSheet({
    super.key,
    required this.firstDate,
    required this.lastDate,
    required this.initialRange,
  });

  final DateTime firstDate;
  final DateTime lastDate;
  final DateTimeRange initialRange;

  @override
  State<CustomDateRangeSheet> createState() => _CustomDateRangeSheetState();
}

class _CustomDateRangeSheetState extends State<CustomDateRangeSheet> {
  late DateTime _startDate;
  late DateTime _endDate;

  @override
  void initState() {
    super.initState();
    _startDate = _clampDate(_dateOnly(widget.initialRange.start));
    _endDate = _clampDate(_dateOnly(widget.initialRange.end));
    if (_endDate.isBefore(_startDate)) _endDate = _startDate;
  }

  int get _selectedDays => _endDate.difference(_startDate).inDays + 1;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final backgroundColor = isDark ? AppColors.darkCardColor : Colors.white;
    final outlineColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          16,
          0,
          16,
          16 + MediaQuery.viewInsetsOf(context).bottom,
        ),
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(color: outlineColor),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.26 : 0.10),
                blurRadius: 28,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 48,
                  height: 4,
                  decoration: BoxDecoration(
                    color: mutedColor.withValues(alpha: 0.32),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Align(
                alignment: AlignmentDirectional.centerEnd,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded),
                  style: IconButton.styleFrom(
                    fixedSize: const Size(44, 44),
                    backgroundColor: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.black.withValues(alpha: 0.04),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(_controlRadius),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _DateSelectionCard(
                      label: context.tr('From'),
                      value: _formatDate(_startDate),
                      onTap: () => _pickDate(isStart: true),
                      compact: true,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _DateSelectionCard(
                      label: context.tr('To'),
                      value: _formatDate(_endDate),
                      onTap: () => _pickDate(isStart: false),
                      compact: true,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _SelectedDaysSummary(days: _selectedDays),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _resetToDefault,
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(_actionHeight),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(_controlRadius),
                        ),
                        side: BorderSide(
                          color: AppColors.primary.withValues(alpha: 0.28),
                        ),
                      ),
                      child: Text(context.tr('Reset')),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton(
                      onPressed: _applySelection,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(_actionHeight),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(_controlRadius),
                        ),
                      ),
                      child: Text(context.tr('Apply')),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickDate({required bool isStart}) async {
    final pickedDate = await showDialog<DateTime>(
      context: context,
      builder: (_) => _WheelDatePickerDialog(
        initialDate: isStart ? _startDate : _endDate,
        firstDate: widget.firstDate,
        lastDate: widget.lastDate,
      ),
    );
    if (pickedDate == null) return;

    setState(() {
      final normalizedDate = _dateOnly(pickedDate);
      if (isStart) {
        _startDate = normalizedDate;
        if (_endDate.isBefore(_startDate)) _endDate = _startDate;
      } else {
        _endDate = normalizedDate;
        if (_endDate.isBefore(_startDate)) _startDate = _endDate;
      }
    });
  }

  void _resetToDefault() {
    setState(() {
      _endDate = _clampDate(_dateOnly(DateTime.now()));
      _startDate = _clampDate(_endDate.subtract(const Duration(days: 30)));
    });
  }

  void _applySelection() {
    Navigator.pop(context, DateTimeRange(start: _startDate, end: _endDate));
  }

  DateTime _dateOnly(DateTime value) =>
      DateTime(value.year, value.month, value.day);

  DateTime _clampDate(DateTime value) {
    final firstDate = _dateOnly(widget.firstDate);
    final lastDate = _dateOnly(widget.lastDate);
    if (value.isBefore(firstDate)) return firstDate;
    if (value.isAfter(lastDate)) return lastDate;
    return value;
  }

  String _formatDate(DateTime value) =>
      '${value.day.toString().padLeft(2, '0')}/'
      '${value.month.toString().padLeft(2, '0')}/${value.year}';
}

class _DateSelectionCard extends StatelessWidget {
  const _DateSelectionCard({
    required this.label,
    required this.value,
    required this.onTap,
    this.compact = false,
  });

  final String label;
  final String value;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final outlineColor = isDark
        ? Colors.white.withValues(alpha: 0.18)
        : Colors.black.withValues(alpha: 0.10);
    final cardColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);
    final labelStyle =
        (compact ? theme.textTheme.labelMedium : theme.textTheme.labelLarge)
            ?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w900,
              fontSize: compact ? 12.0 : null,
            );
    final valueStyle =
        (compact ? theme.textTheme.titleSmall : theme.textTheme.titleMedium)
            ?.copyWith(
              fontWeight: FontWeight.w900,
              fontSize: compact ? 13.0 : null,
            );

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(_controlRadius),
      child: Ink(
        padding: EdgeInsets.symmetric(
          horizontal: compact ? 8 : 12,
          vertical: compact ? 10 : 12,
        ),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(_controlRadius),
          border: Border.all(color: outlineColor),
        ),
        child: Row(
          children: [
            Container(
              width: compact ? 42 : 48,
              height: compact ? 34 : 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(
                  alpha: isDark ? 0.18 : 0.09,
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.18),
                ),
              ),
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: labelStyle,
              ),
            ),
            SizedBox(width: compact ? 6 : 8),
            Expanded(
              child: compact
                  ? FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(
                        value,
                        textDirection: TextDirection.ltr,
                        maxLines: 1,
                        style: valueStyle,
                      ),
                    )
                  : Text(
                      value,
                      textDirection: TextDirection.ltr,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: valueStyle,
                    ),
            ),
            if (!compact) ...[
              const SizedBox(width: 10),
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: isDark ? 0.18 : 0.08,
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  AppIcons.calendar,
                  size: 17,
                  color: AppColors.primary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SelectedDaysSummary extends StatelessWidget {
  const _SelectedDaysSummary({required this.days});

  final int days;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: isDark ? 0.14 : 0.07),
        borderRadius: BorderRadius.circular(_controlRadius),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: isDark ? 0.24 : 0.16),
        ),
      ),
      child: Row(
        children: [
          const Icon(AppIcons.calendar, color: AppColors.primary, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              context.tr('Selected days'),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelMedium?.copyWith(
                color: mutedColor,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '$days',
            style: theme.textTheme.titleSmall?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _WheelDatePickerDialog extends StatefulWidget {
  const _WheelDatePickerDialog({
    required this.initialDate,
    required this.firstDate,
    required this.lastDate,
  });

  final DateTime initialDate;
  final DateTime firstDate;
  final DateTime lastDate;

  @override
  State<_WheelDatePickerDialog> createState() => _WheelDatePickerDialogState();
}

class _WheelDatePickerDialogState extends State<_WheelDatePickerDialog> {
  late int _selectedYear;
  late int _selectedMonth;
  late int _selectedDay;
  late final FixedExtentScrollController _dayController;
  late final FixedExtentScrollController _monthController;
  late final FixedExtentScrollController _yearController;

  DateTime get _selectedDate =>
      DateTime(_selectedYear, _selectedMonth, _selectedDay);

  List<int> get _years => [
    for (int year = widget.firstDate.year; year <= widget.lastDate.year; year++)
      year,
  ];

  List<int> get _months {
    final start = _selectedYear == widget.firstDate.year
        ? widget.firstDate.month
        : 1;
    final end = _selectedYear == widget.lastDate.year
        ? widget.lastDate.month
        : 12;
    return [for (int month = start; month <= end; month++) month];
  }

  List<int> get _days {
    final monthDays = DateUtils.getDaysInMonth(_selectedYear, _selectedMonth);
    final start =
        _selectedYear == widget.firstDate.year &&
            _selectedMonth == widget.firstDate.month
        ? widget.firstDate.day
        : 1;
    final end =
        _selectedYear == widget.lastDate.year &&
            _selectedMonth == widget.lastDate.month
        ? widget.lastDate.day
        : monthDays;
    return [for (int day = start; day <= end; day++) day];
  }

  @override
  void initState() {
    super.initState();
    final initialDate = _normalize(widget.initialDate);
    _selectedYear = initialDate.year;
    _selectedMonth = initialDate.month;
    _selectedDay = initialDate.day;
    _dayController = FixedExtentScrollController(
      initialItem: _days.indexOf(_selectedDay),
    );
    _monthController = FixedExtentScrollController(
      initialItem: _months.indexOf(_selectedMonth),
    );
    _yearController = FixedExtentScrollController(
      initialItem: _years.indexOf(_selectedYear),
    );
  }

  @override
  void dispose() {
    _dayController.dispose();
    _monthController.dispose();
    _yearController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final backgroundColor = isDark ? AppColors.darkCardColor : Colors.white;
    final outlineColor = isDark
        ? Colors.white.withValues(alpha: 0.10)
        : Colors.black.withValues(alpha: 0.06);
    final surfaceColor = isDark
        ? Colors.white.withValues(alpha: 0.03)
        : const Color(0xFFF7F8FB);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: outlineColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.30 : 0.12),
              blurRadius: 26,
              offset: const Offset(0, 14),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 68,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(
                          alpha: isDark ? 0.22 : 0.10,
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        AppIcons.calendar,
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 58),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          context.tr('Choose date'),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDate(_selectedDate),
                          textDirection: TextDirection.ltr,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: mutedColor,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Align(
                    alignment: AlignmentDirectional.centerEnd,
                    child: IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close_rounded),
                      style: IconButton.styleFrom(
                        fixedSize: const Size(44, 44),
                        backgroundColor: isDark
                            ? Colors.white.withValues(alpha: 0.05)
                            : Colors.black.withValues(alpha: 0.04),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Container(
              height: _wheelPickerHeight,
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: outlineColor),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  SizedBox(
                    height: 42,
                    child: Row(
                      children: [
                        Expanded(child: _WheelLabel(context.tr('Day'))),
                        _WheelDivider(color: outlineColor),
                        Expanded(child: _WheelLabel(context.tr('Month'))),
                        _WheelDivider(color: outlineColor),
                        Expanded(child: _WheelLabel(context.tr('Year'))),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _WheelPickerColumn(
                                values: _days,
                                controller: _dayController,
                                onChanged: _updateDay,
                                formatter: _twoDigits,
                              ),
                            ),
                            _WheelDivider(color: outlineColor),
                            Expanded(
                              child: _WheelPickerColumn(
                                values: _months,
                                controller: _monthController,
                                onChanged: _updateMonth,
                                formatter: _twoDigits,
                              ),
                            ),
                            _WheelDivider(color: outlineColor),
                            Expanded(
                              child: _WheelPickerColumn(
                                values: _years,
                                controller: _yearController,
                                onChanged: _updateYear,
                                formatter: (value) => '$value',
                              ),
                            ),
                          ],
                        ),
                        IgnorePointer(
                          child: Container(
                            height: _wheelItemExtent + 8,
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(
                                alpha: isDark ? 0.18 : 0.08,
                              ),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: AppColors.primary.withValues(
                                  alpha: 0.22,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(_actionHeight),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(_controlRadius),
                      ),
                      side: BorderSide(color: outlineColor),
                    ),
                    child: Text(context.tr('Cancel')),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: () => Navigator.pop(context, _selectedDate),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(_actionHeight),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(_controlRadius),
                      ),
                    ),
                    child: Text(context.tr('Confirm')),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _updateYear(int index) {
    setState(() {
      _selectedYear = _years[index];
      _selectedMonth = _clampValue(_selectedMonth, _months);
      _selectedDay = _clampValue(_selectedDay, _days);
    });
    _syncController(_monthController, _months.indexOf(_selectedMonth));
    _syncController(_dayController, _days.indexOf(_selectedDay));
  }

  void _updateMonth(int index) {
    setState(() {
      _selectedMonth = _months[index];
      _selectedDay = _clampValue(_selectedDay, _days);
    });
    _syncController(_dayController, _days.indexOf(_selectedDay));
  }

  void _updateDay(int index) => setState(() => _selectedDay = _days[index]);

  int _clampValue(int value, List<int> values) =>
      value.clamp(values.first, values.last);

  void _syncController(FixedExtentScrollController controller, int index) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !controller.hasClients || index < 0) return;
      controller.jumpToItem(index);
    });
  }

  DateTime _normalize(DateTime value) {
    final date = DateTime(value.year, value.month, value.day);
    final first = DateTime(
      widget.firstDate.year,
      widget.firstDate.month,
      widget.firstDate.day,
    );
    final last = DateTime(
      widget.lastDate.year,
      widget.lastDate.month,
      widget.lastDate.day,
    );
    if (date.isBefore(first)) return first;
    if (date.isAfter(last)) return last;
    return date;
  }

  String _formatDate(DateTime value) =>
      '${_twoDigits(value.day)}/${_twoDigits(value.month)}/${value.year}';

  String _twoDigits(int value) => value.toString().padLeft(2, '0');
}

class _WheelLabel extends StatelessWidget {
  const _WheelLabel(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
          color: isDark
              ? AppColors.darkTextSecondary
              : AppColors.lightTextSecondary,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _WheelDivider extends StatelessWidget {
  const _WheelDivider({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) => Container(width: 1, color: color);
}

class _WheelPickerColumn extends StatelessWidget {
  const _WheelPickerColumn({
    required this.values,
    required this.controller,
    required this.onChanged,
    required this.formatter,
  });

  final List<int> values;
  final FixedExtentScrollController controller;
  final ValueChanged<int> onChanged;
  final String Function(int) formatter;

  @override
  Widget build(BuildContext context) {
    return ListWheelScrollView.useDelegate(
      controller: controller,
      itemExtent: _wheelItemExtent,
      diameterRatio: 1.8,
      perspective: 0.002,
      squeeze: 0.96,
      useMagnifier: true,
      magnification: 1.08,
      overAndUnderCenterOpacity: 0.42,
      physics: const FixedExtentScrollPhysics(parent: BouncingScrollPhysics()),
      onSelectedItemChanged: onChanged,
      childDelegate: ListWheelChildBuilderDelegate(
        childCount: values.length,
        builder: (context, index) => Center(
          child: Text(
            formatter(values[index]),
            textDirection: TextDirection.ltr,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w900,
              height: 1,
            ),
          ),
        ),
      ),
    );
  }
}
