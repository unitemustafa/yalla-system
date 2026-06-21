import 'package:get_it/get_it.dart';

import 'core_di.dart';
import '../../features/auth/di/auth_di.dart';
import '../../features/cart/di/cart_di.dart';
import '../../features/location/di/location_di.dart';
import '../../features/onboarding/di/onboarding_di.dart';
import '../../features/personalization/di/personalization_di.dart';
import '../../features/splash/di/splash_di.dart';
import '../../features/store/di/store_di.dart';
import '../../features/wishlist/di/wishlist_di.dart';
import '../../features/home/di/home_di.dart';

final GetIt sl = GetIt.instance;

void initServiceLocator() {
  registerCoreDependencies(sl);
  registerOnboardingDependencies(sl);
  registerLocationDependencies(sl);
  registerHomeDependencies(sl);
  registerAuthDependencies(sl);
  registerSplashDependencies(sl);
  registerStoreDependencies(sl);
  registerCartDependencies(sl);
  registerWishlistDependencies(sl);
  registerPersonalizationDependencies(sl);
}
