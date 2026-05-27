import '../../../../core/network/api_result.dart';
import '../entities/product_data.dart';
import '../repositories/product_repository.dart';

class SearchProductsUseCase {
  const SearchProductsUseCase(this._repository);

  final ProductRepository _repository;

  Future<ApiResult<List<ProductData>>> call(String query, {String? citySlug}) {
    return _repository.searchProducts(query, citySlug: citySlug);
  }
}
