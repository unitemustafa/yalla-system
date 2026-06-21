import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../../core/utils/validators.dart';
import '../auth_error_localizer.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../widgets/auth_status_artwork.dart';
import '../widgets/auth_top_bar.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/password_strength_meter.dart';

class PasswordResetSentView extends StatefulWidget {
  const PasswordResetSentView({super.key, required this.email});

  final String email;

  @override
  State<PasswordResetSentView> createState() => _PasswordResetSentViewState();
}

class _PasswordResetSentViewState extends State<PasswordResetSentView> {
  static const _baseCooldownSeconds = 30;

  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmationController = TextEditingController();
  Timer? _resendTimer;
  int _nextCooldownSeconds = _baseCooldownSeconds;
  int _remainingSeconds = 0;
  bool _isResending = false;
  bool _obscurePassword = true;
  bool _obscureConfirmation = true;

  bool get _isCoolingDown => _remainingSeconds > 0;

  @override
  void dispose() {
    _resendTimer?.cancel();
    _codeController.dispose();
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (Validators.passwordStrength(_passwordController.text) !=
        PasswordStrength.strong) {
      CustomSnackBar.showWarning(
        context: context,
        title: _copy(ar: 'كلمة المرور غير مكتملة', en: 'Weak password'),
        message: _copy(
          ar: 'كمّل شروط كلمة المرور قبل المتابعة.',
          en: 'Complete all password requirements before continuing.',
        ),
      );
      return;
    }

    await context.read<AuthCubit>().resetPassword(
      email: widget.email,
      code: _codeController.text,
      password: _passwordController.text,
      passwordConfirmation: _confirmationController.text,
    );
  }

  Future<void> _resend() async {
    if (_isCoolingDown || _isResending) return;
    setState(() => _isResending = true);
    final sent = await context.read<AuthCubit>().requestPasswordReset(
      widget.email,
    );
    if (!mounted) return;
    setState(() => _isResending = false);
    if (!sent) return;

    CustomSnackBar.showSuccess(
      context: context,
      title: _copy(ar: 'تم إرسال الكود', en: 'Code sent'),
      message: _copy(
        ar: 'أرسلنا كودًا جديدًا إلى بريدك الإلكتروني.',
        en: 'We sent a new code to your email.',
      ),
    );
    _startCooldown();
  }

  void _startCooldown() {
    final cooldown = _nextCooldownSeconds;
    setState(() {
      _nextCooldownSeconds *= 2;
      _remainingSeconds = cooldown;
    });
    _resendTimer?.cancel();
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || _remainingSeconds <= 1) {
        timer.cancel();
        if (mounted) setState(() => _remainingSeconds = 0);
        return;
      }
      setState(() => _remainingSeconds--);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return BlocConsumer<AuthCubit, AuthState>(
      listenWhen: (_, current) =>
          current is AuthPasswordResetSucceeded || current is AuthFailure,
      listener: (context, state) {
        if (state is AuthPasswordResetSucceeded) {
          CustomSnackBar.showSuccess(
            context: context,
            title: _copy(
              ar: 'تم تغيير كلمة المرور',
              en: 'Password changed',
            ),
            message: _copy(
              ar: 'تقدر الآن تسجل الدخول بكلمة المرور الجديدة.',
              en: 'You can now sign in with your new password.',
            ),
          );
          Navigator.pushNamedAndRemoveUntil(
            context,
            AppRoutes.login,
            (route) => false,
          );
        } else if (state is AuthFailure) {
          CustomSnackBar.showError(
            context: context,
            title: _copy(
              ar: 'تعذر تغيير كلمة المرور',
              en: 'Password reset failed',
            ),
            message: localizeAuthError(context, state.message),
          );
        }
      },
      builder: (context, state) {
        final isLoading = state is AuthLoading;
        return Scaffold(
          body: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: isDark
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
              ),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 430),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          AuthTopBar(
                            showClose: true,
                            onClose: () => Navigator.pushNamedAndRemoveUntil(
                              context,
                              AppRoutes.login,
                              (route) => false,
                            ),
                          ),
                          const SizedBox(height: 24),
                          AuthStatusArtwork(
                            icon: AppIcons.sms_tracking,
                            isDark: isDark,
                          ),
                          const SizedBox(height: 24),
                          Text(
                            _copy(
                              ar: 'غيّر كلمة المرور',
                              en: 'Reset your password',
                            ),
                            textAlign: TextAlign.center,
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            _copy(
                              ar: 'اكتب الكود المرسل إلى ${widget.email} ثم اختر كلمة مرور جديدة.',
                              en:
                                  'Enter the code sent to ${widget.email}, then choose a new password.',
                            ),
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 28),
                          CustomTextField(
                            controller: _codeController,
                            labelText: _copy(
                              ar: 'كود التأكيد',
                              en: 'Verification code',
                            ),
                            prefixIcon: AppIcons.sms,
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(6),
                            ],
                            validator: (value) =>
                                RegExp(r'^\d{6}$').hasMatch(value ?? '')
                                ? null
                                : _copy(
                                    ar: 'اكتب الكود المكوّن من 6 أرقام',
                                    en: 'Enter the 6-digit code',
                                  ),
                          ),
                          CustomTextField(
                            controller: _passwordController,
                            labelText: _copy(
                              ar: 'كلمة المرور الجديدة',
                              en: 'New password',
                            ),
                            prefixIcon: AppIcons.password_check,
                            obscureText: _obscurePassword,
                            suffixIcon: _obscurePassword
                                ? AppIcons.eye_slash
                                : AppIcons.eye,
                            onSuffixIconPressed: () => setState(
                              () => _obscurePassword = !_obscurePassword,
                            ),
                            validator: Validators.password,
                          ),
                          PasswordStrengthMeter(
                            controller: _passwordController,
                          ),
                          CustomTextField(
                            controller: _confirmationController,
                            labelText: _copy(
                              ar: 'تأكيد كلمة المرور',
                              en: 'Confirm password',
                            ),
                            prefixIcon: AppIcons.password_check,
                            obscureText: _obscureConfirmation,
                            suffixIcon: _obscureConfirmation
                                ? AppIcons.eye_slash
                                : AppIcons.eye,
                            onSuffixIconPressed: () => setState(
                              () =>
                                  _obscureConfirmation = !_obscureConfirmation,
                            ),
                            validator: (value) {
                              if ((value ?? '').isEmpty) {
                                return AppTranslations.current.fieldRequired;
                              }
                              if (value != _passwordController.text) {
                                return _copy(
                                  ar: 'كلمتا المرور غير متطابقتين',
                                  en: 'Passwords do not match',
                                );
                              }
                              return null;
                            },
                          ),
                          AppActionButton(
                            label: _copy(
                              ar: 'حفظ كلمة المرور',
                              en: 'Save password',
                            ),
                            isLoading: isLoading,
                            onPressed: isLoading ? null : _submit,
                          ),
                          const SizedBox(height: 10),
                          TextButton(
                            onPressed:
                                _isCoolingDown || _isResending || isLoading
                                ? null
                                : _resend,
                            child: Text(
                              _isCoolingDown
                                  ? _copy(
                                      ar:
                                          'إعادة الإرسال خلال $_remainingSeconds ثانية',
                                      en:
                                          'Resend in $_remainingSeconds seconds',
                                    )
                                  : _copy(
                                      ar: 'إعادة إرسال الكود',
                                      en: 'Resend code',
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  String _copy({required String ar, required String en}) {
    return context.isArabicLanguage ? ar : en;
  }
}
