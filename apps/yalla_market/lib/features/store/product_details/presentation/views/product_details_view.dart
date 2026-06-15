import 'package:flutter/material.dart';

import '../../../../../core/formatters/app_currency.dart';
import '../../../../cart/data/models/cart_item_model.dart';
import '../../../presentation/views/product_detail_view.dart';
import '../../data/models/product_model.dart';

class ProductDetailsView extends StatelessWidget {
  const ProductDetailsView({
    super.key,
    required this.product,
    this.onAddToCart,
  });

  final ProductModel product;
  final ValueChanged<CartItemModel>? onAddToCart;

  @override
  Widget build(BuildContext context) {
    return ProductDetailView(
      productId: product.id.toString(),
      image: product.image,
      title: product.name,
      brand: 'Yalla Market',
      price: AppCurrency.format(product.effectiveBasePrice),
      oldPrice: product.hasDiscount
          ? AppCurrency.format(product.basePrice)
          : null,
      discount: _discountLabel(product),
    );
  }

  String? _discountLabel(ProductModel product) {
    if (!product.hasDiscount) return null;
    final discountPrice = product.discountPrice!;

    final discount =
        ((product.basePrice - discountPrice) / product.basePrice) * 100;
    if (discount <= 0) return null;
    return '${discount.round()}%';
  }
}
