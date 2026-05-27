import 'dart:async';

import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/routing/app_routes.dart';
import '../widgets/auth_status_artwork.dart';
import '../widgets/auth_top_bar.dart';

class PasswordResetSentView extends StatefulWidget {
  final String email;

  const PasswordResetSentView({super.key, required this.email});

  @override
  State<PasswordResetSentView> createState() => _PasswordResetSentViewState();
}

class _PasswordResetSentViewState extends State<PasswordResetSentView> {
  static const int _baseCooldownSeconds = 30;

  Timer? _resendTimer;
  int _nextCooldownSeconds = _baseCooldownSeconds;
  int _remainingSeconds = 0;

  bool get _isCoolingDown => _remainingSeconds > 0;

  @override
  void dispose() {
    _resendTimer?.cancel();
    super.dispose();
  }

  void _onResend() {
    if (_isCoolingDown) return;

    // Keep resend cooldown local in the prototype.
    final cooldownSeconds = _nextCooldownSeconds;

    setState(() {
      _nextCooldownSeconds *= 2;
      _remainingSeconds = cooldownSeconds;
    });

    _resendTimer?.cancel();
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (_remainingSeconds <= 1) {
        timer.cancel();
        setState(() => _remainingSeconds = 0);
        return;
      }

      setState(() => _remainingSeconds--);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return Scaffold(
      body: DecoratedBox(
        decoration: _buildBackgroundDecoration(isDarkMode),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final minHeight = (constraints.maxHeight - 20).clamp(
                0.0,
                double.infinity,
              );

              return SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: minHeight),
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 430),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          AuthTopBar(
                            showClose: true,
                            onClose: () {
                              Navigator.pushNamedAndRemoveUntil(
                                context,
                                AppRoutes.login,
                                (route) => false,
                              );
                            },
                          ),
                          const SizedBox(height: 34),
                          _buildIllustration(isDarkMode),
                          const SizedBox(height: 34),
                          _buildMessage(context, theme, isDarkMode),
                          const SizedBox(height: 32),
                          _buildDoneButton(context),
                          const SizedBox(height: 14),
                          _buildResendButton(theme, isDarkMode),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  BoxDecoration _buildBackgroundDecoration(bool isDarkMode) {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: isDarkMode
            ? const [
                Color(0xFF111214),
                AppColors.darkBackground,
                Color(0xFF171717),
              ]
            : const [
                Color(0xFFF3F6FF),
                AppColors.lightBackground,
                Color(0xFFFAFBFF),
              ],
        stops: const [0, 0.45, 1],
      ),
    );
  }

  Widget _buildIllustration(bool isDarkMode) {
    return AuthStatusArtwork(icon: AppIcons.sms_tracking, isDark: isDarkMode);
  }

  Widget _buildMessage(BuildContext context, ThemeData theme, bool isDarkMode) {
    final strings = AppTranslations.of(context);
    final titleColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final subtitleColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.58)
        : Colors.black.withValues(alpha: 0.56);

    return Column(
      children: [
        Text(
          strings.passwordResetTitle,
          textAlign: TextAlign.center,
          style: theme.textTheme.titleLarge?.copyWith(
            color: titleColor,
            fontSize: 24,
            height: 1.18,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 14),
        _buildEmailBadge(theme, isDarkMode),
        const SizedBox(height: 16),
        Text(
          strings.passwordResetDesc,
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: subtitleColor,
            fontSize: 14.5,
            height: 1.55,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildEmailBadge(ThemeData theme, bool isDarkMode) {
    final backgroundColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.06)
        : AppColors.primary.withValues(alpha: 0.08);
    final borderColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.10)
        : AppColors.primary.withValues(alpha: 0.16);
    final textColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;

    return Align(
      alignment: Alignment.center,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 330),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(AppIcons.sms, size: 18, color: theme.colorScheme.primary),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  widget.email,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: textColor,
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDoneButton(BuildContext context) {
    return AppActionButton(
      label: AppStrings.done,
      onPressed: () {
        Navigator.pushNamedAndRemoveUntil(
          context,
          AppRoutes.login,
          (route) => false,
        );
      },
    );
  }

  Widget _buildResendButton(ThemeData theme, bool isDarkMode) {
    final label = _isCoolingDown
        ? context.isArabicLanguage
              ? 'إعادة الإرسال خلال ${_formatCooldown(_remainingSeconds)}'
              : 'Resend in ${_formatCooldown(_remainingSeconds)}'
        : AppStrings.resendEmail;
    final enabledColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.78)
        : AppColors.lightTextPrimary;
    final disabledColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.34)
        : Colors.black.withValues(alpha: 0.34);

    return TextButton(
      onPressed: _isCoolingDown ? null : _onResend,
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        disabledForegroundColor: disabledColor,
      ),
      child: Text(
        context.tr(label),
        style: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w800,
          color: _isCoolingDown ? disabledColor : enabledColor,
        ),
      ),
    );
  }

  String _formatCooldown(int seconds) {
    if (seconds < 60) return '${seconds}s';

    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes}m ${remainingSeconds.toString().padLeft(2, '0')}s';
  }
}
