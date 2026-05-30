import 'dart:typed_data';

import '../../../../core/network/api_result.dart';

abstract class ProfileImageRepository {
  Future<ApiResult<Uint8List?>> pickProfileImage();
}
