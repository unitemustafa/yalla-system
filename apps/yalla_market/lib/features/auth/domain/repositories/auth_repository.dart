import '../../../../core/network/api_result.dart';
import '../entities/auth_session.dart';
import '../entities/auth_user.dart';

abstract class AuthRepository {
  Future<ApiResult<AuthSession?>> restoreSavedSession();

  Future<ApiResult<AuthSession>> login({
    required String email,
    required String password,
    bool rememberMe = false,
  });

  Future<ApiResult<bool>> isUsernameAvailable(String username);

  Future<ApiResult<bool>> isEmailRegistered(String email);

  Future<ApiResult<bool>> isPhoneRegistered(String phone);

  Future<ApiResult<AuthSession>> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? username,
    String? phone,
  });

  Future<ApiResult<AuthSession>> verifyEmail({
    required String email,
    required String code,
  });

  Future<ApiResult<bool>> resendVerificationCode(String email);

  Future<ApiResult<bool>> requestPasswordReset(String email);

  Future<ApiResult<AuthUser>> me();

  Future<ApiResult<AuthUser>> updateProfile({
    String? firstName,
    String? lastName,
    String? username,
    String? email,
    String? phone,
    String? gender,
    DateTime? birthDate,
  });

  Future<ApiResult<bool>> logout();

  Future<ApiResult<bool>> deleteAccountWithPassword(String password);
}
