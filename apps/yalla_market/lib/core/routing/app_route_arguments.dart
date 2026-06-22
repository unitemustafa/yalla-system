class NavigationMenuRouteArgs {
  const NavigationMenuRouteArgs({this.initialIndex = 0});

  final int initialIndex;
}

class LoginRouteArgs {
  const LoginRouteArgs({this.showSessionExpiredNotice = false});

  final bool showSessionExpiredNotice;
}

class AllProductsRouteArgs {
  const AllProductsRouteArgs({
    this.title = 'Popular Products',
    this.subtitle = 'Browse all curated products',
  });

  final String title;
  final String subtitle;
}

class BrandProductsRouteArgs {
  const BrandProductsRouteArgs({
    required this.brand,
    required this.logo,
    required this.productCount,
    this.shopId,
  });

  final String brand;
  final String logo;
  final String productCount;
  final String? shopId;
}

class ProductDetailRouteArgs {
  const ProductDetailRouteArgs({
    required this.image,
    required this.title,
    required this.brand,
    required this.price,
    this.productId,
    this.productSlug,
    this.oldPrice,
    this.discount,
  });

  final String image;
  final String title;
  final String brand;
  final String price;
  final String? productId;
  final String? productSlug;
  final String? oldPrice;
  final String? discount;
}
