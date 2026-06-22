import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/localization/app_language_controller.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../../core/utils/validators.dart';
import '../../../location/data/datasources/location_preferences.dart';
import '../../../location/presentation/cubit/location_cubit.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/warning_checkbox.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key, this.showSessionExpiredNotice = false});

  final bool showSessionExpiredNotice;

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  bool _obscurePassword = true;
  bool _rememberMe = true;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    if (widget.showSessionExpiredNotice) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _showSessionExpiredDialog();
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _onSignIn() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final authCubit = context.read<AuthCubit>();
    final identifier = _emailController.text.trim();

    authCubit.login(
      email: identifier,
      password: _passwordController.text,
      rememberMe: _rememberMe,
    );
  }

  Future<void> _navigateAfterSignIn(
    BuildContext context,
    AuthAuthenticated state,
  ) async {
    final selectedCity = await context.read<LocationCubit>().loadSelectedCity();
    if (!context.mounted) return;

    final selectedCityUserId = await LocationPreferences()
        .getSelectedCityUserId();
    if (!context.mounted) return;

    final hasLegacyCity = selectedCity != null && selectedCityUserId == null;
    if (hasLegacyCity) {
      await LocationPreferences().setSelectedCityUserId(state.session.user.id);
    }
    if (!context.mounted) return;

    final hasCityForCurrentUser =
        selectedCity != null &&
        (selectedCityUserId == state.session.user.id || hasLegacyCity);

    Navigator.pushNamedAndRemoveUntil(
      context,
      hasCityForCurrentUser ? AppRoutes.navigationMenu : AppRoutes.selectCity,
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final logoAsset = AppAssets.themedLogo(isDarkMode: isDarkMode);
    final strings = AppTranslations.of(context);

    return BlocConsumer<AuthCubit, AuthState>(
      listenWhen: (previous, current) =>
          previous.runtimeType != current.runtimeType,
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          CustomSnackBar.showSuccess(
            context: context,
            title: strings.signInSuccessTitle,
            message: strings.signInSuccessMessage,
          );
          unawaited(_navigateAfterSignIn(context, state));
        }

        if (state is AuthFailure) {
          CustomSnackBar.showError(
            context: context,
            title: _signInErrorTitle(state.message, strings),
            message: context.tr(state.message),
          );
        }
      },
      builder: (context, authState) {
        return Scaffold(
          body: DecoratedBox(
            decoration: _buildBackgroundDecoration(isDarkMode),
            child: SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final horizontalPadding = constraints.maxWidth >= 500
                      ? 32.0
                      : 20.0;
                  const languageSwitcherTopPadding = 88.0;
                  const bottomPadding = 20.0;
                  final minHeight =
                      (constraints.maxHeight -
                              languageSwitcherTopPadding -
                              bottomPadding)
                          .clamp(0.0, double.infinity);

                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      SingleChildScrollView(
                        padding: EdgeInsets.fromLTRB(
                          horizontalPadding,
                          languageSwitcherTopPadding,
                          horizontalPadding,
                          bottomPadding,
                        ),
                        child: ConstrainedBox(
                          constraints: BoxConstraints(minHeight: minHeight),
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 430),
                              child: Form(
                                key: _formKey,
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildHeader(
                                      theme,
                                      isDarkMode,
                                      logoAsset,
                                      strings,
                                    ),
                                    const SizedBox(height: 30),
                                    CustomTextField(
                                      controller: _emailController,
                                      labelText: 'Email, username, or phone',
                                      prefixIcon: AppIcons.direct_right,
                                      keyboardType: TextInputType.text,
                                      validator: _validateIdentifier,
                                      inputFormatters: [
                                        FilteringTextInputFormatter.deny(
                                          RegExp(r'\s'),
                                        ),
                                      ],
                                    ),
                                    CustomTextField(
                                      controller: _passwordController,
                                      labelText: strings.password,
                                      prefixIcon: AppIcons.password_check,
                                      obscureText: _obscurePassword,
                                      suffixIcon: _obscurePassword
                                          ? AppIcons.eye_slash
                                          : AppIcons.eye,
                                      onSuffixIconPressed: () {
                                        setState(() {
                                          _obscurePassword = !_obscurePassword;
                                        });
                                      },
                                      validator: Validators.passwordRequired,
                                      inputFormatters: [
                                        FilteringTextInputFormatter.deny(
                                          RegExp(r'\s'),
                                        ),
                                      ],
                                    ),
                                    _buildRememberAndForgotRow(
                                      theme,
                                      isDarkMode,
                                      strings,
                                    ),
                                    const SizedBox(height: 30),
                                    _buildActionButtons(
                                      context,
                                      strings,
                                      isLoading: authState is AuthLoading,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 14,
                        right: horizontalPadding,
                        child: _buildLanguageSwitcher(
                          theme,
                          isDarkMode,
                          strings,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        );
      },
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
        stops: const [0, 0.42, 1],
      ),
    );
  }

  Widget _buildLanguageSwitcher(
    ThemeData theme,
    bool isDarkMode,
    AppTranslations strings,
  ) {
    final borderColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.09)
        : AppColors.primary.withValues(alpha: 0.13);
    final surfaceColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.06)
        : Colors.white.withValues(alpha: 0.92);
    final iconColor = isDarkMode ? Colors.white : AppColors.primary;

    return ValueListenableBuilder<AppLanguage>(
      valueListenable: AppLanguageController.instance,
      builder: (context, language, _) {
        final nextLanguage = language.isArabic
            ? AppLanguage.english
            : AppLanguage.arabic;
        final label = nextLanguage.label;
        final textColor = isDarkMode ? Colors.white : AppColors.primary;

        return Tooltip(
          message: strings.languageTooltip,
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(999),
            child: InkWell(
              borderRadius: BorderRadius.circular(999),
              onTap: AppLanguageController.instance.toggleLanguage,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsetsDirectional.fromSTEB(11, 9, 13, 9),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(
                        alpha: isDarkMode ? 0.18 : 0.06,
                      ),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  textDirection: TextDirection.ltr,
                  children: [
                    Icon(AppIcons.global, color: iconColor, size: 19),
                    const SizedBox(width: 8),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 180),
                      transitionBuilder: (child, animation) {
                        return FadeTransition(opacity: animation, child: child);
                      },
                      child: Text(
                        label,
                        key: ValueKey(label),
                        textDirection: nextLanguage.isArabic
                            ? TextDirection.rtl
                            : TextDirection.ltr,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w900,
                          height: 1,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader(
    ThemeData theme,
    bool isDarkMode,
    String logoAsset,
    AppTranslations strings,
  ) {
    final logoSurfaceColor = isDarkMode ? Colors.black : Colors.white;
    final logoBorderColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.08)
        : AppColors.primary.withValues(alpha: 0.14);
    final shadowColor = isDarkMode
        ? Colors.black.withValues(alpha: 0.26)
        : AppColors.primary.withValues(alpha: 0.14);
    final titleColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final subtitleColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.58)
        : Colors.black.withValues(alpha: 0.56);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 96,
          height: 96,
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: logoSurfaceColor,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: logoBorderColor),
            boxShadow: [
              BoxShadow(
                color: shadowColor,
                blurRadius: 30,
                offset: const Offset(0, 18),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: AppImage(
              source: logoAsset,
              fit: BoxFit.cover,
              cacheWidth: 192,
              cacheHeight: 192,
            ),
          ),
        ),
        const SizedBox(height: 22),
        Text(
          strings.welcomeBack,
          style: theme.textTheme.headlineLarge?.copyWith(
            color: titleColor,
            fontSize: 31,
            height: 1.08,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          strings.loginSubtitle,
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

  Widget _buildRememberAndForgotRow(
    ThemeData theme,
    bool isDarkMode,
    AppTranslations strings,
  ) {
    final textColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.88)
        : Colors.black.withValues(alpha: 0.78);

    return Row(
      children: [
        Expanded(
          child: InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: () {
              setState(() {
                _rememberMe = !_rememberMe;
              });
            },
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 24,
                  height: 24,
                  child: WarningCheckbox(
                    value: _rememberMe,
                    onChanged: (value) {
                      setState(() {
                        _rememberMe = value ?? false;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Flexible(
                  child: Text(
                    strings.rememberMe,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      color: textColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        TextButton(
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.forgetPassword);
          },
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: Text(
            strings.forgetPasswordLink,
            style: TextStyle(
              color: theme.colorScheme.primary,
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    AppTranslations strings, {
    required bool isLoading,
  }) {
    return Column(
      children: [
        AppActionButton(
          label: strings.signIn,
          isLoading: isLoading,
          onPressed: isLoading ? null : _onSignIn,
        ),
        const SizedBox(height: 14),
        AppActionButton(
          label: strings.createAccount,
          variant: AppActionButtonVariant.outlined,
          onPressed: isLoading
              ? null
              : () {
                  Navigator.pushNamed(context, AppRoutes.signup);
                },
        ),
      ],
    );
  }

  String? _validateIdentifier(String? value) {
    final identifier = value?.trim() ?? '';
    if (identifier.isEmpty) return AppTranslations.current.fieldRequired;

    if (identifier.contains('@')) {
      return Validators.email(identifier);
    }

    if (RegExp(r'^\+?\d+$').hasMatch(identifier)) {
      final digits = identifier.replaceAll(RegExp(r'\D'), '');
      if (digits.length < 8 || digits.length > 15) {
        return context.tr('Enter a valid email, username, or phone.');
      }
      return null;
    }

    if (!RegExp(r'^[a-zA-Z0-9._]+$').hasMatch(identifier)) {
      return context.tr('Enter a valid email, username, or phone.');
    }

    return null;
  }

  Future<void> _showSessionExpiredDialog() {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final panelColor = isDarkMode ? const Color(0xFF222326) : Colors.white;
    final textColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.62)
        : Colors.black.withValues(alpha: 0.56);

    return showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: panelColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(
              color: isDarkMode
                  ? Colors.white.withValues(alpha: 0.08)
                  : AppColors.primary.withValues(alpha: 0.12),
            ),
          ),
          titlePadding: const EdgeInsets.fromLTRB(22, 22, 22, 0),
          contentPadding: const EdgeInsets.fromLTRB(22, 14, 22, 22),
          title: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(
                    alpha: isDarkMode ? 0.18 : 0.10,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  AppIcons.security_safe,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  context.tr('Session expired'),
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                context.tr(
                  'Your session ended because Remember Me was off. Turn it on to stay signed in for 30 days when you close the app.',
                ),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: mutedColor,
                  height: 1.55,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 20),
              AppActionButton(
                label: AppStrings.signIn,
                icon: AppIcons.arrow_right_3,
                onPressed: () => Navigator.of(dialogContext).pop(),
              ),
            ],
          ),
        );
      },
    );
  }

  String _signInErrorTitle(String? message, AppTranslations strings) {
    final normalizedMessage = message?.toLowerCase() ?? '';

    if (normalizedMessage.contains('does not exist') ||
        normalizedMessage.contains('create an account')) {
      return strings.signInCreateAccountTitle;
    }

    if (normalizedMessage.contains('invalid email or password')) {
      return strings.signInCredentialsTitle;
    }

    if (normalizedMessage.contains('internet') ||
        normalizedMessage.contains('connection') ||
        normalizedMessage.contains('timed out')) {
      return strings.signInConnectionTitle;
    }

    return strings.signInFailureTitle;
  }
}
