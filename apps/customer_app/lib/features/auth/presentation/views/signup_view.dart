import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/services.dart';
import 'package:yallamarket/core/icons/app_icons.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../../core/utils/validators.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/auth_top_bar.dart';
import '../widgets/password_strength_meter.dart';
import '../widgets/policy_link.dart';
import '../widgets/signup_phone_country_picker.dart';
import '../widgets/warning_checkbox.dart';
import 'signup_availability_checker.dart';

part 'signup_form_fields.dart';
part 'signup_policy_widgets.dart';
part 'signup_error_messages.dart';

class SignupView extends StatefulWidget {
  const SignupView({super.key});

  @override
  State<SignupView> createState() => _SignupViewState();
}

class _SignupViewState extends State<SignupView> {
  static const List<PhoneCountry> _phoneCountries = [
    PhoneCountry(
      name: 'Egypt',
      isoCode: 'EG',
      dialCode: '+20',
      minDigits: 10,
      maxDigits: 11,
    ),
    PhoneCountry(
      name: 'United States',
      isoCode: 'US',
      dialCode: '+1',
      minDigits: 10,
      maxDigits: 10,
    ),
    PhoneCountry(
      name: 'United Kingdom',
      isoCode: 'UK',
      dialCode: '+44',
      minDigits: 10,
      maxDigits: 10,
    ),
    PhoneCountry(
      name: 'Saudi Arabia',
      isoCode: 'SA',
      dialCode: '+966',
      minDigits: 9,
      maxDigits: 9,
    ),
    PhoneCountry(
      name: 'United Arab Emirates',
      isoCode: 'AE',
      dialCode: '+971',
      minDigits: 9,
      maxDigits: 9,
    ),
    PhoneCountry(
      name: 'India',
      isoCode: 'IN',
      dialCode: '+91',
      minDigits: 10,
      maxDigits: 10,
    ),
    PhoneCountry(
      name: 'Pakistan',
      isoCode: 'PK',
      dialCode: '+92',
      minDigits: 10,
      maxDigits: 10,
    ),
    PhoneCountry(
      name: 'Turkey',
      isoCode: 'TR',
      dialCode: '+90',
      minDigits: 10,
      maxDigits: 10,
    ),
  ];

  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _firstNameController;
  late final TextEditingController _lastNameController;
  late final TextEditingController _usernameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _passwordController;
  late PhoneCountry _selectedCountry;
  bool _obscurePassword = true;
  bool _agreeToPrivacy = false;
  bool _showPrivacyError = false;
  late final SignupAvailabilityChecker _checker;

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController();
    _lastNameController = TextEditingController();
    _usernameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();
    _passwordController = TextEditingController();
    _selectedCountry = _phoneCountries.first;
    _checker = SignupAvailabilityChecker(
      emailController: _emailController,
      phoneController: _phoneController,
      usernameController: _usernameController,
      formKey: _formKey,
      onStateChanged: () => setState(() {}),
      phoneForLookup: _phoneForLookup,
      validatePhoneFormat: _validatePhoneFormat,
      validateUsername: _validateUsername,
    );
    _usernameController.addListener(_checker.scheduleUsernameCheck);
    _emailController.addListener(_checker.scheduleEmailCheck);
    _phoneController.addListener(_checker.schedulePhoneCheck);
  }

  @override
  void dispose() {
    _checker.dispose();
    _usernameController.removeListener(_checker.scheduleUsernameCheck);
    _emailController.removeListener(_checker.scheduleEmailCheck);
    _phoneController.removeListener(_checker.schedulePhoneCheck);
    _firstNameController.dispose();
    _lastNameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _onCreateAccount() async {
    final isFormValid = _formKey.currentState?.validate() ?? false;
    final acceptedTerms = _ensurePrivacyAccepted();
    if (!isFormValid || !acceptedTerms) return;

    if (Validators.passwordStrength(_passwordController.text) !=
        PasswordStrength.strong) {
      CustomSnackBar.showWarning(
        context: context,
        title: context.isArabicLanguage
            ? 'كلمة السر غير مكتملة'
            : 'Password incomplete',
        message: context.isArabicLanguage
            ? 'كمّل شروط كلمة السر الأول.'
            : 'Complete the password requirements first.',
      );
      return;
    }

    final emailAvailable = await _checker.ensureEmailAvailable(context);
    if (!mounted) return;

    final phoneAvailable = await _checker.ensurePhoneAvailable(context);
    if (!mounted) return;

    final usernameAvailable = await _checker.ensureUsernameAvailable(context);

    if (!mounted) return;

    if (emailAvailable && phoneAvailable && usernameAvailable) {
      final digits = _phoneController.text.replaceAll(RegExp(r'\D'), '');
      final username = _usernameController.text.trim();
      context.read<AuthCubit>().signup(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        username: username.isEmpty ? null : username,
        email: _emailController.text.trim(),
        phone: '${_selectedCountry.dialCode}$digits',
        password: _passwordController.text,
      );
    }
  }

  bool _ensurePrivacyAccepted() {
    if (_agreeToPrivacy) {
      if (_showPrivacyError) {
        setState(() {
          _showPrivacyError = false;
        });
      }
      return true;
    }

    setState(() {
      _showPrivacyError = true;
    });
    CustomSnackBar.showError(
      context: context,
      title: 'Agreement required',
      message:
          'Please agree to the Privacy Policy and Terms of use before creating your account.',
    );
    return false;
  }

  void _togglePrivacyAgreement() {
    _setPrivacyAgreement(!_agreeToPrivacy);
  }

  void _setPrivacyAgreement(bool? value) {
    setState(() {
      final nextValue = value ?? false;
      _agreeToPrivacy = nextValue;
      if (nextValue) _showPrivacyError = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    _checker.updateContext(context);

    return BlocConsumer<AuthCubit, AuthState>(
      listenWhen: (previous, current) =>
          previous.runtimeType != current.runtimeType,
      listener: (context, state) {
        if (state is AuthSignupSucceeded) {
          final email = state.email.trim().isEmpty
              ? _emailController.text.trim()
              : state.email.trim();
          final strings = AppTranslations.of(context);

          CustomSnackBar.showSuccess(
            context: context,
            title: strings.verifyEmailTitle,
            message: strings.verifyEmailDesc,
          );
          Navigator.pushNamedAndRemoveUntil(
            context,
            AppRoutes.verifyEmail,
            (route) => false,
            arguments: email,
          );
        }

        if (state is AuthFailure) {
          CustomSnackBar.showError(
            context: context,
            title: _signupErrorTitle(state.message),
            message: state.message,
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
                  final minHeight = (constraints.maxHeight - 20).clamp(
                    0.0,
                    double.infinity,
                  );

                  return SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
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
                                const AuthTopBar(showBack: true),
                                const SizedBox(height: 30),
                                _buildTitle(context, theme, isDarkMode),
                                const SizedBox(height: 28),
                                _buildNameFields(constraints.maxWidth),
                                _buildUsernameField(isDarkMode),
                                _buildEmailField(isDarkMode),
                                _buildPhoneField(theme, isDarkMode),
                                CustomTextField(
                                  controller: _passwordController,
                                  labelText: AppStrings.password,
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
                                  validator: _validatePassword,
                                ),
                                PasswordStrengthMeter(
                                  controller: _passwordController,
                                ),
                                const SizedBox(height: 2),
                                _buildPrivacyRow(theme, isDarkMode),
                                const SizedBox(height: 30),
                                _buildCreateAccountButton(
                                  isLoading: authState is AuthLoading,
                                ),
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
      },
    );
  }

  String? _validateEmail(String? value) {
    final validationMessage = Validators.email(value);
    if (validationMessage != null) return validationMessage;

    final email = value?.trim().toLowerCase() ?? '';
    if (_checker.lastCheckedEmail == email &&
        _checker.isEmailAvailable == false) {
      return 'This email is already registered.';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    final password = value ?? '';

    if (password.isEmpty) {
      return AppTranslations.current.fieldRequired;
    }

    if (password.length > 72) {
      return AppTranslations.current.passwordTooLong;
    }

    return null;
  }

  String? _validatePhone(String? value) {
    final validationMessage = _validatePhoneFormat(value);
    if (validationMessage != null) return validationMessage;

    final phone = _phoneForLookup(value);
    if (_checker.lastCheckedPhone == phone &&
        _checker.isPhoneAvailable == false) {
      return 'This phone number is already registered.';
    }

    return null;
  }

  String? _validatePhoneFormat(String? value) {
    final phone = value?.trim() ?? '';

    if (phone.isEmpty) {
      return AppTranslations.current.fieldRequired;
    }

    final digits = phone.replaceAll(RegExp(r'\D'), '');
    final isValidLength =
        digits.length >= _selectedCountry.minDigits &&
        digits.length <= _selectedCountry.maxDigits;

    if (!isValidLength) {
      return AppTranslations.current.invalidPhone;
    }

    return null;
  }

  String _phoneForLookup([String? value]) {
    final digits = (value ?? _phoneController.text).replaceAll(
      RegExp(r'\D'),
      '',
    );
    return digits.isEmpty ? '' : '${_selectedCountry.dialCode}$digits';
  }

  String? _validateUsername(String? value) {
    final username = value?.trim() ?? '';

    if (username.isEmpty) return null;

    if (username.length < 3) {
      return context.isArabicLanguage
          ? 'اسم المستخدم لازم يكون 3 حروف على الأقل'
          : 'Username must be at least 3 characters';
    }

    if (username.length > 30) {
      return context.isArabicLanguage
          ? 'اسم المستخدم طويل جدًا'
          : 'Username is too long';
    }

    if (!RegExp(r'^[a-zA-Z._]+$').hasMatch(username)) {
      return context.isArabicLanguage
          ? 'استخدم حروف إنجليزي ونقطة وشرطة سفلية فقط'
          : 'Use English letters, dots, and underscores only';
    }

    if (!RegExp(r'[a-zA-Z]').hasMatch(username)) {
      return context.isArabicLanguage
          ? 'اسم المستخدم لازم يحتوي على حرف'
          : 'Username must include a letter';
    }

    if (_checker.lastCheckedUsername == username &&
        _checker.isUsernameAvailable == false) {
      return context.isArabicLanguage
          ? 'اسم المستخدم ده مستخدم بالفعل'
          : 'This username is already taken';
    }

    return null;
  }

  Future<void> _showCountryPicker() async {
    final selectedCountry = await showModalBottomSheet<PhoneCountry>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CountryPickerSheet(
        countries: _phoneCountries,
        selectedCountry: _selectedCountry,
      ),
    );

    if (!mounted || selectedCountry == null) return;

    setState(() {
      _selectedCountry = selectedCountry;
    });
    _formKey.currentState?.validate();
    _checker.schedulePhoneCheck();
  }
}
