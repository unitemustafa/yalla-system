import '../../../../core/network/api_result.dart';
import '../entities/product_data.dart';
import '../repositories/product_repository.dart';

class GetProductsUseCase {
  const GetProductsUseCase(this._repository);

  final ProductRepository _repository;

  Future<ApiResult<List<ProductData>>> call({String? citySlug}) {
    return _repository.getProducts(citySlug: citySlug);
  }
}
