import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/errors/failure.dart';
import 'package:yallamarket/core/network/api_result.dart';
import 'package:yallamarket/features/personalization/domain/repositories/profile_image_repository.dart';
import 'package:yallamarket/features/personalization/domain/usecases/pick_profile_image_usecase.dart';
import 'package:yallamarket/features/personalization/presentation/cubit/profile_image_cubit.dart';

void main() {
  group('ProfileImageCubit', () {
    test('emits success when profile image is picked', () async {
      final bytes = Uint8List.fromList([1, 2, 3]);
      final cubit = ProfileImageCubit(
        PickProfileImageUseCase(_FakeProfileImageRepository(bytes)),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<ProfileImageLoading>(), isA<ProfileImageSuccess>()]),
      );

      final result = await cubit.pickProfileImage();

      expect(result, bytes);
      await expectedStates;

      await cubit.close();
    });

    test('emits failure when image picking fails', () async {
      final cubit = ProfileImageCubit(
        PickProfileImageUseCase(_FakeProfileImageRepository.failure()),
      );
      final expectedStates = expectLater(
        cubit.stream,
        emitsInOrder([isA<ProfileImageLoading>(), isA<ProfileImageFailure>()]),
      );

      final result = await cubit.pickProfileImage();

      expect(result, isNull);
      await expectedStates;

      await cubit.close();
    });
  });
}

class _FakeProfileImageRepository implements ProfileImageRepository {
  _FakeProfileImageRepository(this.bytes) : shouldFail = false;

  _FakeProfileImageRepository.failure() : bytes = null, shouldFail = true;

  final Uint8List? bytes;
  final bool shouldFail;

  @override
  Future<ApiResult<Uint8List?>> pickProfileImage() async {
    if (shouldFail) {
      return const ApiResult.failure(UnknownFailure('Could not open gallery.'));
    }

    return ApiResult.success(bytes);
  }
}
