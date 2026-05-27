import '../../../../core/network/api_result.dart';
import '../entities/category_data.dart';
import '../repositories/product_repository.dart';

class GetCategoriesUseCase {
  const GetCategoriesUseCase(this._repository);

  final ProductRepository _repository;

  Future<ApiResult<List<CategoryData>>> call() {
    return _repository.getCategories();
  }
}
