part of 'edit_profile_field_view.dart';

class _BirthDateHeader extends StatelessWidget {
  const _BirthDateHeader({
    required this.title,
    required this.dateText,
    required this.isDark,
    required this.onClose,
  });

  final String title;
  final String dateText;
  final bool isDark;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: isDark ? 0.18 : 0.20),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(AppIcons.calendar, color: Colors.white, size: 23),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.78),
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  dateText,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontSize: 22,
                    height: 1.22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Material(
            color: Colors.white.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: onClose,
              borderRadius: BorderRadius.circular(8),
              child: const SizedBox(
                width: 36,
                height: 36,
                child: Icon(Icons.close_rounded, color: Colors.white, size: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BirthDateMonthControls extends StatelessWidget {
  const _BirthDateMonthControls({
    required this.visibleMonth,
    required this.firstYear,
    required this.lastYear,
    required this.canShowPrevious,
    required this.canShowNext,
    required this.isDark,
    required this.monthName,
    required this.yearLabel,
    required this.monthEnabled,
    required this.onPrevious,
    required this.onNext,
    required this.onMonthChanged,
    required this.onYearChanged,
  });

  final DateTime visibleMonth;
  final int firstYear;
  final int lastYear;
  final bool canShowPrevious;
  final bool canShowNext;
  final bool isDark;
  final String Function(int month) monthName;
  final String Function(int year) yearLabel;
  final bool Function(int month) monthEnabled;
  final VoidCallback onPrevious;
  final VoidCallback onNext;
  final ValueChanged<int?> onMonthChanged;
  final ValueChanged<int?> onYearChanged;

  @override
  Widget build(BuildContext context) {
    final controlFill = isDark
        ? Colors.white.withValues(alpha: 0.06)
        : const Color(0xFFF3F5F7);
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);

    return Row(
      children: [
        _MonthArrowButton(
          icon: AppIcons.arrow_left_2,
          isDark: isDark,
          onPressed: canShowPrevious ? onPrevious : null,
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 3,
          child: _PickerDropdown<int>(
            value: visibleMonth.month,
            fillColor: controlFill,
            borderColor: borderColor,
            items: [
              for (var month = 1; month <= 12; month++)
                DropdownMenuItem<int>(
                  value: month,
                  enabled: monthEnabled(month),
                  child: Text(monthName(month)),
                ),
            ],
            onChanged: onMonthChanged,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 2,
          child: _PickerDropdown<int>(
            value: visibleMonth.year,
            fillColor: controlFill,
            borderColor: borderColor,
            items: [
              for (var year = lastYear; year >= firstYear; year--)
                DropdownMenuItem<int>(
                  value: year,
                  child: Text(yearLabel(year)),
                ),
            ],
            onChanged: onYearChanged,
          ),
        ),
        const SizedBox(width: 8),
        _MonthArrowButton(
          icon: AppIcons.arrow_right_3,
          isDark: isDark,
          onPressed: canShowNext ? onNext : null,
        ),
      ],
    );
  }
}

class _PickerDropdown<T> extends StatelessWidget {
  const _PickerDropdown({
    required this.value,
    required this.items,
    required this.fillColor,
    required this.borderColor,
    required this.onChanged,
  });

  final T value;
  final List<DropdownMenuItem<T>> items;
  final Color fillColor;
  final Color borderColor;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      padding: const EdgeInsetsDirectional.only(start: 12, end: 8),
      decoration: BoxDecoration(
        color: fillColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          isExpanded: true,
          borderRadius: BorderRadius.circular(8),
          icon: const Icon(AppIcons.arrow_down_1, size: 18),
          items: items,
          onChanged: onChanged,
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}

class _MonthArrowButton extends StatelessWidget {
  const _MonthArrowButton({
    required this.icon,
    required this.isDark,
    required this.onPressed,
  });

  final IconData icon;
  final bool isDark;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Material(
      color: isDark
          ? Colors.white.withValues(alpha: 0.06)
          : const Color(0xFFF3F5F7),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          width: 44,
          height: 44,
          child: Icon(
            icon,
            size: 20,
            color: onPressed == null
                ? mutedColor.withValues(alpha: 0.35)
                : (isDark ? Colors.white : AppColors.lightTextPrimary),
          ),
        ),
      ),
    );
  }
}

class _BirthDateCalendarGrid extends StatelessWidget {
  const _BirthDateCalendarGrid({
    required this.visibleMonth,
    required this.selectedDate,
    required this.firstDate,
    required this.lastDate,
    required this.isDark,
    required this.digitBuilder,
    required this.onDaySelected,
  });

  final DateTime visibleMonth;
  final DateTime selectedDate;
  final DateTime firstDate;
  final DateTime lastDate;
  final bool isDark;
  final String Function(int value) digitBuilder;
  final ValueChanged<int> onDaySelected;

  @override
  Widget build(BuildContext context) {
    final weekdayLabels = context.isArabicLanguage
        ? const ['س', 'ح', 'ن', 'ت', 'ر', 'خ', 'ج']
        : const ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    final firstOfMonth = DateTime(visibleMonth.year, visibleMonth.month);
    final leadingEmptyDays = (firstOfMonth.weekday + 1) % 7;
    final daysInMonth = DateUtils.getDaysInMonth(
      visibleMonth.year,
      visibleMonth.month,
    );
    final totalCells = ((leadingEmptyDays + daysInMonth + 6) ~/ 7) * 7;

    return Column(
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 7,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 1.25,
          ),
          itemBuilder: (context, index) {
            return Center(
              child: Text(
                weekdayLabels[index],
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: mutedColor,
                  fontWeight: FontWeight.w900,
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 4),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: totalCells,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 1.08,
            crossAxisSpacing: 4,
            mainAxisSpacing: 4,
          ),
          itemBuilder: (context, index) {
            final day = index - leadingEmptyDays + 1;
            if (day < 1 || day > daysInMonth) {
              return const SizedBox.shrink();
            }

            final date = DateTime(visibleMonth.year, visibleMonth.month, day);
            final enabled =
                !date.isBefore(firstDate) && !date.isAfter(lastDate);
            final selected = DateUtils.isSameDay(date, selectedDate);
            final today = DateUtils.isSameDay(date, DateTime.now());

            return _BirthDateDayCell(
              day: digitBuilder(day),
              enabled: enabled,
              selected: selected,
              today: today,
              isDark: isDark,
              onTap: enabled ? () => onDaySelected(day) : null,
            );
          },
        ),
      ],
    );
  }
}

class _BirthDateDayCell extends StatelessWidget {
  const _BirthDateDayCell({
    required this.day,
    required this.enabled,
    required this.selected,
    required this.today,
    required this.isDark,
    required this.onTap,
  });

  final String day;
  final bool enabled;
  final bool selected;
  final bool today;
  final bool isDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final borderColor = today
        ? AppColors.primary.withValues(alpha: 0.55)
        : Colors.transparent;

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Center(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: selected ? AppColors.primary : Colors.transparent,
              shape: BoxShape.circle,
              border: Border.all(color: borderColor, width: today ? 1.2 : 0),
            ),
            child: Center(
              child: Text(
                day,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: selected
                      ? Colors.white
                      : enabled
                      ? textColor
                      : mutedColor.withValues(alpha: 0.35),
                  fontWeight: selected ? FontWeight.w900 : FontWeight.w800,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
