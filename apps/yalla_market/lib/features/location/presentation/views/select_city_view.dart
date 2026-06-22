import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/icons/app_icons.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../auth/presentation/cubit/auth_state.dart';
import '../../../store/presentation/cubit/product_catalog_cubit.dart';
import '../../../store/presentation/cubit/product_discovery_cubit.dart';
import '../../data/datasources/location_preferences.dart';
import '../../domain/entities/city_data.dart';
import '../cubit/location_cubit.dart';
import '../cubit/location_state.dart';
import '../widgets/city_selection_panel.dart';

class SelectCityView extends StatefulWidget {
  const SelectCityView({super.key});

  @override
  State<SelectCityView> createState() => _SelectCityViewState();
}

class _SelectCityViewState extends State<SelectCityView>
    with SingleTickerProviderStateMixin {
  static const _gpsFallbackTimeout = Duration(seconds: 8);

  late final AnimationController _radarController;
  LocationChoiceMode _choiceMode = LocationChoiceMode.automatic;
  bool _unsupportedDetected = false;
  bool _showRadar = false;
  int _activeLocationRequestId = 0;

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    )..repeat();
  }

  @override
  void dispose() {
    _radarController.dispose();
    super.dispose();
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
        child: BlocBuilder<LocationCubit, LocationState>(
          builder: (context, state) {
            return LayoutBuilder(
              builder: (context, constraints) {
                final maxWidth = constraints.maxWidth >= 640
                    ? 480.0
                    : constraints.maxWidth;

                return SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(maxWidth: maxWidth),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 220),
                            child: _showRadar
                                ? Center(
                                    key: const ValueKey('location-radar'),
                                    child: _RadarGraphic(
                                      controller: _radarController,
                                      isDark: isDark,
                                    ),
                                  )
                                : const SizedBox.shrink(
                                    key: ValueKey('location-radar-hidden'),
                                  ),
                          ),
                          if (_showRadar)
                            const SizedBox(height: 28)
                          else
                            const SizedBox(height: 4),
                          Text(
                            context.tr('Choose your city'),
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            context.tr(
                              'Choose manually or let GPS detect your area.',
                            ),
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.lightTextSecondary,
                                  height: 1.55,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                          const SizedBox(height: 18),
                          _LocationBenefits(isDark: isDark),
                          if (_unsupportedDetected) ...[
                            const SizedBox(height: 16),
                            _GateError(
                              message:
                                  'We could not detect a supported governorate. Choose one manually.',
                              isDark: isDark,
                            ),
                          ],
                          const SizedBox(height: 22),
                          CitySelectionPanel(
                            state: state,
                            compact: true,
                            mode: _choiceMode,
                            onModeChanged: _setChoiceMode,
                            onCitySelected: (city) =>
                                _selectCityAndContinue(context, city),
                            onUseCurrentLocation: () =>
                                _detectCurrentLocation(context),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  void _setChoiceMode(LocationChoiceMode mode) {
    setState(() {
      _choiceMode = mode;
      _showRadar = false;
      _unsupportedDetected = false;
    });
    if (mode == LocationChoiceMode.manual) {
      _activeLocationRequestId++;
    }
  }

  Future<void> _detectCurrentLocation(BuildContext context) async {
    final requestId = ++_activeLocationRequestId;
    setState(() {
      _choiceMode = LocationChoiceMode.automatic;
      _showRadar = true;
      _unsupportedDetected = false;
    });

    final timeout = Timer(_gpsFallbackTimeout, () {
      if (!mounted || requestId != _activeLocationRequestId) return;
      _activeLocationRequestId++;
      setState(() {
        _choiceMode = LocationChoiceMode.manual;
        _showRadar = false;
        _unsupportedDetected = false;
      });
      CustomSnackBar.showPersistentWarning(
        context: context,
        title: 'Location is taking too long',
        message: 'Choose your area manually and you can try GPS again later.',
        actionLabel: 'Close',
      );
    });

    final detectedCity = await context
        .read<LocationCubit>()
        .detectCurrentLocation();
    timeout.cancel();
    if (!context.mounted || requestId != _activeLocationRequestId) return;
    if (detectedCity == null) {
      setState(() {
        _choiceMode = LocationChoiceMode.manual;
        _unsupportedDetected = false;
        _showRadar = false;
      });
      CustomSnackBar.showPersistentWarning(
        context: context,
        title: 'Could not use your current location.',
        message: 'Choose your area manually and you can try GPS again later.',
        actionLabel: 'Close',
      );
      return;
    }

    final hasNamedGeneral = detectedCity.isNamedGeneral;
    if (detectedCity.isGeneral && !hasNamedGeneral) {
      setState(() {
        _unsupportedDetected = true;
        _showRadar = false;
        _choiceMode = LocationChoiceMode.manual;
      });
      return;
    }

    final confirmed = await _showDetectedRegionDialog(context, detectedCity);
    if (!context.mounted || requestId != _activeLocationRequestId) return;
    if (confirmed == true) {
      await _selectCityAndContinue(
        context,
        detectedCity,
        source: detectedCity.source,
      );
      return;
    }

    setState(() {
      _unsupportedDetected = false;
      _choiceMode = LocationChoiceMode.manual;
      _showRadar = false;
    });
  }

  Future<bool?> _showDetectedRegionDialog(BuildContext context, CityData city) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final locationName = city.displayName(arabic: context.isArabicLanguage);

    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          title: Text(
            context.tr('We detected your governorate'),
            textAlign: TextAlign.center,
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: isDark ? 0.18 : 0.10,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  AppIcons.location,
                  color: AppColors.primary,
                  size: 26,
                ),
              ),
              const SizedBox(height: 12),
              _DetectedLocationBadge(label: locationName, isDark: isDark),
              const SizedBox(height: 14),
              Text(
                context.tr('Is this your governorate?'),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  height: 1.35,
                ),
              ),
            ],
          ),
          actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          actions: [
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context, false),
                    icon: const Icon(AppIcons.edit, size: 17),
                    label: Text(context.tr('Change')),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.pop(context, true),
                    icon: const Icon(AppIcons.tick_circle, size: 17),
                    label: Text(context.tr('Yes, continue')),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Future<void> _selectCityAndContinue(
    BuildContext context,
    CityData city, {
    RegionSource source = RegionSource.manual,
  }) async {
    final selectedCity = await context.read<LocationCubit>().selectCity(
      city,
      source: source,
    );
    if (!context.mounted || selectedCity == null) return;

    final authState = context.read<AuthCubit>().state;
    if (authState is AuthAuthenticated) {
      await LocationPreferences().setSelectedCityUserId(
        authState.session.user.id,
      );
    }
    if (!context.mounted) return;

    await context.read<ProductCatalogCubit>().loadProducts(force: true);
    if (!context.mounted) return;
    await context.read<ProductDiscoveryCubit>().loadDiscovery(force: true);
    if (!context.mounted) return;

    CustomSnackBar.showSuccess(
      context: context,
      title: selectedCity.isGeneral ? 'General region saved' : 'Region saved',
      message: selectedCity.isGeneral
          ? 'You will see general products and offers.'
          : 'Products and offers will refresh for your region.',
    );
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.navigationMenu,
      (route) => false,
    );
  }
}

// ignore: unused_element
class _DetectedGovernorateCard extends StatelessWidget {
  const _DetectedGovernorateCard({
    required this.city,
    required this.isDark,
    required this.onConfirm,
    required this.onChange,
  });

  final CityData city;
  final bool isDark;
  final VoidCallback? onConfirm;
  final VoidCallback? onChange;

  @override
  Widget build(BuildContext context) {
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final isCustomCity = city.isNamedGeneral;
    final locationName = city.displayName(arabic: context.isArabicLanguage);
    final detectedTitle = isCustomCity
        ? (context.isArabicLanguage ? 'حددنا مدينتك' : 'We detected your city')
        : context.tr('We detected your governorate');
    final confirmQuestion = isCustomCity
        ? (context.isArabicLanguage ? 'هل دي مدينتك؟' : 'Is this your city?')
        : context.tr('Is this your governorate?');

    final card = Container(
      width: double.infinity,
      padding: EdgeInsets.all(isCustomCity ? 16 : 14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCardColor : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: isDark ? 0.28 : 0.18),
        ),
      ),
      child: Column(
        mainAxisAlignment: isCustomCity
            ? MainAxisAlignment.center
            : MainAxisAlignment.start,
        crossAxisAlignment: isCustomCity
            ? CrossAxisAlignment.center
            : CrossAxisAlignment.start,
        children: [
          Text(
            detectedTitle,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: mutedColor,
              fontWeight: FontWeight.w800,
            ),
            textAlign: isCustomCity ? TextAlign.center : TextAlign.start,
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: isCustomCity
                ? MainAxisAlignment.center
                : MainAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: isDark ? 0.18 : 0.10,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  AppIcons.location,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Flexible(
                child: _DetectedLocationBadge(
                  label: locationName,
                  isDark: isDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            confirmQuestion,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: mutedColor,
              fontWeight: FontWeight.w700,
            ),
            textAlign: isCustomCity ? TextAlign.center : TextAlign.start,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: AppActionButton(
                  label: 'Yes, continue',
                  icon: AppIcons.tick_circle,
                  onPressed: onConfirm,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppActionButton(
                  label: 'Change',
                  icon: AppIcons.edit,
                  variant: AppActionButtonVariant.outlined,
                  onPressed: onChange,
                ),
              ),
            ],
          ),
        ],
      ),
    );

    if (!isCustomCity) return card;

    return Center(child: SizedBox(width: 300, height: 300, child: card));
  }
}

class _DetectedLocationBadge extends StatelessWidget {
  const _DetectedLocationBadge({required this.label, required this.isDark});

  final String label;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 190),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: isDark ? 0.18 : 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: AppColors.warning,
          fontWeight: FontWeight.w900,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }
}

class _RadarGraphic extends StatelessWidget {
  const _RadarGraphic({required this.controller, required this.isDark});

  final Animation<double> controller;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      height: 220,
      child: AnimatedBuilder(
        animation: controller,
        builder: (context, _) {
          return CustomPaint(
            painter: _RadarPainter(progress: controller.value, isDark: isDark),
            child: Center(
              child: Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.35),
                      blurRadius: 28,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Icon(
                  AppIcons.location,
                  color: Colors.white,
                  size: 34,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _RadarPainter extends CustomPainter {
  _RadarPainter({required this.progress, required this.isDark});

  final double progress;
  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final primary = AppColors.primary;
    final ringPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..color = primary.withValues(alpha: isDark ? 0.28 : 0.18);

    for (final radius in [54.0, 82.0, 110.0]) {
      canvas.drawCircle(center, radius, ringPaint);
    }

    final sweepPaint = Paint()
      ..shader = SweepGradient(
        startAngle: -math.pi / 2,
        endAngle: math.pi * 1.5,
        colors: [
          primary.withValues(alpha: 0.0),
          primary.withValues(alpha: 0.08),
          primary.withValues(alpha: 0.42),
        ],
        stops: const [0.0, 0.72, 1.0],
        transform: GradientRotation(progress * math.pi * 2),
      ).createShader(Rect.fromCircle(center: center, radius: 110));

    canvas.drawCircle(center, 110, sweepPaint);
  }

  @override
  bool shouldRepaint(covariant _RadarPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.isDark != isDark;
  }
}

class _LocationBenefits extends StatelessWidget {
  const _LocationBenefits({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final items = [
      'Products that fit your region',
      'Nearby offers',
      'Better delivery experience',
      'More accurate delivery price later',
    ];

    return Container(
      padding: const EdgeInsets.all(14),
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
          for (var index = 0; index < items.length; index++) ...[
            Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(
                      alpha: isDark ? 0.18 : 0.10,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    AppIcons.tick_circle,
                    color: AppColors.primary,
                    size: 17,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    context.tr(items[index]),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
            if (index != items.length - 1) const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _GateError extends StatelessWidget {
  const _GateError({required this.message, required this.isDark});

  final String message;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: isDark ? 0.18 : 0.10),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.20)),
      ),
      child: Text(
        context.tr(message),
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
          color: AppColors.error,
          height: 1.4,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
