part of 'signup_view.dart';

extension _SignupPolicyWidgets on _SignupViewState {
  Widget _buildPrivacyRow(ThemeData theme, bool isDarkMode) {
    final mutedColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.62)
        : Colors.black.withValues(alpha: 0.58);
    final linkColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final textStyle = theme.textTheme.bodySmall?.copyWith(
      color: mutedColor,
      fontSize: 12,
      height: 1.35,
      fontWeight: FontWeight.w600,
    );
    final linkStyle = textStyle?.copyWith(
      color: linkColor,
      fontWeight: FontWeight.w800,
      decoration: TextDecoration.underline,
      decorationColor: linkColor,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: _togglePrivacyAgreement,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                width: 24,
                height: 24,
                child: WarningCheckbox(
                  value: _agreeToPrivacy,
                  hasError: _showPrivacyError && !_agreeToPrivacy,
                  onChanged: _setPrivacyAgreement,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  runSpacing: 2,
                  children: [
                    Text(context.tr(AppStrings.iAgreeTo), style: textStyle),
                    PolicyLink(
                      text: context.tr(AppStrings.privacyPolicy),
                      style: linkStyle,
                      onTap: () => _showPolicySheet(
                        title: AppStrings.privacyPolicy,
                        icon: AppIcons.shield_tick,
                        points: const [
                          'We use your account details to secure your profile and personalize shopping.',
                          'Your email and phone number help with verification, delivery updates, and recovery.',
                          'Payment and sensitive data should only be entered on trusted checkout screens.',
                        ],
                      ),
                    ),
                    Text(context.tr(AppStrings.and), style: textStyle),
                    PolicyLink(
                      text: context.tr(AppStrings.termsOfUse),
                      style: linkStyle,
                      onTap: () => _showPolicySheet(
                        title: AppStrings.termsOfUse,
                        icon: AppIcons.document_text,
                        points: const [
                          'Keep your account information accurate and protect your password.',
                          'Orders, returns, and cancellations follow the store policies shown at checkout.',
                          'Misuse of offers, accounts, or payment methods may limit access to the app.',
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (_showPrivacyError && !_agreeToPrivacy) ...[
          const SizedBox(height: 6),
          Text(
            context.tr('Please accept the Privacy Policy and Terms of use.'),
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.error,
              fontSize: 12,
              height: 1.3,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ],
    );
  }

  void _showPolicySheet({
    required String title,
    required IconData icon,
    required List<String> points,
  }) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final sheetColor = isDarkMode ? const Color(0xFF222326) : Colors.white;
    final textColor = isDarkMode ? Colors.white : AppColors.lightTextPrimary;
    final mutedColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.64)
        : Colors.black.withValues(alpha: 0.58);

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return SafeArea(
          top: false,
          child: Container(
            height: MediaQuery.sizeOf(context).height * 0.52,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            decoration: BoxDecoration(
              color: sheetColor,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              border: Border.all(
                color: isDarkMode
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.06),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: mutedColor.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 22),
                Row(
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(
                          alpha: isDarkMode ? 0.18 : 0.10,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, color: AppColors.primary, size: 23),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        context.tr(title),
                        style: theme.textTheme.titleLarge?.copyWith(
                          color: textColor,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Expanded(
                  child: ListView.separated(
                    padding: EdgeInsets.zero,
                    itemCount: points.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(
                            AppIcons.tick_circle,
                            size: 18,
                            color: AppColors.success,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              context.tr(points[index]),
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: mutedColor,
                                height: 1.45,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
                AppActionButton(
                  label: 'Got it',
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCreateAccountButton({required bool isLoading}) {
    return AppActionButton(
      label: AppStrings.createAccount,
      isLoading: isLoading,
      onPressed: isLoading ? null : _onCreateAccount,
    );
  }
}
