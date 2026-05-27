import '../../../../core/network/api_result.dart';
import '../entities/brand_data.dart';
import '../repositories/product_repository.dart';

class GetBrandsUseCase {
  const GetBrandsUseCase(this._repository);

  final ProductRepository _repository;

  Future<ApiResult<List<BrandData>>> call() {
    return _repository.getBrands();
  }
}
