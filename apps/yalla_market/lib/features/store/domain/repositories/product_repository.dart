import '../../../../core/network/api_result.dart';
import '../entities/brand_data.dart';
import '../entities/category_data.dart';
import '../entities/product_data.dart';

abstract class ProductRepository {
  Future<ApiResult<List<ProductData>>> getProducts({String? citySlug});

  Future<ApiResult<ProductData>> getProduct(String idOrSlug);

  Future<ApiResult<List<ProductData>>> searchProducts(
    String query, {
    String? citySlug,
  });

  Future<ApiResult<List<CategoryData>>> getCategories();

  Future<ApiResult<List<BrandData>>> getBrands();
}
