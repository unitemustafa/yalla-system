import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';

class AuthStatusArtwork extends StatelessWidget {
  const AuthStatusArtwork({
    super.key,
    required this.icon,
    required this.isDark,
    this.accentColor = AppColors.primary,
  });

  final IconData icon;
  final bool isDark;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    final panelColor = isDark ? const Color(0xFF262838) : Colors.white;
    final panelBorder = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : accentColor.withValues(alpha: 0.12);
    final shadowColor = isDark
        ? Colors.black.withValues(alpha: 0.24)
        : accentColor.withValues(alpha: 0.12);

    return SizedBox(
      width: 210,
      height: 190,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 12,
            child: Container(
              width: 180,
              height: 126,
              decoration: BoxDecoration(
                color: panelColor,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: panelBorder),
                boxShadow: [
                  BoxShadow(
                    color: shadowColor,
                    blurRadius: 30,
                    offset: const Offset(0, 18),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            top: 34,
            right: 28,
            child: _FloatingIcon(
              icon: AppIcons.send_1,
              isDark: isDark,
              color: accentColor,
            ),
          ),
          Positioned(
            top: 48,
            left: 30,
            child: _FloatingIcon(
              icon: AppIcons.security_safe,
              isDark: isDark,
              color: AppColors.success,
            ),
          ),
          Positioned(
            bottom: 0,
            child: Container(
              width: 104,
              height: 104,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: accentColor,
                boxShadow: [
                  BoxShadow(
                    color: accentColor.withValues(alpha: 0.28),
                    blurRadius: 30,
                    offset: const Offset(0, 16),
                  ),
                ],
              ),
              child: Icon(icon, size: 48, color: Colors.white),
            ),
          ),
          Positioned(
            right: 58,
            bottom: 24,
            child: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark ? AppColors.darkCardColor : Colors.white,
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.10)
                      : Colors.white,
                  width: 2,
                ),
              ),
              child: const Icon(
                AppIcons.tick_circle,
                size: 18,
                color: AppColors.success,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FloatingIcon extends StatelessWidget {
  const _FloatingIcon({
    required this.icon,
    required this.isDark,
    required this.color,
  });

  final IconData icon;
  final bool isDark;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.08)
            : color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(icon, size: 21, color: color),
    );
  }
}
