import 'dart:typed_data';

import '../../../../core/network/api_result.dart';
import '../repositories/profile_image_repository.dart';

class PickProfileImageUseCase {
  const PickProfileImageUseCase(this._repository);

  final ProfileImageRepository _repository;

  Future<ApiResult<Uint8List?>> call() => _repository.pickProfileImage();
}
