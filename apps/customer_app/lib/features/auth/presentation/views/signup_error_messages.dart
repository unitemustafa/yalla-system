part of 'signup_view.dart';

String _signupErrorTitle(String? message) {
  final normalizedMessage = message?.toLowerCase() ?? '';

  if (normalizedMessage.contains('already exists')) {
    return 'Account already exists';
  }

  if (normalizedMessage.contains('email')) {
    return 'Email unavailable';
  }

  if (normalizedMessage.contains('phone')) {
    return 'Phone unavailable';
  }

  if (normalizedMessage.contains('username')) {
    return 'Username unavailable';
  }

  if (normalizedMessage.contains('deactivated') ||
      normalizedMessage.contains('closed')) {
    return 'Account unavailable';
  }

  if (normalizedMessage.contains('internet') ||
      normalizedMessage.contains('connection') ||
      normalizedMessage.contains('timed out')) {
    return 'Connection problem';
  }

  return 'Account creation failed';
}
