part of 'signup_view.dart';

extension _SignupFormFields on _SignupViewState {
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

  Widget _buildTitle(BuildContext context, ThemeData theme, bool isDarkMode) {
    return Text(
      AppTranslations.of(context).createYourAccount,
      style: theme.textTheme.headlineLarge?.copyWith(
        color: isDarkMode ? Colors.white : AppColors.lightTextPrimary,
        fontSize: 30,
        height: 1.1,
        fontWeight: FontWeight.w800,
      ),
    );
  }

  Widget _buildNameFields(double availableWidth) {
    final shouldStack = availableWidth < 370;

    if (shouldStack) {
      return Column(
        children: [
          CustomTextField(
            controller: _firstNameController,
            labelText: AppStrings.firstName,
            prefixIcon: AppIcons.user,
            validator: Validators.required,
          ),
          CustomTextField(
            controller: _lastNameController,
            labelText: AppStrings.lastName,
            prefixIcon: AppIcons.user,
            validator: Validators.required,
          ),
        ],
      );
    }

    return Row(
      children: [
        Expanded(
          child: CustomTextField(
            controller: _firstNameController,
            labelText: AppStrings.firstName,
            prefixIcon: AppIcons.user,
            validator: Validators.required,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: CustomTextField(
            controller: _lastNameController,
            labelText: AppStrings.lastName,
            prefixIcon: AppIcons.user,
            validator: Validators.required,
          ),
        ),
      ],
    );
  }

  Widget _buildUsernameField(bool isDarkMode) {
    return CustomTextField(
      controller: _usernameController,
      labelText: AppStrings.username,
      prefixIcon: AppIcons.user_edit,
      validator: _validateUsername,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z._]')),
      ],
      suffix: _buildAvailabilityStatusSuffix(
        isDarkMode,
        isChecking: _checker.isCheckingUsername,
        isAvailable: _checker.isUsernameAvailable,
        showError:
            _usernameController.text.trim().isNotEmpty &&
            _checker.usernameAvailabilityMessage != null &&
            !_checker.isCheckingUsername,
      ),
    );
  }

  Widget _buildEmailField(bool isDarkMode) {
    return CustomTextField(
      controller: _emailController,
      labelText: AppStrings.email,
      prefixIcon: AppIcons.direct_right,
      keyboardType: TextInputType.emailAddress,
      validator: _validateEmail,
      suffix: _buildAvailabilityStatusSuffix(
        isDarkMode,
        isChecking: _checker.isCheckingEmail,
        isAvailable: _checker.isEmailAvailable,
      ),
    );
  }

  Widget? _buildAvailabilityStatusSuffix(
    bool isDarkMode, {
    required bool isChecking,
    required bool? isAvailable,
    bool showError = false,
  }) {
    if (isChecking) {
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

    if (isAvailable == true) {
      return const Icon(
        AppIcons.tick_circle,
        size: 23,
        color: AppColors.success,
      );
    }

    if (isAvailable == false || showError) {
      return const Icon(AppIcons.danger, size: 23, color: AppColors.error);
    }

    return null;
  }

  Widget _buildPhoneField(ThemeData theme, bool isDarkMode) {
    final fillColor = isDarkMode
        ? const Color(0xFF222326)
        : const Color(0xFFF5F6FA);
    final borderColor = isDarkMode
        ? const Color(0xFF3A3B41)
        : const Color(0xFFE4E7F0);
    final iconColor = isDarkMode
        ? Colors.white.withValues(alpha: 0.64)
        : Colors.black.withValues(alpha: 0.48);
    final textColor = isDarkMode ? Colors.white : const Color(0xFF17181C);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        controller: _phoneController,
        keyboardType: TextInputType.phone,
        validator: _validatePhone,
        cursorColor: theme.colorScheme.primary,
        style: theme.textTheme.bodyMedium?.copyWith(
          color: textColor,
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
        decoration: InputDecoration(
          labelText: AppTranslations.of(context).phoneNumber,
          filled: true,
          fillColor: fillColor,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 18,
          ),
          labelStyle: TextStyle(
            color: iconColor,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
          prefixIcon: PhoneCountryPrefix(
            country: _selectedCountry,
            isDarkMode: isDarkMode,
            onTap: _showCountryPicker,
          ),
          prefixIconConstraints: const BoxConstraints(
            minWidth: 118,
            maxWidth: 126,
            minHeight: 58,
          ),
          suffixIcon: _buildAvailabilityStatusSuffix(
            isDarkMode,
            isChecking: _checker.isCheckingPhone,
            isAvailable: _checker.isPhoneAvailable,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: borderColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: theme.colorScheme.primary,
              width: 1.4,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFEF4444)),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.4),
          ),
        ),
      ),
    );
  }
}
