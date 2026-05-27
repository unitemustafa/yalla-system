import 'package:flutter/material.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../domain/entities/onboarding_model.dart';

class OnboardingPageItem extends StatelessWidget {
  final OnboardingModel model;
  final Color accentColor;
  final IconData icon;
  final int pageNumber;
  final int totalPages;

  const OnboardingPageItem({
    super.key,
    required this.model,
    required this.accentColor,
    required this.icon,
    required this.pageNumber,
    required this.totalPages,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final textColor = theme.colorScheme.onSurface;
    final mutedColor = textColor.withValues(alpha: 0.62);
    final panelColor = accentColor.withValues(alpha: isDarkMode ? 0.16 : 0.09);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompactHeight = constraints.maxHeight < 560;
        final isVeryCompactHeight = constraints.maxHeight < 480;
        final isNarrow = constraints.maxWidth < 360;
        final horizontalPadding = isNarrow ? 16.0 : 24.0;
        final imageFlex = isVeryCompactHeight
            ? 4
            : isCompactHeight
            ? 5
            : 6;
        final contentFlex = isCompactHeight ? 5 : 4;
        final maxContentWidth = constraints.maxWidth >= 600
            ? 560.0
            : constraints.maxWidth;

        return Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxContentWidth),
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                6,
                horizontalPadding,
                0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    flex: imageFlex,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: panelColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Stack(
                        children: [
                          PositionedDirectional(
                            top: 14,
                            start: 14,
                            child: _StepBadge(
                              icon: icon,
                              accentColor: accentColor,
                              label: '$pageNumber/$totalPages',
                            ),
                          ),
                          Positioned.fill(
                            child: Padding(
                              padding: EdgeInsets.fromLTRB(
                                isNarrow ? 18 : 28,
                                isCompactHeight ? 42 : 54,
                                isNarrow ? 18 : 28,
                                isCompactHeight ? 18 : 28,
                              ),
                              child: AppImage(
                                source: model.imagePath,
                                fit: BoxFit.contain,
                                cacheWidth: 760,
                                cacheHeight: 760,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                    height: isVeryCompactHeight
                        ? 14
                        : isCompactHeight
                        ? 18
                        : 30,
                  ),
                  Expanded(
                    flex: contentFlex,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: isCompactHeight
                          ? MainAxisAlignment.start
                          : MainAxisAlignment.center,
                      children: [
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 240),
                          switchInCurve: Curves.easeOut,
                          switchOutCurve: Curves.easeIn,
                          child: Text(
                            model.title,
                            key: ValueKey(model.title),
                            textAlign: TextAlign.center,
                            style: theme.textTheme.headlineLarge?.copyWith(
                              color: textColor,
                              fontSize: isVeryCompactHeight
                                  ? 22
                                  : isCompactHeight
                                  ? 24
                                  : 28,
                              height: 1.16,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 240),
                          child: ConstrainedBox(
                            key: ValueKey(model.description),
                            constraints: const BoxConstraints(maxWidth: 330),
                            child: Text(
                              model.description,
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: mutedColor,
                                fontSize: isVeryCompactHeight ? 14 : 15,
                                height: 1.5,
                                letterSpacing: 0,
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
          ),
        );
      },
    );
  }
}

class _StepBadge extends StatelessWidget {
  final IconData icon;
  final Color accentColor;
  final String label;

  const _StepBadge({
    required this.icon,
    required this.accentColor,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final backgroundColor = isDarkMode
        ? Colors.black.withValues(alpha: 0.28)
        : Colors.white.withValues(alpha: 0.88);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: accentColor.withValues(alpha: 0.22)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: accentColor, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface,
                fontWeight: FontWeight.w700,
                letterSpacing: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
