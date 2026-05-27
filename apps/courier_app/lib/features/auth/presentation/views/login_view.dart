import 'package:flutter/material.dart';

import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/icons/app_icons.dart';
import '../../../../core/presentation/widgets/app_action_button.dart';
import '../../../../core/routing/app_routes.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _identifierController;
  late final TextEditingController _passwordController;
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _identifierController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isLoading = true);
    await Future<void>.delayed(const Duration(milliseconds: 450));
    if (!mounted) return;
    setState(() => _isLoading = false);
    _goToDashboard();
  }

  void _demoLogin() {
    _identifierController.text = 'courier@yallamarket.com';
    _passwordController.text = 'demo1234';
    _goToDashboard();
  }

  void _goToDashboard() {
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.dashboard,
      (route) => false,
    );
  }

  String? _validateIdentifier(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'اكتب رقم الموبايل أو الإيميل';
    final looksLikeEmail = text.contains('@') && text.contains('.');
    final looksLikePhone = RegExp(r'^\+?\d{10,15}$').hasMatch(text);
    if (!looksLikeEmail && !looksLikePhone) {
      return 'اكتب إيميل صحيح أو رقم موبايل صحيح';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if ((value ?? '').length < 6) return 'كلمة المرور لا تقل عن 6 أحرف';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

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
            stops: const [0, 0.42, 1],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final horizontalPadding = constraints.maxWidth >= 500
                  ? 32.0
                  : 20.0;

              return SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(
                  horizontalPadding,
                  54,
                  horizontalPadding,
                  24,
                ),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minHeight: constraints.maxHeight - 78,
                  ),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 430),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _LoginHeader(isDark: isDark),
                            const SizedBox(height: 30),
                            TextFormField(
                              controller: _identifierController,
                              keyboardType: TextInputType.emailAddress,
                              validator: _validateIdentifier,
                              textInputAction: TextInputAction.next,
                              decoration: const InputDecoration(
                                labelText: 'رقم الموبايل أو الإيميل',
                                prefixIcon: Icon(AppIcons.direct_right),
                              ),
                            ),
                            const SizedBox(height: 14),
                            TextFormField(
                              controller: _passwordController,
                              validator: _validatePassword,
                              obscureText: _obscurePassword,
                              textInputAction: TextInputAction.done,
                              onFieldSubmitted: (_) => _signIn(),
                              decoration: InputDecoration(
                                labelText: 'كلمة المرور',
                                prefixIcon: const Icon(AppIcons.password_check),
                                suffixIcon: IconButton(
                                  tooltip: _obscurePassword
                                      ? 'إظهار كلمة المرور'
                                      : 'إخفاء كلمة المرور',
                                  onPressed: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                  icon: Icon(
                                    _obscurePassword
                                        ? AppIcons.eye_slash
                                        : AppIcons.eye,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 26),
                            AppActionButton(
                              label: 'تسجيل الدخول',
                              isLoading: _isLoading,
                              icon: AppIcons.tick_circle,
                              onPressed: _isLoading ? null : _signIn,
                            ),
                            const SizedBox(height: 12),
                            AppActionButton(
                              label: 'دخول Demo',
                              variant: AppActionButtonVariant.outlined,
                              icon: AppIcons.profile_circle,
                              onPressed: _isLoading ? null : _demoLogin,
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
  }
}

class _LoginHeader extends StatelessWidget {
  const _LoginHeader({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final logoSurfaceColor = isDark ? Colors.black : Colors.white;
    final logoBorderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : AppColors.primary.withValues(alpha: 0.14);
    final shadowColor = isDark
        ? Colors.black.withValues(alpha: 0.26)
        : AppColors.primary.withValues(alpha: 0.14);

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
            child: Image.asset(
              AppAssets.themedLogo(isDarkMode: isDark),
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(height: 22),
        Text(
          'أهلاً يا كابتن',
          style: theme.textTheme.headlineLarge?.copyWith(
            fontSize: 31,
            height: 1.08,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'تابع طلباتك، افتح العنوان بسرعة، وثبّت التسليم بصورة أو ملاحظة.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: isDark
                ? Colors.white.withValues(alpha: 0.58)
                : Colors.black.withValues(alpha: 0.56),
            fontSize: 14.5,
            height: 1.55,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
