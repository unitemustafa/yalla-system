import '../../../auth/domain/entities/auth_session.dart';
import '../../../location/domain/entities/city_data.dart';

sealed class SplashState {
  const SplashState();
}

final class SplashLoading extends SplashState {
  const SplashLoading();
}

final class SplashNavigateTo extends SplashState {
  const SplashNavigateTo(this.route, {this.session, this.city});

  final String route;

  /// Non-null when a session was successfully restored; pass to [AuthCubit.hydrate].
  final AuthSession? session;

  /// Non-null when a city is already selected; pass to [LocationCubit.syncCity].
  final CityData? city;
}
