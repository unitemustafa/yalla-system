import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../../core/utils/validators.dart';
import '../cubit/auth_cubit.dart';
import '../widgets/auth_top_bar.dart';
import '../widgets/custom_text_field.dart';

class ForgetPasswordView extends StatefulWidget {
  const ForgetPasswordView({super.key});

  @override
  State<ForgetPasswordView> createState() => _ForgetPasswordViewState();
}

class _ForgetPasswordViewState extends State<ForgetPasswordView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  Timer? _emailLookupDebounce;
  bool _isCheckingEmail = false;
  bool? _isEmailRegistered;
  String? _lastCheckedEmail;

  bool get _canSubmit =>
      !_isCheckingEmail &&
      _isEmailRegistered == true &&
      _lastCheckedEmail == _normalizedEmail;

  String get _normalizedEmail => _emailController.text.trim().toLowerCase();

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _emailController.addListener(_scheduleEmailCheck);
  }

  @override
  void dispose() {
    _emailLookupDebounce?.cancel();
    _emailController.removeListener(_scheduleEmailCheck);
    _emailController.dispose();
    super.dispose();
  }

  void _onSubmit() {
    if (!_canSubmit || !(_formKey.currentState?.validate() ?? false)) return;
    Navigator.pushNamed(
      context,
      AppRoutes.passwordResetSent,
      arguments: _emailController.text.trim(),
    );
  }

  void _scheduleEmailCheck() {
    _emailLookupDebounce?.cancel();
    final email = _normalizedEmail;

    setState(() {
      _isCheckingEmail = false;
      _isEmailRegistered = null;
      _lastCheckedEmail = null;
    });

    if (Validators.email(email) != null) return;

    _emailLookupDebounce = Timer(const Duration(milliseconds: 450), () {
      if (!mounted) return;
      unawaited(_checkEmailRegistration(email));
    });
  }

  Future<void> _checkEmailRegistration(String email) async {
    setState(() => _isCheckingEmail = true);
    final result = await context.read<AuthCubit>().isEmailRegistered(email);
    if (!mounted || email != _normalizedEmail) return;
    setState(() {
      _isCheckingEmail = false;
      _isEmailRegistered = result;
      _lastCheckedEmail = email;
    });
    _formKey.currentState?.validate();
  }

  String? _validateEmail(String? value) {
    final validationMessage = Validators.email(value);
    if (validationMessage != null) return validationMessage;

    if (_lastCheckedEmail == _normalizedEmail && _isEmailRegistered == false) {
      return context.tr('No account found with this email.');
    }

    return null;
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
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: minHeight),
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 430),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const AuthTopBar(showClose: true),
                            const SizedBox(height: 34),
                            _buildHeader(context, theme, isDarkMode),
                            const SizedBox(height: 30),
                            CustomTextField(
                              controller: _emailController,
                              labelText: AppStrings.email,
                              prefixIcon: AppIcons.direct_right,
                              keyboardType: TextInputType.emailAddress,
                              validator: _validateEmail,
                              inputFormatters: [
                                FilteringTextInputFormatter.deny(RegExp(r'\s')),
                              ],
                              suffix: _buildEmailStatusSuffix(isDarkMode),
                            ),
                            const SizedBox(height: 14),
                            _buildSubmitButton(),
                          ],
                        ),
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

  Widget _buildHeader(BuildContext context, ThemeData theme, bool isDarkMode) {
    final strings = AppTranslations.of(context);
    final titleColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final subtitleColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.58)
        : Colors.black.withValues(alpha: 0.56);
    final iconBackground = isDarkMode
        ? AppColors.primary.withValues(alpha: 0.18)
        : AppColors.primary.withValues(alpha: 0.10);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 58,
          height: 58,
          decoration: BoxDecoration(
            color: iconBackground,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.primary.withValues(alpha: 0.18),
            ),
          ),
          child: Icon(
            AppIcons.lock_1,
            color: theme.colorScheme.primary,
            size: 26,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          strings.forgetPasswordTitle,
          style: theme.textTheme.headlineLarge?.copyWith(
            color: titleColor,
            fontSize: 30,
            height: 1.1,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          strings.forgetPasswordDesc,
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

  Widget _buildSubmitButton() {
    return AppActionButton(
      label: AppStrings.submit,
      isLoading: _isCheckingEmail,
      onPressed: _canSubmit ? _onSubmit : null,
    );
  }

  Widget? _buildEmailStatusSuffix(bool isDarkMode) {
    if (_isCheckingEmail) {
      final progressColor = isDarkMode
          ? Colors.white.withValues(alpha: 0.62)
          : Colors.black.withValues(alpha: 0.42);
      return Padding(
        padding: const EdgeInsets.all(14),
        child: SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(progressColor),
          ),
        ),
      );
    }

    if (_isEmailRegistered == true) {
      return const Icon(
        AppIcons.tick_circle,
        size: 23,
        color: AppColors.success,
      );
    }

    if (_isEmailRegistered == false) {
      return const Icon(AppIcons.danger, size: 23, color: AppColors.error);
    }

    return null;
  }
}
