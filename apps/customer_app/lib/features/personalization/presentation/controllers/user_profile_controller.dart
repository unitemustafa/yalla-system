import 'package:flutter/foundation.dart';

import '../../../auth/domain/entities/auth_user.dart';

class UserProfileController extends ChangeNotifier
    implements ValueListenable<UserProfileController> {
  UserProfileController._();

  static final UserProfileController instance = UserProfileController._();

  String _displayName = 'عميل زائر';
  String _id = '';
  String _firstName = 'زائر';
  String _lastName = 'عميل';
  String _username = 'guest';
  String _email = 'guest@yallamarket.local';
  String _phone = '';
  String _gender = '';
  bool _hasPassword = true;
  DateTime? _birthDate;
  DateTime? _usernameChangedAt;
  String? _avatarUrl;
  Uint8List? _avatarBytes;

  String get displayName => _displayName;
  String get id => _id;
  String get firstName => _firstName;
  String get lastName => _lastName;
  String get username => _username;
  String get email => _email;
  String get phone => _phone;
  String get gender => _gender;
  bool get hasPassword => _hasPassword;
  DateTime? get birthDate => _birthDate;
  DateTime? get usernameChangedAt => _usernameChangedAt;
  String? get avatarUrl => _avatarUrl;
  Uint8List? get avatarBytes => _avatarBytes;
  DateTime? get nextUsernameChangeAt {
    final changedAt = _usernameChangedAt;
    if (changedAt == null) return null;
    return changedAt.add(const Duration(days: 7));
  }

  bool get canChangeUsername {
    final nextChangeAt = nextUsernameChangeAt;
    return nextChangeAt == null || !nextChangeAt.isAfter(DateTime.now());
  }

  @override
  UserProfileController get value => this;

  String get initials {
    final words = _displayName
        .trim()
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();

    if (words.isEmpty) return 'U';
    if (words.length == 1) return words.first.substring(0, 1).toUpperCase();

    return '${words.first.substring(0, 1)}${words.last.substring(0, 1)}'
        .toUpperCase();
  }

  void updateDisplayName(String value) {
    final nextName = value.trim();
    if (nextName.isEmpty || nextName == _displayName) return;

    _displayName = nextName;
    notifyListeners();
  }

  void updateAvatar(Uint8List bytes) {
    _avatarBytes = bytes;
    notifyListeners();
  }

  void updateFromAuthUser(AuthUser user) {
    final nextDisplayName = '${user.firstName} ${user.lastName}'.trim();

    _id = user.id;
    _firstName = user.firstName;
    _lastName = user.lastName;
    _displayName = nextDisplayName.isEmpty ? user.email : nextDisplayName;
    _username = user.username?.trim().isNotEmpty == true
        ? user.username!.trim()
        : user.email.split('@').first;
    _email = user.email;
    _phone = user.phone ?? '';
    _gender = user.gender ?? '';
    _hasPassword = user.hasPassword;
    _birthDate = user.birthDate;
    _usernameChangedAt = user.usernameChangedAt;
    _avatarUrl = user.avatarUrl;
    _avatarBytes = null;
    notifyListeners();
  }

  void reset() {
    _displayName = 'عميل زائر';
    _id = '';
    _firstName = 'زائر';
    _lastName = 'عميل';
    _username = 'guest';
    _email = 'guest@yallamarket.local';
    _phone = '';
    _gender = '';
    _hasPassword = true;
    _birthDate = null;
    _usernameChangedAt = null;
    _avatarUrl = null;
    _avatarBytes = null;
    notifyListeners();
  }
}
