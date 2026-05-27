import '../../domain/entities/brand_data.dart';
import '../../domain/entities/category_data.dart';
import '../../domain/entities/product_data.dart';
import '../../../location/domain/entities/city_data.dart';

sealed class ProductDiscoveryState {
  const ProductDiscoveryState();

  String get query => '';

  List<ProductData> get products => const [];

  List<CategoryData> get categories => const [];

  List<BrandData> get brands => const [];

  CityData? get city => null;
}

final class ProductDiscoveryInitial extends ProductDiscoveryState {
  const ProductDiscoveryInitial();
}

final class ProductDiscoveryLoading extends ProductDiscoveryState {
  const ProductDiscoveryLoading({
    this.query = '',
    this.products = const [],
    this.categories = const [],
    this.brands = const [],
    this.city,
  });

  @override
  final String query;

  @override
  final List<ProductData> products;

  @override
  final List<CategoryData> categories;

  @override
  final List<BrandData> brands;

  @override
  final CityData? city;
}

final class ProductDiscoveryNeedsCity extends ProductDiscoveryState {
  const ProductDiscoveryNeedsCity();
}

final class ProductDiscoveryReady extends ProductDiscoveryState {
  const ProductDiscoveryReady({
    required this.query,
    required this.products,
    required this.categories,
    required this.brands,
    required this.city,
  });

  @override
  final String query;

  @override
  final List<ProductData> products;

  @override
  final List<CategoryData> categories;

  @override
  final List<BrandData> brands;

  @override
  final CityData city;
}

final class ProductDiscoveryFailure extends ProductDiscoveryState {
  const ProductDiscoveryFailure(
    this.message, {
    this.query = '',
    this.products = const [],
    this.categories = const [],
    this.brands = const [],
    this.city,
  });

  final String message;

  @override
  final String query;

  @override
  final List<ProductData> products;

  @override
  final List<CategoryData> categories;

  @override
  final List<BrandData> brands;

  @override
  final CityData? city;
}
