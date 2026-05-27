import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../home/presentation/views/home_view.dart';
import '../../../store/presentation/views/store_view.dart';
import '../../../wishlist/presentation/views/wishlist_view.dart';
import '../../../personalization/presentation/views/settings/settings_view.dart';

class NavigationMenuView extends StatefulWidget {
  const NavigationMenuView({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<NavigationMenuView> createState() => _NavigationMenuViewState();
}

class _NavigationMenuViewState extends State<NavigationMenuView> {
  late int selectedIndex;

  static const _items = [
    _NavigationItemData(
      label: 'Home',
      icon: AppIcons.home,
      activeIcon: AppIcons.home5,
    ),
    _NavigationItemData(
      label: 'Store',
      icon: AppIcons.shop,
      activeIcon: AppIcons.shop5,
    ),
    _NavigationItemData(
      label: 'Wishlist',
      icon: AppIcons.heart,
      activeIcon: AppIcons.heart5,
    ),
    _NavigationItemData(
      label: 'Profile',
      icon: AppIcons.profile_circle,
      activeIcon: AppIcons.profile_circle5,
    ),
  ];

  final screens = [
    const HomeView(),
    const StoreView(), // Store
    const WishlistView(), // Wishlist
    const SettingsView(), // Profile
  ];

  @override
  void initState() {
    super.initState();
    selectedIndex = widget.initialIndex.clamp(0, screens.length - 1).toInt();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: selectedIndex, children: screens),
      bottomNavigationBar: _YallaBottomNavigationBar(
        items: _items,
        selectedIndex: selectedIndex,
        onSelected: (index) => setState(() => selectedIndex = index),
      ),
    );
  }
}

class _YallaBottomNavigationBar extends StatelessWidget {
  const _YallaBottomNavigationBar({
    required this.items,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<_NavigationItemData> items;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.06);

    return SafeArea(
      top: false,
      child: Container(
        height: 78,
        padding: const EdgeInsets.fromLTRB(8, 7, 8, 6),
        decoration: BoxDecoration(
          color: backgroundColor,
          border: Border(top: BorderSide(color: borderColor)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.20 : 0.08),
              blurRadius: 18,
              offset: const Offset(0, -8),
            ),
          ],
        ),
        child: Row(
          children: List.generate(items.length, (index) {
            return Expanded(
              child: _NavigationBarItem(
                item: items[index],
                isSelected: selectedIndex == index,
                onTap: () => onSelected(index),
              ),
            );
          }),
        ),
      ),
    );
  }
}

class _NavigationBarItem extends StatelessWidget {
  const _NavigationBarItem({
    required this.item,
    required this.isSelected,
    required this.onTap,
  });

  final _NavigationItemData item;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final inactiveColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final labelColor = isSelected ? AppColors.primary : inactiveColor;
    final indicatorColor = isSelected
        ? AppColors.primary.withValues(alpha: isDark ? 0.22 : 0.11)
        : Colors.transparent;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          height: double.infinity,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                curve: Curves.easeOut,
                width: 52,
                height: 32,
                decoration: BoxDecoration(
                  color: indicatorColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  isSelected ? item.activeIcon : item.icon,
                  color: labelColor,
                  size: 22,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                context.tr(item.label),
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: labelColor,
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavigationItemData {
  const _NavigationItemData({
    required this.label,
    required this.icon,
    required this.activeIcon,
  });

  final String label;
  final IconData icon;
  final IconData activeIcon;
}
