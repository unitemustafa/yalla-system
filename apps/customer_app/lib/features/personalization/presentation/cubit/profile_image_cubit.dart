import 'dart:typed_data';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/pick_profile_image_usecase.dart';

sealed class ProfileImageState {
  const ProfileImageState();
}

final class ProfileImageInitial extends ProfileImageState {
  const ProfileImageInitial();
}

final class ProfileImageLoading extends ProfileImageState {
  const ProfileImageLoading();
}

final class ProfileImageSuccess extends ProfileImageState {
  const ProfileImageSuccess(this.bytes);

  final Uint8List bytes;
}

final class ProfileImageFailure extends ProfileImageState {
  const ProfileImageFailure(this.message);

  final String message;
}

class ProfileImageCubit extends Cubit<ProfileImageState> {
  ProfileImageCubit(this._pickProfileImageUseCase)
    : super(const ProfileImageInitial());

  final PickProfileImageUseCase _pickProfileImageUseCase;

  Future<Uint8List?> pickProfileImage() async {
    emit(const ProfileImageLoading());

    final result = await _pickProfileImageUseCase();
    return result.when(
      success: (bytes) {
        if (bytes == null) {
          emit(const ProfileImageInitial());
          return null;
        }

        emit(ProfileImageSuccess(bytes));
        return bytes;
      },
      failure: (failure) {
        emit(ProfileImageFailure(failure.message));
        return null;
      },
    );
  }
}
