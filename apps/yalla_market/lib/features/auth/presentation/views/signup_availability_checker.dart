import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/utils/validators.dart';
import '../cubit/auth_cubit.dart';

/// Handles availability checking (email, phone, username) extracted from
/// [_SignupViewState] to keep the main state class focused on UI.
///
/// Call [updateContext] on every [build] call to keep the [BuildContext]
/// fresh for async operations triggered from listener callbacks.
class SignupAvailabilityChecker {
  SignupAvailabilityChecker({
    required this.emailController,
    required this.phoneController,
    required this.usernameController,
    required this.formKey,
    required this.onStateChanged,
    required this.phoneForLookup,
    required this.validatePhoneFormat,
    required this.validateUsername,
    required this.canCheckEmail,
    required this.canCheckPhone,
  });

  final TextEditingController emailController;
  final TextEditingController phoneController;
  final TextEditingController usernameController;
  final GlobalKey<FormState> formKey;

  /// Called whenever internal state changes — pass `() => setState(() {})`.
  final VoidCallback onStateChanged;

  /// Returns the phone number in lookup format (dial code + digits).
  final String Function() phoneForLookup;

  /// Returns a validation error message or null if valid.
  final String? Function(String?) validatePhoneFormat;

  /// Returns a validation error message or null if valid.
  final String? Function(String?) validateUsername;

  /// Allows email lookup only after previous fields are valid.
  final bool Function() canCheckEmail;

  /// Allows phone lookup only after email has already been verified available.
  final bool Function() canCheckPhone;

  /// Must be updated each build via [updateContext].
  BuildContext? _context;

  /// Call this at the top of the widget's [build] method to keep the context
  /// up-to-date for async operations triggered by text-field listeners.
  void updateContext(BuildContext context) => _context = context;

  // ── State ────────────────────────────────────────────────────────────────

  Timer? _usernameLookupDebounce;
  Timer? _emailLookupDebounce;
  Timer? _phoneLookupDebounce;

  String? usernameAvailabilityMessage;
  String? emailAvailabilityMessage;
  String? phoneAvailabilityMessage;

  String? _lastCheckedUsername;
  String? _lastCheckedEmail;
  String? _lastCheckedPhone;

  String? get lastCheckedUsername => _lastCheckedUsername;
  String? get lastCheckedEmail => _lastCheckedEmail;
  String? get lastCheckedPhone => _lastCheckedPhone;

  bool? isUsernameAvailable;
  bool? isEmailAvailable;
  bool? isPhoneAvailable;

  bool isCheckingUsername = false;
  bool isCheckingEmail = false;
  bool isCheckingPhone = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  void dispose() {
    _usernameLookupDebounce?.cancel();
    _emailLookupDebounce?.cancel();
    _phoneLookupDebounce?.cancel();
  }

  // ── Email ────────────────────────────────────────────────────────────────

  void scheduleEmailCheck() {
    _emailLookupDebounce?.cancel();

    final email = emailController.text.trim().toLowerCase();
    final validationMessage = Validators.email(email);

    _lastCheckedEmail = null;
    isEmailAvailable = null;
    isCheckingEmail = false;
    emailAvailabilityMessage = null;
    onStateChanged();

    if (email.isEmpty || validationMessage != null || !canCheckEmail()) return;

    _emailLookupDebounce = Timer(const Duration(milliseconds: 450), () {
      final ctx = _context;
      if (ctx == null || !ctx.mounted) return;
      // ignore: discarded_futures
      _checkEmailAvailability(context: ctx, showWarningOnError: false);
    });
  }

  Future<bool> ensureEmailAvailable(BuildContext context) async {
    final email = emailController.text.trim().toLowerCase();

    if (email.isEmpty || Validators.email(email) != null || !canCheckEmail()) {
      formKey.currentState?.validate();
      return false;
    }

    if (_lastCheckedEmail == email && isEmailAvailable == true) {
      return true;
    }

    final available = await _checkEmailAvailability(
      context: context,
      showWarningOnError: true,
    );

    if (!available) {
      formKey.currentState?.validate();
    }

    return available;
  }

  Future<bool> _checkEmailAvailability({
    required BuildContext context,
    required bool showWarningOnError,
  }) async {
    final email = emailController.text.trim().toLowerCase();

    if (email.isEmpty || Validators.email(email) != null || !canCheckEmail()) {
      isCheckingEmail = false;
      isEmailAvailable = null;
      _lastCheckedEmail = null;
      emailAvailabilityMessage = null;
      onStateChanged();
      return false;
    }

    isCheckingEmail = true;
    emailAvailabilityMessage = 'Checking email...';
    onStateChanged();

    try {
      final isAvailable = await context.read<AuthCubit>().isEmailAvailable(
        email,
      );

      if (email != emailController.text.trim().toLowerCase()) {
        return false;
      }

      isCheckingEmail = false;
      isEmailAvailable = isAvailable;
      _lastCheckedEmail = email;
      emailAvailabilityMessage = isAvailable
          ? 'Email is available.'
          : 'This email is already registered.';
      onStateChanged();

      return isAvailable;
    } catch (_) {
      isCheckingEmail = false;
      isEmailAvailable = null;
      _lastCheckedEmail = null;
      emailAvailabilityMessage = 'Could not check email right now.';
      onStateChanged();

      if (showWarningOnError && context.mounted) {
        CustomSnackBar.showWarning(
          context: context,
          title: 'Email check skipped',
          message: 'We will verify it while creating your account.',
        );
      }

      return showWarningOnError;
    }
  }

  // ── Phone ────────────────────────────────────────────────────────────────

  void schedulePhoneCheck() {
    _phoneLookupDebounce?.cancel();

    final validationMessage = validatePhoneFormat(phoneController.text);

    _lastCheckedPhone = null;
    isPhoneAvailable = null;
    isCheckingPhone = false;
    phoneAvailabilityMessage = null;
    onStateChanged();

    if (validationMessage != null || !canCheckPhone()) return;

    _phoneLookupDebounce = Timer(const Duration(milliseconds: 450), () {
      final ctx = _context;
      if (ctx == null || !ctx.mounted) return;
      // ignore: discarded_futures
      _checkPhoneAvailability(context: ctx, showWarningOnError: false);
    });
  }

  Future<bool> ensurePhoneAvailable(BuildContext context) async {
    final validationMessage = validatePhoneFormat(phoneController.text);

    if (validationMessage != null || !canCheckPhone()) {
      formKey.currentState?.validate();
      return false;
    }

    final phone = phoneForLookup();
    if (_lastCheckedPhone == phone && isPhoneAvailable == true) {
      return true;
    }

    final available = await _checkPhoneAvailability(
      context: context,
      showWarningOnError: true,
    );

    if (!available) {
      formKey.currentState?.validate();
    }

    return available;
  }

  Future<bool> _checkPhoneAvailability({
    required BuildContext context,
    required bool showWarningOnError,
  }) async {
    final validationMessage = validatePhoneFormat(phoneController.text);

    if (validationMessage != null || !canCheckPhone()) {
      isCheckingPhone = false;
      isPhoneAvailable = null;
      _lastCheckedPhone = null;
      phoneAvailabilityMessage = null;
      onStateChanged();
      return false;
    }

    final phone = phoneForLookup();

    isCheckingPhone = true;
    phoneAvailabilityMessage = 'Checking phone number...';
    onStateChanged();

    try {
      final isAvailable = await context.read<AuthCubit>().isPhoneAvailable(
        phone,
      );

      if (phone != phoneForLookup()) {
        return false;
      }

      isCheckingPhone = false;
      isPhoneAvailable = isAvailable;
      _lastCheckedPhone = phone;
      phoneAvailabilityMessage = isAvailable
          ? 'Phone number is available.'
          : 'This phone number is already registered.';
      onStateChanged();

      return isAvailable;
    } catch (_) {
      isCheckingPhone = false;
      isPhoneAvailable = null;
      _lastCheckedPhone = null;
      phoneAvailabilityMessage = 'Could not check phone number right now.';
      onStateChanged();

      if (showWarningOnError && context.mounted) {
        CustomSnackBar.showWarning(
          context: context,
          title: 'Phone check skipped',
          message: 'We will verify it while creating your account.',
        );
      }

      return showWarningOnError;
    }
  }

  // ── Username ─────────────────────────────────────────────────────────────

  void scheduleUsernameCheck() {
    _usernameLookupDebounce?.cancel();

    final username = usernameController.text.trim();
    final validationMessage = validateUsername(username);

    _lastCheckedUsername = null;
    isUsernameAvailable = null;
    isCheckingUsername = false;
    usernameAvailabilityMessage = validationMessage;
    onStateChanged();

    if (username.isEmpty || validationMessage != null) return;

    _usernameLookupDebounce = Timer(const Duration(milliseconds: 450), () {
      final ctx = _context;
      if (ctx == null || !ctx.mounted) return;
      // ignore: discarded_futures
      _checkUsernameAvailability(context: ctx, showWarningOnError: false);
    });
  }

  Future<bool> ensureUsernameAvailable(BuildContext context) async {
    final username = usernameController.text.trim();

    if (username.isEmpty) return true;

    if (_lastCheckedUsername == username && isUsernameAvailable == true) {
      return true;
    }

    final available = await _checkUsernameAvailability(
      context: context,
      showWarningOnError: true,
    );

    if (!available) {
      formKey.currentState?.validate();
    }

    return available;
  }

  Future<bool> _checkUsernameAvailability({
    required BuildContext context,
    required bool showWarningOnError,
  }) async {
    final username = usernameController.text.trim();
    final validationMessage = validateUsername(username);

    if (username.isEmpty) {
      isCheckingUsername = false;
      isUsernameAvailable = null;
      _lastCheckedUsername = null;
      usernameAvailabilityMessage = null;
      onStateChanged();
      return true;
    }

    if (validationMessage != null) {
      isCheckingUsername = false;
      isUsernameAvailable = null;
      _lastCheckedUsername = null;
      usernameAvailabilityMessage = validationMessage;
      onStateChanged();
      return false;
    }

    isCheckingUsername = true;
    usernameAvailabilityMessage = 'Checking username...';
    onStateChanged();

    try {
      final isAvailable = await context.read<AuthCubit>().isUsernameAvailable(
        username,
      );

      if (username != usernameController.text.trim()) {
        return false;
      }

      isCheckingUsername = false;
      isUsernameAvailable = isAvailable;
      _lastCheckedUsername = username;
      usernameAvailabilityMessage = isAvailable
          ? 'Username is available.'
          : 'This username is already taken.';
      onStateChanged();

      return isAvailable;
    } catch (_) {
      isCheckingUsername = false;
      isUsernameAvailable = null;
      _lastCheckedUsername = null;
      usernameAvailabilityMessage = 'Could not check username right now.';
      onStateChanged();

      if (showWarningOnError && context.mounted) {
        CustomSnackBar.showWarning(
          context: context,
          title: 'Username check skipped',
          message: 'We will verify it while creating your account.',
        );
      }

      return showWarningOnError;
    }
  }
}
