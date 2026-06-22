import 'dart:async';

import 'package:flutter/material.dart';
import 'package:yalla_market/core/localization/app_translations.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../location/presentation/cubit/location_cubit.dart';
import '../cubit/splash_cubit.dart';
import '../cubit/splash_state.dart';
import '../../../../core/routing/app_route_arguments.dart';

class SplashView extends StatefulWidget {
  const SplashView({super.key});

  @override
  State<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends State<SplashView> with TickerProviderStateMixin {
  late final AnimationController _entranceController;
  late final AnimationController _activityController;
  late final Animation<double> _logoOpacity;
  late final Animation<double> _logoScale;
  late final Animation<Offset> _logoSlide;
  late final Animation<double> _titleOpacity;
  late final Animation<Offset> _titleSlide;
  late final Animation<double> _loadingOpacity;
  Timer? _navigationTimer;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1150),
    );
    _activityController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1050),
    );

    _logoOpacity = CurvedAnimation(
      parent: _entranceController,
      curve: const Interval(0.0, 0.38, curve: Curves.easeOut),
    );
    _logoScale = Tween<double>(begin: 0.82, end: 1).animate(
      CurvedAnimation(
        parent: _entranceController,
        curve: const Interval(0.0, 0.58, curve: Curves.easeOutBack),
      ),
    );
    _logoSlide = Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _entranceController,
            curve: const Interval(0.0, 0.58, curve: Curves.easeOutCubic),
          ),
        );
    _titleOpacity = CurvedAnimation(
      parent: _entranceController,
      curve: const Interval(0.36, 0.78, curve: Curves.easeOut),
    );
    _titleSlide = Tween<Offset>(begin: const Offset(0, 0.28), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _entranceController,
            curve: const Interval(0.36, 0.78, curve: Curves.easeOutCubic),
          ),
        );
    _loadingOpacity = CurvedAnimation(
      parent: _entranceController,
      curve: const Interval(0.68, 1.0, curve: Curves.easeOut),
    );

    _entranceController.forward();
    _activityController.repeat();
    _navigationTimer = Timer(
      const Duration(milliseconds: 1500),
      () => context.read<SplashCubit>().determineStartupRoute(),
    );
  }

  @override
  void dispose() {
    _navigationTimer?.cancel();
    _activityController.dispose();
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.58)
        : AppColors.lightTextSecondary;

    return BlocListener<SplashCubit, SplashState>(
      listener: (context, state) {
        if (state is! SplashNavigateTo) return;
        if (state.session != null) {
          context.read<AuthCubit>().hydrate(state.session!);
        }
        if (state.city != null) {
          context.read<LocationCubit>().syncCity(state.city);
        }
        Navigator.of(context).pushReplacementNamed(
          state.route,
          arguments: state.showSessionExpiredNotice
              ? const LoginRouteArgs(showSessionExpiredNotice: true)
              : null,
        );
      },
      child: Scaffold(
        body: DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: isDarkMode
                  ? const [Color(0xFF101116), AppColors.darkBackground]
                  : const [Colors.white, Color(0xFFF3F6FF)],
            ),
          ),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FadeTransition(
                    opacity: _logoOpacity,
                    child: SlideTransition(
                      position: _logoSlide,
                      child: ScaleTransition(
                        scale: _logoScale,
                        child: _AnimatedLogoMark(
                          animation: _activityController,
                          isDarkMode: isDarkMode,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  FadeTransition(
                    opacity: _titleOpacity,
                    child: SlideTransition(
                      position: _titleSlide,
                      child: Column(
                        children: [
                          Text(
                            'Yalla Market',
                            style: Theme.of(context).textTheme.headlineMedium
                                ?.copyWith(
                                  color: textColor,
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0,
                                ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            context.tr('Fresh deals are loading'),
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(
                                  color: mutedColor,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                  FadeTransition(
                    opacity: _loadingOpacity,
                    child: _LoadingDots(
                      animation: _activityController,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AnimatedLogoMark extends StatelessWidget {
  const _AnimatedLogoMark({required this.animation, required this.isDarkMode});

  final Animation<double> animation;
  final bool isDarkMode;

  @override
  Widget build(BuildContext context) {
    final logoAsset = AppAssets.appIconLogo;
    final panelColor = isDarkMode ? AppColors.darkCardColor : Colors.white;
    final borderColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.08)
        : AppColors.primary.withValues(alpha: 0.10);

    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        final pulse = Curves.easeInOut.transform(animation.value);
        final haloSize = 134.0 + (pulse * 14);

        return SizedBox(
          width: 168,
          height: 168,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: haloSize,
                height: haloSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.primary.withValues(
                      alpha: isDarkMode ? 0.16 : 0.12,
                    ),
                    width: 1.4,
                  ),
                ),
              ),
              Container(
                width: 112,
                height: 112,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: panelColor,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(
                        alpha: isDarkMode ? 0.20 : 0.14,
                      ),
                      blurRadius: 32,
                      offset: const Offset(0, 18),
                    ),
                  ],
                ),
                child: child,
              ),
            ],
          ),
        );
      },
      child: AppImage(
        source: logoAsset,
        fit: BoxFit.contain,
        cacheWidth: 224,
        cacheHeight: 224,
      ),
    );
  }
}

class _LoadingDots extends StatelessWidget {
  const _LoadingDots({required this.animation, required this.color});

  final Animation<double> animation;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            final phase = (animation.value + (index * 0.18)) % 1.0;
            final scale = 0.72 + (Curves.easeInOut.transform(phase) * 0.36);
            final opacity = 0.36 + (Curves.easeInOut.transform(phase) * 0.54);

            return Transform.scale(
              scale: scale,
              child: Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: color.withValues(alpha: opacity),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}
