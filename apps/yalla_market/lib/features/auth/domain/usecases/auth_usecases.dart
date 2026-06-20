import '../../../../core/network/api_result.dart';
import '../entities/auth_session.dart';
import '../entities/auth_user.dart';
import '../repositories/auth_repository.dart';

class AuthUseCases {
  const AuthUseCases({
    required this.restoreSavedSession,
    required this.login,
    required this.checkUsernameAvailability,
    required this.checkEmailRegistration,
    required this.checkPhoneRegistration,
    required this.signup,
    required this.verifyEmail,
    required this.resendVerificationCode,
    required this.requestPasswordReset,
    required this.refreshProfile,
    required this.updateProfile,
    required this.logout,
    required this.deleteAccountWithPassword,
  });

  final RestoreSavedSessionUseCase restoreSavedSession;
  final LoginUseCase login;
  final CheckUsernameAvailabilityUseCase checkUsernameAvailability;
  final CheckEmailRegistrationUseCase checkEmailRegistration;
  final CheckPhoneRegistrationUseCase checkPhoneRegistration;
  final SignupUseCase signup;
  final VerifyEmailUseCase verifyEmail;
  final ResendVerificationCodeUseCase resendVerificationCode;
  final RequestPasswordResetUseCase requestPasswordReset;
  final RefreshProfileUseCase refreshProfile;
  final UpdateProfileUseCase updateProfile;
  final LogoutUseCase logout;
  final DeleteAccountWithPasswordUseCase deleteAccountWithPassword;
}

class RestoreSavedSessionUseCase {
  const RestoreSavedSessionUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<AuthSession?>> call() {
    return _repository.restoreSavedSession();
  }
}

class LoginUseCase {
  const LoginUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<AuthSession>> call({
    required String email,
    required String password,
    bool rememberMe = false,
  }) {
    return _repository.login(
      email: email,
      password: password,
      rememberMe: rememberMe,
    );
  }
}

class CheckUsernameAvailabilityUseCase {
  const CheckUsernameAvailabilityUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<bool>> call(String username) {
    return _repository.isUsernameAvailable(username);
  }
}

class CheckEmailRegistrationUseCase {
  const CheckEmailRegistrationUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<bool>> call(String email) {
    return _repository.isEmailRegistered(email);
  }
}

class CheckPhoneRegistrationUseCase {
  const CheckPhoneRegistrationUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<bool>> call(String phone) {
    return _repository.isPhoneRegistered(phone);
  }
}

class SignupUseCase {
  const SignupUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<AuthSession>> call({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? username,
    String? phone,
  }) {
    return _repository.signup(
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      username: username,
      phone: phone,
    );
  }
}

class VerifyEmailUseCase {
  const VerifyEmailUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<AuthSession>> call({
    required String email,
    required String code,
  }) {
    return _repository.verifyEmail(email: email, code: code);
  }
}

class ResendVerificationCodeUseCase {
  const ResendVerificationCodeUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<bool>> call(String email) {
    return _repository.resendVerificationCode(email);
  }
}

class RequestPasswordResetUseCase {
  const RequestPasswordResetUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<bool>> call(String email) {
    return _repository.requestPasswordReset(email);
  }
}

class RefreshProfileUseCase {
  const RefreshProfileUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<AuthUser>> call() {
    return _repository.me();
  }
}

class UpdateProfileUseCase {
  const UpdateProfileUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<AuthUser>> call({
    String? firstName,
    String? lastName,
    String? username,
    String? email,
    String? phone,
    String? gender,
    DateTime? birthDate,
  }) {
    return _repository.updateProfile(
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      phone: phone,
      gender: gender,
      birthDate: birthDate,
    );
  }
}

class LogoutUseCase {
  const LogoutUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<bool>> call() {
    return _repository.logout();
  }
}

class DeleteAccountWithPasswordUseCase {
  const DeleteAccountWithPasswordUseCase(this._repository);

  final AuthRepository _repository;

  Future<ApiResult<bool>> call(String password) {
    return _repository.deleteAccountWithPassword(password);
  }
}
