part of 'edit_profile_field_view.dart';

class _BirthDatePickerSheet extends StatefulWidget {
  const _BirthDatePickerSheet({
    required this.initialDate,
    required this.firstDate,
    required this.lastDate,
  });

  final DateTime initialDate;
  final DateTime firstDate;
  final DateTime lastDate;

  @override
  State<_BirthDatePickerSheet> createState() => _BirthDatePickerSheetState();
}

class _BirthDatePickerSheetState extends State<_BirthDatePickerSheet> {
  late DateTime _selectedDate;
  late DateTime _visibleMonth;

  @override
  void initState() {
    super.initState();
    _selectedDate = _clampDate(widget.initialDate);
    _visibleMonth = DateTime(_selectedDate.year, _selectedDate.month);
  }

  DateTime _clampDate(DateTime value) {
    final normalized = DateTime(value.year, value.month, value.day);
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

    if (normalized.isBefore(first)) return first;
    if (normalized.isAfter(last)) return last;
    return normalized;
  }

  bool _monthIsAvailable(int year, int month) {
    final monthStart = DateTime(year, month);
    final monthEnd = DateTime(year, month + 1, 0);

    return !monthEnd.isBefore(widget.firstDate) &&
        !monthStart.isAfter(widget.lastDate);
  }

  bool get _canShowPrevious {
    final previous = DateTime(_visibleMonth.year, _visibleMonth.month - 1);
    return _monthIsAvailable(previous.year, previous.month);
  }

  bool get _canShowNext {
    final next = DateTime(_visibleMonth.year, _visibleMonth.month + 1);
    return _monthIsAvailable(next.year, next.month);
  }

  void _setVisibleMonth({int? year, int? month}) {
    var nextYear = year ?? _visibleMonth.year;
    var nextMonth = month ?? _visibleMonth.month;

    if (nextYear == widget.firstDate.year &&
        nextMonth < widget.firstDate.month) {
      nextMonth = widget.firstDate.month;
    }

    if (nextYear == widget.lastDate.year && nextMonth > widget.lastDate.month) {
      nextMonth = widget.lastDate.month;
    }

    setState(() => _visibleMonth = DateTime(nextYear, nextMonth));
  }

  void _shiftMonth(int delta) {
    final next = DateTime(_visibleMonth.year, _visibleMonth.month + delta);
    if (!_monthIsAvailable(next.year, next.month)) return;
    setState(() => _visibleMonth = DateTime(next.year, next.month));
  }

  void _selectDay(int day) {
    setState(
      () => _selectedDate = DateTime(
        _visibleMonth.year,
        _visibleMonth.month,
        day,
      ),
    );
  }

  String _label(BuildContext context, String english, String arabic) {
    return context.isArabicLanguage ? arabic : english;
  }

  String _digits(BuildContext context, int value) {
    final text = value.toString();
    if (!context.isArabicLanguage) return text;

    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return text.split('').map((digit) {
      final index = int.tryParse(digit);
      return index == null ? digit : arabicDigits[index];
    }).join();
  }

  String _monthName(BuildContext context, int month) {
    final months = context.isArabicLanguage
        ? const [
            'يناير',
            'فبراير',
            'مارس',
            'أبريل',
            'مايو',
            'يونيو',
            'يوليو',
            'أغسطس',
            'سبتمبر',
            'أكتوبر',
            'نوفمبر',
            'ديسمبر',
          ]
        : const [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ];

    return months[month - 1];
  }

  String _weekdayName(BuildContext context, DateTime date) {
    final names = context.isArabicLanguage
        ? const [
            'الاثنين',
            'الثلاثاء',
            'الأربعاء',
            'الخميس',
            'الجمعة',
            'السبت',
            'الأحد',
          ]
        : const [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ];

    return names[date.weekday - 1];
  }

  String _selectedDateText(BuildContext context) {
    if (context.isArabicLanguage) {
      return '${_weekdayName(context, _selectedDate)}، '
          '${_digits(context, _selectedDate.day)} '
          '${_monthName(context, _selectedDate.month)} '
          '${_digits(context, _selectedDate.year)}';
    }

    return '${_weekdayName(context, _selectedDate)}, '
        '${_monthName(context, _selectedDate.month)} '
        '${_selectedDate.day}, ${_selectedDate.year}';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final panelColor = isDark ? AppColors.darkCardColor : Colors.white;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final maxHeight = MediaQuery.sizeOf(context).height * 0.92;

    return SafeArea(
      top: false,
      child: Align(
        alignment: Alignment.bottomCenter,
        child: Container(
          width: double.infinity,
          constraints: BoxConstraints(maxHeight: maxHeight, maxWidth: 520),
          decoration: BoxDecoration(
            color: panelColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.36 : 0.14),
                blurRadius: 28,
                offset: const Offset(0, -12),
              ),
            ],
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 46,
                    height: 4,
                    decoration: BoxDecoration(
                      color: mutedColor.withValues(alpha: 0.28),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                _BirthDateHeader(
                  title: _label(
                    context,
                    'Select birth date',
                    'اختيار تاريخ الميلاد',
                  ),
                  dateText: _selectedDateText(context),
                  isDark: isDark,
                  onClose: () => Navigator.pop(context),
                ),
                const SizedBox(height: 14),
                _BirthDateMonthControls(
                  visibleMonth: _visibleMonth,
                  firstYear: widget.firstDate.year,
                  lastYear: widget.lastDate.year,
                  canShowPrevious: _canShowPrevious,
                  canShowNext: _canShowNext,
                  isDark: isDark,
                  monthName: (month) => _monthName(context, month),
                  yearLabel: (year) => _digits(context, year),
                  monthEnabled: (month) =>
                      _monthIsAvailable(_visibleMonth.year, month),
                  onPrevious: () => _shiftMonth(-1),
                  onNext: () => _shiftMonth(1),
                  onMonthChanged: (month) {
                    if (month != null) _setVisibleMonth(month: month);
                  },
                  onYearChanged: (year) {
                    if (year != null) _setVisibleMonth(year: year);
                  },
                ),
                const SizedBox(height: 12),
                _BirthDateCalendarGrid(
                  visibleMonth: _visibleMonth,
                  selectedDate: _selectedDate,
                  firstDate: widget.firstDate,
                  lastDate: widget.lastDate,
                  isDark: isDark,
                  digitBuilder: (value) => _digits(context, value),
                  onDaySelected: _selectDay,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: textColor,
                          side: BorderSide(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.12)
                                : Colors.black.withValues(alpha: 0.08),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          context.tr('Cancel'),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => Navigator.pop(context, _selectedDate),
                        icon: const Icon(AppIcons.tick_circle, size: 18),
                        label: Text(
                          context.tr('Save'),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
