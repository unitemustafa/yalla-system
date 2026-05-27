class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.avatarUrl,
    this.hasPassword = true,
    this.username,
    this.phone,
    this.gender,
    this.birthDate,
    this.usernameChangedAt,
  });

  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String? avatarUrl;
  final bool hasPassword;
  final String? username;
  final String? phone;
  final String? gender;
  final DateTime? birthDate;
  final DateTime? usernameChangedAt;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName:
          json['firstName'] as String? ?? json['first_name'] as String? ?? '',
      lastName:
          json['lastName'] as String? ?? json['last_name'] as String? ?? '',
      role: json['role'] as String? ?? 'CUSTOMER',
      avatarUrl: json['avatarUrl'] as String? ?? json['avatar_url'] as String?,
      hasPassword:
          json['hasPassword'] as bool? ?? json['has_password'] as bool? ?? true,
      username: json['username'] as String?,
      phone: json['phone'] as String?,
      gender: json['gender'] as String?,
      birthDate: _dateFromString(json['birthDate'] ?? json['birth_date']),
      usernameChangedAt: _dateFromString(
        json['usernameChangedAt'] ?? json['username_changed_at'],
      ),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
      'avatarUrl': avatarUrl,
      'hasPassword': hasPassword,
      'username': username,
      'phone': phone,
      'gender': gender,
      'birthDate': birthDate?.toIso8601String(),
      'usernameChangedAt': usernameChangedAt?.toIso8601String(),
    };
  }

  AuthUser copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? role,
    String? avatarUrl,
    bool? hasPassword,
    String? username,
    String? phone,
    String? gender,
    DateTime? birthDate,
    DateTime? usernameChangedAt,
  }) {
    return AuthUser(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      hasPassword: hasPassword ?? this.hasPassword,
      username: username ?? this.username,
      phone: phone ?? this.phone,
      gender: gender ?? this.gender,
      birthDate: birthDate ?? this.birthDate,
      usernameChangedAt: usernameChangedAt ?? this.usernameChangedAt,
    );
  }
}

DateTime? _dateFromString(Object? value) {
  if (value is! String || value.trim().isEmpty) return null;
  return DateTime.tryParse(value);
}
