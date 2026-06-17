import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yalla_market/core/icons/app_icons.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/localization/app_translations.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/buttons/app_action_button.dart';
import '../../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../../auth/presentation/cubit/auth_state.dart';
import '../../controllers/user_profile_controller.dart';

part 'edit_profile_field_form.dart';
part 'edit_profile_birth_date_picker.dart';
part 'edit_profile_birth_date_widgets.dart';

enum EditableProfileField { name, username, email, phone, gender, birthDate }

bool _useArabicCopy(BuildContext context) {
  return context.isArabicLanguage ||
      Directionality.of(context) == TextDirection.rtl;
}

class EditProfileFieldView extends StatefulWidget {
  const EditProfileFieldView({super.key, required this.field});

  final EditableProfileField field;

  @override
  State<EditProfileFieldView> createState() => _EditProfileFieldViewState();
}

class _EditProfileFieldViewState extends State<EditProfileFieldView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _controller;
  late final TextEditingController _verificationCodeController;
  late final String _initialFieldValue;
  bool _isSaving = false;
  bool _verificationCodeSent = false;
  String? _verificationTarget;
  String? _verificationChangeValue;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    final profile = UserProfileController.instance;
    _selectedDate = profile.birthDate;
    _initialFieldValue = _initialValue(profile);
    _controller = TextEditingController(text: _initialFieldValue);
    _verificationCodeController = TextEditingController();
    _controller.addListener(_handleFieldChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_handleFieldChanged);
    _controller.dispose();
    _verificationCodeController.dispose();
    super.dispose();
  }

  String _initialValue(UserProfileController profile) {
    return switch (widget.field) {
      EditableProfileField.name => profile.displayName,
      EditableProfileField.username => profile.username,
      EditableProfileField.email => profile.email,
      EditableProfileField.phone => profile.phone,
      EditableProfileField.gender => profile.gender,
      EditableProfileField.birthDate => _formatDate(profile.birthDate),
    };
  }

  bool get _isContactField => widget.field == EditableProfileField.phone;

  bool get _shouldShowVerificationPanel =>
      _isContactField && _controller.text.trim() != _initialFieldValue.trim();

  String get _expectedVerificationCode => '123456';

  String get _contactVerificationTarget => _initialFieldValue.trim();

  void _handleFieldChanged() {
    if (!_isContactField) return;

    final value = _controller.text.trim();
    if (!_verificationCodeSent || _verificationChangeValue == value) {
      setState(() {});
      return;
    }

    setState(() {
      _verificationCodeSent = false;
      _verificationTarget = null;
      _verificationChangeValue = null;
      _verificationCodeController.clear();
    });
  }

  void _sendVerificationCode() {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final newValue = _controller.text.trim();
    final target = _contactVerificationTarget;
    if (!_shouldShowVerificationPanel ||
        newValue == _initialFieldValue.trim()) {
      return;
    }

    if (target.isEmpty) {
      final useArabicCopy = _useArabicCopy(context);
      CustomSnackBar.showWarning(
        context: context,
        title: useArabicCopy ? 'مفيش رقم حالي' : 'No current phone number',
        message: useArabicCopy
            ? 'ضيف رقمك الحالي الأول من خلال الدعم.'
            : 'Add your current phone number first through support.',
      );
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() {
      _verificationCodeSent = true;
      _verificationTarget = target;
      _verificationChangeValue = newValue;
      _verificationCodeController.clear();
    });

    final useArabicCopy = _useArabicCopy(context);
    CustomSnackBar.showSuccess(
      context: context,
      title: useArabicCopy
          ? 'تم إرسال كود واتساب للرقم الحالي'
          : 'WhatsApp code sent to current phone',
      message: useArabicCopy
          ? 'اترسل إلى $target. كود التجربة: $_expectedVerificationCode'
          : 'Sent to $target. Demo code: $_expectedVerificationCode',
    );
  }

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
              PageTopBar(title: _title, subtitle: _subtitle),
              const SizedBox(height: 18),
              _FormCard(
                isDark: isDark,
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.tr(_label),
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        context.tr(_helperText),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: isDark
                              ? AppColors.darkTextSecondary
                              : AppColors.lightTextSecondary,
                          height: 1.35,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildInput(isDark),
                      if (_shouldShowVerificationPanel) ...[
                        const SizedBox(height: 12),
                        _ContactVerificationPanel(
                          isDark: isDark,
                          codeController: _verificationCodeController,
                          codeSent: _verificationCodeSent,
                          target: _contactVerificationTarget,
                          onSendCode: _sendVerificationCode,
                        ),
                      ],
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          Expanded(
                            child: AppActionButton(
                              label: 'Cancel',
                              onPressed: _isSaving
                                  ? null
                                  : () => Navigator.pop(context),
                              variant: AppActionButtonVariant.outlined,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: AppActionButton(
                              label: 'Change',
                              icon: AppIcons.tick_circle,
                              isLoading: _isSaving,
                              onPressed: _save,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInput(bool isDark) {
    if (widget.field == EditableProfileField.gender) {
      const options = ['Male', 'Female'];
      return FormField<String>(
        initialValue: options.contains(_controller.text)
            ? _controller.text
            : null,
        validator: (value) => value == null || !options.contains(value)
            ? context.tr('Choose a gender option')
            : null,
        builder: (field) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: options
                    .map(
                      (value) => Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.only(
                            end: value == options.last ? 0 : 10,
                          ),
                          child: _GenderOptionTile(
                            label: context.tr(value),
                            icon: value == 'Male' ? Icons.male : Icons.female,
                            selected: field.value == value,
                            enabled: !_isSaving,
                            isDark: isDark,
                            onTap: () {
                              _controller.text = value;
                              field.didChange(value);
                            },
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
              if (field.hasError) ...[
                const SizedBox(height: 8),
                Padding(
                  padding: const EdgeInsetsDirectional.only(start: 12),
                  child: Text(
                    field.errorText!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          );
        },
      );
    }

    return TextFormField(
      controller: _controller,
      enabled: !_isSaving,
      readOnly: widget.field == EditableProfileField.birthDate,
      validator: _validate,
      keyboardType: _keyboardType,
      textDirection: widget.field == EditableProfileField.email
          ? TextDirection.ltr
          : null,
      textAlign: widget.field == EditableProfileField.email
          ? TextAlign.end
          : TextAlign.start,
      textInputAction: TextInputAction.done,
      onTap: widget.field == EditableProfileField.birthDate
          ? _pickBirthDate
          : null,
      onFieldSubmitted: (_) => _save(),
      decoration: _inputDecoration(isDark),
    );
  }

  InputDecoration _inputDecoration(bool isDark) {
    return InputDecoration(
      prefixIcon: Icon(_icon),
      labelText: context.tr(_label),
      filled: true,
      fillColor: isDark
          ? Colors.white.withValues(alpha: 0.04)
          : const Color(0xFFF7F8FB),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.06),
        ),
      ),
    );
  }

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final initialDate =
        _selectedDate ?? DateTime(now.year - 18, now.month, now.day);
    final pickedDate = await showModalBottomSheet<DateTime>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return _BirthDatePickerSheet(
          initialDate: initialDate,
          firstDate: DateTime(1900),
          lastDate: DateTime(now.year, now.month, now.day),
        );
      },
    );

    if (pickedDate == null) return;

    setState(() {
      _selectedDate = pickedDate;
      _controller.text = _formatDate(pickedDate);
    });
  }

  Future<void> _save() async {
    if (_isSaving || !(_formKey.currentState?.validate() ?? false)) return;

    FocusScope.of(context).unfocus();

    final profile = UserProfileController.instance;
    final value = _controller.text.trim();
    if (!_canSaveContactChange(value)) return;

    setState(() => _isSaving = true);

    final names = _splitName(value);
    final updatedUser = await context.read<AuthCubit>().updateProfile(
      firstName: widget.field == EditableProfileField.name ? names.$1 : null,
      lastName: widget.field == EditableProfileField.name ? names.$2 : null,
      username: widget.field == EditableProfileField.username ? value : null,
      phone: widget.field == EditableProfileField.phone ? value : null,
      gender: widget.field == EditableProfileField.gender ? value : null,
      birthDate: widget.field == EditableProfileField.birthDate
          ? _selectedDate
          : null,
    );

    if (!mounted) return;

    setState(() => _isSaving = false);

    if (updatedUser == null) {
      final authState = context.read<AuthCubit>().state;
      final errMsg = authState is AuthFailure
          ? authState.message
          : 'Could not save changes. Please try again.';
      CustomSnackBar.showError(
        context: context,
        title: 'Could not update profile',
        message: errMsg,
      );
      return;
    }

    profile.updateFromAuthUser(updatedUser);
    CustomSnackBar.showSuccess(
      context: context,
      title: 'Profile updated',
      message: _successMessage,
    );
    Navigator.pop(context);
  }

  bool _canSaveContactChange(String value) {
    if (!_shouldShowVerificationPanel) return true;

    final useArabicCopy = _useArabicCopy(context);
    if (!_verificationCodeSent ||
        _verificationTarget != _contactVerificationTarget ||
        _verificationChangeValue != value) {
      CustomSnackBar.showWarning(
        context: context,
        title: useArabicCopy ? 'أكد الرقم الأول' : 'Verify first',
        message: useArabicCopy
            ? 'ابعت كود واتساب للرقم الحالي قبل حفظ الرقم الجديد.'
            : 'Send a WhatsApp code to the current phone before saving the new phone.',
      );
      return false;
    }

    if (_verificationCodeController.text.trim() != _expectedVerificationCode) {
      CustomSnackBar.showError(
        context: context,
        title: useArabicCopy ? 'كود غير صحيح' : 'Invalid code',
        message: useArabicCopy
            ? 'اكتب كود التأكيد الصحيح عشان نغير البيانات.'
            : 'Enter the correct verification code to update this field.',
      );
      return false;
    }

    return true;
  }

  (String, String) _splitName(String displayName) {
    final parts = displayName.split(RegExp(r'\s+')).where((part) {
      return part.trim().isNotEmpty;
    }).toList();

    if (parts.length == 1) return (parts.first, 'عميل');
    return (parts.first, parts.sublist(1).join(' '));
  }

  String? _validate(String? rawValue) {
    final value = rawValue?.trim() ?? '';

    if (value.isEmpty) return context.tr('This field is required');

    return switch (widget.field) {
      EditableProfileField.name when value.length < 2 => context.tr(
        'Name is too short',
      ),
      EditableProfileField.username when value.length < 3 => context.tr(
        'Username must be at least 3 characters',
      ),
      EditableProfileField.username
          when !RegExp(r'^[a-zA-Z0-9._]+$').hasMatch(value) =>
        context.tr('Use letters, numbers, dots, and underscores only'),
      EditableProfileField.email
          when !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value) =>
        context.tr('Enter a valid email address'),
      EditableProfileField.phone
          when value.replaceAll(RegExp(r'\D'), '').length < 8 =>
        context.tr('Enter a valid phone number'),
      EditableProfileField.birthDate when _selectedDate == null => context.tr(
        'Choose your birth date',
      ),
      _ => null,
    };
  }

  TextInputType get _keyboardType {
    return switch (widget.field) {
      EditableProfileField.email => TextInputType.emailAddress,
      EditableProfileField.phone => TextInputType.phone,
      _ => TextInputType.text,
    };
  }

  IconData get _icon {
    return switch (widget.field) {
      EditableProfileField.name => AppIcons.user_edit,
      EditableProfileField.username => AppIcons.user_tag,
      EditableProfileField.email => AppIcons.sms,
      EditableProfileField.phone => AppIcons.call,
      EditableProfileField.gender => AppIcons.user,
      EditableProfileField.birthDate => AppIcons.calendar,
    };
  }

  String get _title {
    return switch (widget.field) {
      EditableProfileField.name => 'Change Name',
      EditableProfileField.username => 'Change Username',
      EditableProfileField.email => 'Change Email',
      EditableProfileField.phone => 'Change Phone',
      EditableProfileField.gender => 'Change Gender',
      EditableProfileField.birthDate => 'Change Birth Date',
    };
  }

  String get _label {
    return switch (widget.field) {
      EditableProfileField.name => 'Name',
      EditableProfileField.username => 'Username',
      EditableProfileField.email => 'E-mail',
      EditableProfileField.phone => 'Phone',
      EditableProfileField.gender => 'Gender',
      EditableProfileField.birthDate => 'Birth Date',
    };
  }

  String get _subtitle => 'Update your profile information';

  String get _helperText {
    return switch (widget.field) {
      EditableProfileField.username =>
        'After saving, you can change your username again after 7 days.',
      EditableProfileField.email =>
        'Use an email address you can access for account recovery.',
      EditableProfileField.birthDate =>
        'This helps personalize your shopping experience.',
      _ => 'This information appears on your يلا ماركت profile.',
    };
  }

  String get _successMessage {
    return widget.field == EditableProfileField.username
        ? 'You can change your username again after 7 days.'
        : 'Your $_label has been saved.';
  }

  String _formatDate(DateTime? value) {
    if (value == null) return '';
    final year = value.year.toString().padLeft(4, '0');
    final month = value.month.toString().padLeft(2, '0');
    final day = value.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }
}

class _ContactVerificationPanel extends StatelessWidget {
  const _ContactVerificationPanel({
    required this.isDark,
    required this.codeController,
    required this.codeSent,
    required this.target,
    required this.onSendCode,
  });

  final bool isDark;
  final TextEditingController codeController;
  final bool codeSent;
  final String target;
  final VoidCallback onSendCode;

  @override
  Widget build(BuildContext context) {
    final useArabicCopy = _useArabicCopy(context);
    final accentColor = AppColors.primary;
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: accentColor.withValues(alpha: isDark ? 0.14 : 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: accentColor.withValues(alpha: 0.22)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            useArabicCopy ? 'تأكيد رقم الموبايل الجديد' : 'Confirm new phone',
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          Text(
            useArabicCopy
                ? 'هنبعت كود واتساب للرقم الحالي $target. اكتبه هنا قبل حفظ الرقم الجديد.'
                : 'We will send a WhatsApp code to your current phone $target. Enter it here before saving the new phone.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: mutedColor,
              height: 1.35,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: codeController,
                  enabled: codeSent,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.done,
                  decoration: InputDecoration(
                    labelText: useArabicCopy ? 'كود واتساب' : 'WhatsApp code',
                    prefixIcon: const Icon(AppIcons.security_safe),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                height: 50,
                child: FilledButton(
                  onPressed: onSendCode,
                  style: FilledButton.styleFrom(
                    backgroundColor: accentColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    codeSent
                        ? (useArabicCopy ? 'إعادة إرسال' : 'Resend')
                        : (useArabicCopy ? 'إرسال واتساب' : 'Send WhatsApp'),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
