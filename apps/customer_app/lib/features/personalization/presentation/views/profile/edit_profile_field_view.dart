import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

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

class EditProfileFieldView extends StatefulWidget {
  const EditProfileFieldView({super.key, required this.field});

  final EditableProfileField field;

  @override
  State<EditProfileFieldView> createState() => _EditProfileFieldViewState();
}

class _EditProfileFieldViewState extends State<EditProfileFieldView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _controller;
  bool _isSaving = false;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    final profile = UserProfileController.instance;
    _selectedDate = profile.birthDate;
    _controller = TextEditingController(text: _initialValue(profile));
  }

  @override
  void dispose() {
    _controller.dispose();
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
                              label: 'Save',
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
      return DropdownButtonFormField<String>(
        initialValue: _controller.text.isEmpty ? null : _controller.text,
        validator: (value) => value == null || value.isEmpty
            ? context.tr('Choose a gender option')
            : null,
        decoration: _inputDecoration(isDark),
        items: const ['Male', 'Female', 'Prefer not to say']
            .map(
              (value) => DropdownMenuItem(
                value: value,
                child: Text(context.tr(value)),
              ),
            )
            .toList(),
        onChanged: _isSaving ? null : (value) => _controller.text = value ?? '',
      );
    }

    return TextFormField(
      controller: _controller,
      enabled: !_isSaving,
      readOnly: widget.field == EditableProfileField.birthDate,
      validator: _validate,
      keyboardType: _keyboardType,
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
    setState(() => _isSaving = true);

    final profile = UserProfileController.instance;
    final value = _controller.text.trim();
    final names = _splitName(value);
    final updatedUser = await context.read<AuthCubit>().updateProfile(
      firstName: widget.field == EditableProfileField.name ? names.$1 : null,
      lastName: widget.field == EditableProfileField.name ? names.$2 : null,
      username: widget.field == EditableProfileField.username ? value : null,
      email: widget.field == EditableProfileField.email ? value : null,
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
