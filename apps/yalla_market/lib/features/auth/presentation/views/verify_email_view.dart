import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/routing/app_routes.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_status_artwork.dart';
import '../widgets/auth_top_bar.dart';

class VerifyEmailView extends StatefulWidget {
  const VerifyEmailView({super.key, required this.email});

  final String email;

  @override
  State<VerifyEmailView> createState() => _VerifyEmailViewState();
}

class _VerifyEmailViewState extends State<VerifyEmailView> {
  static const int _baseCooldownSeconds = 30;
  static const int _codeLength = 6;

  final TextEditingController _codeController = TextEditingController();
  final FocusNode _codeFocusNode = FocusNode();

  Timer? _resendTimer;
  int _nextCooldownSeconds = _baseCooldownSeconds;
  int _remainingSeconds = 0;
  bool _isConfirming = false;
  bool _isResending = false;

  bool get _isCoolingDown => _remainingSeconds > 0;
  bool get _hasCompleteCode => _codeController.text.length == _codeLength;

  @override
  void initState() {
    super.initState();
    _codeController.addListener(_refreshCodeState);
    _codeFocusNode.addListener(_refreshCodeState);
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    _codeController.removeListener(_refreshCodeState);
    _codeFocusNode.removeListener(_refreshCodeState);
    _codeController.dispose();
    _codeFocusNode.dispose();
    super.dispose();
  }

  void _refreshCodeState() {
    if (mounted) setState(() {});
  }

  Future<void> _onResend() async {
    if (_isCoolingDown || _isResending) return;

    final authCubit = context.read<AuthCubit>();
    if (!authCubit.hasPendingSignup) {
      _showExpiredSessionMessage();
      return;
    }

    setState(() => _isResending = true);
    final sent = await authCubit.resendSignupVerificationCode();
    if (!mounted) return;
    setState(() => _isResending = false);

    if (!sent) {
      CustomSnackBar.showError(
        context: context,
        title: _copy(context, ar: 'تعذر إرسال الكود', en: 'Code was not sent'),
        message: _copy(
          context,
          ar: 'حاول مرة تانية بعد لحظات.',
          en: 'Please try again in a moment.',
        ),
      );
      return;
    }

    CustomSnackBar.showSuccess(
      context: context,
      title: _copy(context, ar: 'تم إرسال الكود', en: 'Code sent'),
      message: _copy(
        context,
        ar: 'بعتنا كود تأكيد جديد على الإيميل.',
        en: 'We sent a new confirmation code to your email.',
      ),
    );

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

  Future<void> _onConfirm() async {
    if (!_hasCompleteCode || _isConfirming) return;

    final authCubit = context.read<AuthCubit>();
    if (!authCubit.hasPendingSignup) {
      _showExpiredSessionMessage();
      return;
    }

    setState(() => _isConfirming = true);
    final completed = await authCubit.completeSignupVerification(
      _codeController.text,
    );
    if (!mounted) return;
    setState(() => _isConfirming = false);

    if (!completed) {
      CustomSnackBar.showError(
        context: context,
        title: _copy(
          context,
          ar: 'تعذر تأكيد الإيميل',
          en: 'Email not verified',
        ),
        message: _copy(
          context,
          ar: 'راجع الكود وحاول مرة تانية.',
          en: 'Check the code and try again.',
        ),
      );
      return;
    }

    CustomSnackBar.showSuccess(
      context: context,
      title: _copy(context, ar: 'تم تأكيد الإيميل', en: 'Email verified'),
      message: _copy(
        context,
        ar: 'حسابك اتأكد. سجل دخولك عشان تكمل.',
        en: 'Your account is verified. Sign in to continue.',
      ),
    );
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.login,
      (route) => false,
    );
  }

  void _showExpiredSessionMessage() {
    CustomSnackBar.showError(
      context: context,
      title: _copy(context, ar: 'الجلسة انتهت', en: 'Session expired'),
      message: _copy(
        context,
        ar: 'اعمل الحساب من الأول عشان نكمل التأكيد.',
        en: 'Create the account again so we can finish verification.',
      ),
    );
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.signup,
      (route) => false,
    );
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
                            showBack: true,
                            onBack: () {
                              Navigator.pushNamedAndRemoveUntil(
                                context,
                                AppRoutes.signup,
                                (route) => false,
                              );
                            },
                          ),
                          const SizedBox(height: 24),
                          AuthStatusArtwork(
                            icon: AppIcons.sms_tracking,
                            isDark: isDarkMode,
                          ),
                          const SizedBox(height: 28),
                          _buildMessage(context, theme, isDarkMode),
                          const SizedBox(height: 26),
                          _buildCodeInput(theme, isDarkMode),
                          const SizedBox(height: 24),
                          _buildConfirmButton(context),
                          const SizedBox(height: 12),
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

  Widget _buildMessage(BuildContext context, ThemeData theme, bool isDarkMode) {
    final strings = AppTranslations.of(context);
    final titleColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final subtitleColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.62)
        : Colors.black.withValues(alpha: 0.58);

    return Column(
      children: [
        Text(
          strings.verifyEmailTitle,
          textAlign: TextAlign.center,
          style: theme.textTheme.titleLarge?.copyWith(
            color: titleColor,
            fontSize: 28,
            height: 1.12,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          _copy(
            context,
            ar: 'اكتب كود التأكيد المكوّن من 6 أرقام اللي بعتناه على الإيميل ده.',
            en: 'Enter the 6-digit confirmation code we sent to this email.',
          ),
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: subtitleColor,
            fontSize: 14.5,
            height: 1.55,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 18),
        _buildEmailBadge(theme, isDarkMode),
      ],
    );
  }

  Widget _buildEmailBadge(ThemeData theme, bool isDarkMode) {
    final email = widget.email.trim().isEmpty
        ? _copy(context, ar: 'إيميلك', en: 'your email')
        : widget.email.trim();
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
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Directionality(
            textDirection: TextDirection.ltr,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(AppIcons.sms, size: 18, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    email,
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
      ),
    );
  }

  Widget _buildCodeInput(ThemeData theme, bool isDarkMode) {
    final code = _codeController.text;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => _codeFocusNode.requestFocus(),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Directionality(
            textDirection: TextDirection.ltr,
            child: Row(
              children: List.generate(_codeLength, (index) {
                final digit = index < code.length ? code[index] : '';
                final isActive =
                    _codeFocusNode.hasFocus &&
                    (code.length == index ||
                        (code.length == _codeLength &&
                            index == _codeLength - 1));

                return Expanded(
                  child: Padding(
                    padding: EdgeInsetsDirectional.only(
                      start: index == 0 ? 0 : 4,
                      end: index == _codeLength - 1 ? 0 : 4,
                    ),
                    child: _CodeDigitBox(
                      digit: digit,
                      isActive: isActive,
                      isDarkMode: isDarkMode,
                    ),
                  ),
                );
              }),
            ),
          ),
          Positioned.fill(
            child: TextField(
              controller: _codeController,
              focusNode: _codeFocusNode,
              autofocus: true,
              showCursor: false,
              enableInteractiveSelection: false,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.done,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(_codeLength),
              ],
              style: const TextStyle(color: Colors.transparent, fontSize: 1),
              decoration: const InputDecoration(
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                disabledBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
                counterText: '',
                contentPadding: EdgeInsets.zero,
                isCollapsed: true,
              ),
              onSubmitted: (_) => _onConfirm(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfirmButton(BuildContext context) {
    return AppActionButton(
      label: _copy(context, ar: 'تأكيد الإيميل', en: 'Confirm email'),
      icon: AppIcons.tick_circle,
      isLoading: _isConfirming,
      onPressed: _hasCompleteCode && !_isConfirming ? _onConfirm : null,
    );
  }

  Widget _buildResendButton(ThemeData theme, bool isDarkMode) {
    final label = _isCoolingDown
        ? _copy(
            context,
            ar: 'إعادة الإرسال خلال ${_formatCooldown(_remainingSeconds)}',
            en: 'Resend in ${_formatCooldown(_remainingSeconds)}',
          )
        : context.tr(AppStrings.resendEmail);
    final enabledColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.78)
        : AppColors.lightTextPrimary;
    final disabledColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.34)
        : Colors.black.withValues(alpha: 0.34);

    return TextButton(
      onPressed: _isCoolingDown || _isResending ? null : _onResend,
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        disabledForegroundColor: disabledColor,
      ),
      child: Text(
        label,
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

  String _copy(BuildContext context, {required String ar, required String en}) {
    return context.isArabicLanguage ? ar : en;
  }
}

class _CodeDigitBox extends StatelessWidget {
  const _CodeDigitBox({
    required this.digit,
    required this.isActive,
    required this.isDarkMode,
  });

  final String digit;
  final bool isActive;
  final bool isDarkMode;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasDigit = digit.isNotEmpty;
    final fillColor = isDarkMode
        ? const Color(0xFF222326)
        : const Color(0xFFF5F6FA);
    final borderColor = isActive || hasDigit
        ? theme.colorScheme.primary
        : isDarkMode
        ? const Color(0xFF3A3B41)
        : const Color(0xFFE4E7F0);
    final textColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 160),
      height: 58,
      decoration: BoxDecoration(
        color: fillColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: isActive ? 1.5 : 1),
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: theme.colorScheme.primary.withValues(alpha: 0.14),
                  blurRadius: 18,
                  offset: const Offset(0, 10),
                ),
              ]
            : null,
      ),
      child: Center(
        child: Text(
          digit,
          style: theme.textTheme.titleLarge?.copyWith(
            color: textColor,
            fontSize: 22,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}
