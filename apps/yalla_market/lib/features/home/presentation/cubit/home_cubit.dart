import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/home_repository.dart';
import '../../domain/home_data.dart';

sealed class HomeState {
  const HomeState();
}

final class HomeInitial extends HomeState {
  const HomeInitial();
}

final class HomeLoading extends HomeState {
  const HomeLoading();
}

final class HomeReady extends HomeState {
  const HomeReady(this.data);

  final HomeData data;
}

final class HomeEmpty extends HomeState {
  const HomeEmpty(this.data);

  final HomeData data;
}

final class HomeLocationRequired extends HomeState {
  const HomeLocationRequired();
}

final class HomeFailure extends HomeState {
  const HomeFailure(this.message);

  final String message;
}

class HomeCubit extends Cubit<HomeState> {
  HomeCubit(this._repository) : super(const HomeInitial());

  final HomeRepository _repository;

  Future<void> load({bool force = false}) async {
    if (state is HomeLoading) return;
    if (!force && (state is HomeReady || state is HomeEmpty)) return;
    emit(const HomeLoading());
    final result = await _repository.load();
    result.when(
      success: (data) => emit(data.isEmpty ? HomeEmpty(data) : HomeReady(data)),
      failure: (failure) => emit(
        failure.statusCode == 428
            ? const HomeLocationRequired()
            : HomeFailure(failure.message),
      ),
    );
  }
}
