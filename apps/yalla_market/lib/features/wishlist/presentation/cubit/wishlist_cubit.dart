import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/wishlist_item.dart';
import '../../domain/usecases/wishlist_usecases.dart';

class WishlistCubit extends Cubit<List<WishlistItem>> {
  WishlistCubit(this._wishlistUseCases) : super(const []) {
    loadWishlist();
  }

  final WishlistUseCases _wishlistUseCases;

  Future<void> loadWishlist() async {
    final result = await _wishlistUseCases.getItems();
    result.when(success: emit, failure: (_) {});
  }

  Future<void> toggleItem(WishlistItem item) async {
    final result = await _wishlistUseCases.toggleItem(item);
    result.when(success: emit, failure: (_) {});
  }

  bool isFavorite(String title) {
    return state.any((element) => element.title == title);
  }
}
