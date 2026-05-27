import 'package:flutter/material.dart';
import 'package:yallamarket/core/localization/app_translations.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../../core/routing/app_routes.dart';
import '../../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../../auth/presentation/cubit/auth_state.dart';
import '../../controllers/user_profile_controller.dart';

class CloseAccountView extends StatefulWidget {
  const CloseAccountView({super.key});

  @override
  State<CloseAccountView> createState() => _CloseAccountViewState();
}

class _CloseAccountViewState extends State<CloseAccountView> {
  bool _isDeleting = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const PageTopBar(
                title: 'Delete Account',
                subtitle: 'Permanently remove your يلا ماركت profile',
              ),
              const SizedBox(height: 18),
              _WarningCard(isDark: isDark),
              const SizedBox(height: 18),
              _WhatHappensCard(isDark: isDark),
              const SizedBox(height: 24),
              AppActionButton(
                label: 'Delete Account',
                icon: AppIcons.trash,
                variant: AppActionButtonVariant.danger,
                isLoading: _isDeleting,
                onPressed: () => _showDeleteDialog(context),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _showDeleteDialog(BuildContext context) async {
    if (_isDeleting) return;

    if (UserProfileController.instance.hasPassword) {
      final password = await _showPasswordDeleteDialog(context);
      if (!mounted || !context.mounted || password == null) return;
      await _deleteWithPassword(context, password);
      return;
    }

    CustomSnackBar.showWarning(
      context: context,
      title: 'Password required',
      message:
          'Account deletion now requires your account password for confirmation.',
    );
  }

  Future<String?> _showPasswordDeleteDialog(BuildContext context) async {
    final passwordController = TextEditingController();

    try {
      return await showDialog<String>(
        context: context,
        builder: (dialogContext) {
          String? errorText;

          return StatefulBuilder(
            builder: (context, setDialogState) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                title: Text(
                  context.tr('Delete account permanently?'),
                  textAlign: TextAlign.center,
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      context.tr(
                        'This cannot be undone. Enter your account password to confirm permanent deletion.',
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: passwordController,
                      obscureText: true,
                      autofocus: true,
                      autofillHints: const [AutofillHints.password],
                      decoration: InputDecoration(
                        labelText: context.tr('Password'),
                        prefixIcon: const Icon(AppIcons.password_check),
                        errorText: errorText,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
                actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                actions: [
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(dialogContext),
                          child: Text(context.tr('Cancel')),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            final password = passwordController.text;

                            if (password.isEmpty) {
                              setDialogState(() {
                                errorText = context.tr(
                                  'Enter your password first.',
                                );
                              });
                              return;
                            }

                            Navigator.pop(dialogContext, password);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.error,
                          ),
                          child: Text(
                            context.tr('Delete'),
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              );
            },
          );
        },
      );
    } finally {
      passwordController.dispose();
    }
  }

  Future<void> _deleteWithPassword(BuildContext context, String password) {
    return _deleteAccount(
      context,
      () => context.read<AuthCubit>().deleteAccountWithPassword(password),
    );
  }

  Future<void> _deleteAccount(
    BuildContext context,
    Future<bool> Function() deleteAccount,
  ) async {
    if (_isDeleting) return;

    final authCubit = context.read<AuthCubit>();
    final navigator = Navigator.of(context);

    setState(() => _isDeleting = true);
    final success = await deleteAccount();

    if (!mounted || !context.mounted) return;

    if (!success) {
      final errorMessage = authCubit.state is AuthFailure
          ? (authCubit.state as AuthFailure).message
          : 'An error occurred. Please try again.';
      setState(() => _isDeleting = false);
      CustomSnackBar.showError(
        context: context,
        title: 'Account was not deleted',
        message: errorMessage,
      );
      return;
    }

    UserProfileController.instance.reset();
    navigator.pushNamedAndRemoveUntil(AppRoutes.login, (route) => false);
  }
}

class _WarningCard extends StatelessWidget {
  const _WarningCard({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: isDark ? 0.14 : 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.22)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(AppIcons.warning_2, color: AppColors.error),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr('Permanent deletion'),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.error,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  context.tr(
                    'Deleting your account removes your profile, saved addresses, cart, reviews, and order history. This cannot be undone.',
                  ),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.68)
                        : Colors.black.withValues(alpha: 0.58),
                    height: 1.4,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WhatHappensCard extends StatelessWidget {
  const _WhatHappensCard({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDark
        ? Colors.white.withValues(alpha: 0.62)
        : Colors.black.withValues(alpha: 0.58);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            context.tr('Before deleting'),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          _InfoPoint(
            icon: AppIcons.bag_tick,
            text: 'Finish or cancel any active orders first.',
            color: AppColors.primary,
            mutedColor: mutedColor,
          ),
          const SizedBox(height: 10),
          _InfoPoint(
            icon: AppIcons.receipt_text,
            text: 'Review active refunds before deleting.',
            color: AppColors.success,
            mutedColor: mutedColor,
          ),
          const SizedBox(height: 10),
          _InfoPoint(
            icon: AppIcons.messages,
            text: 'Ask support for a data copy before you delete.',
            color: AppColors.warning,
            mutedColor: mutedColor,
          ),
        ],
      ),
    );
  }
}

class _InfoPoint extends StatelessWidget {
  const _InfoPoint({
    required this.icon,
    required this.text,
    required this.color,
    required this.mutedColor,
  });

  final IconData icon;
  final String text;
  final Color color;
  final Color mutedColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            context.tr(text),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: mutedColor,
              height: 1.35,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
