import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';
import '../../data/demo/demo_categories.dart';
import '../../data/demo/demo_shops.dart';
import '../../../../core/formatters/app_currency.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../../../core/presentation/widgets/snackbars/custom_snackbar.dart';
import '../../../../core/presentation/widgets/texts/app_currency_text.dart';
import '../../../../core/presentation/widgets/texts/green_currency_price.dart';
import '../../../../core/routing/app_route_arguments.dart';
import '../../../../core/routing/app_routes.dart';
import '../../../../core/utils/image_downloader.dart';
import '../../../../features/cart/domain/entities/cart_item.dart';
import '../../../../features/cart/presentation/cubit/cart_cubit.dart';
import '../cubit/product_discovery_cubit.dart';
import '../../domain/entities/category_data.dart';
import '../../../wishlist/domain/entities/wishlist_item.dart';
import '../../../wishlist/presentation/cubit/wishlist_cubit.dart';

part 'product_detail_gallery_part.dart';
part 'product_detail_info_part.dart';
part 'product_detail_cart_part.dart';

List<String> _uniqueImageSources(Iterable<String> sources) {
  final images = <String>[];
  final seen = <String>{};

  for (final source in sources) {
    final image = source.trim();
    if (image.isEmpty || !seen.add(image)) continue;
    images.add(image);
  }

  return images;
}

class ProductDetailView extends StatefulWidget {
  const ProductDetailView({
    super.key,
    required this.image,
    required this.title,
    required this.brand,
    required this.price,
    this.productId,
    this.productSlug,
    this.oldPrice,
    this.discount,
  });

  final String image, title, brand, price;
  final String? productId, productSlug;
  final String? oldPrice, discount;

  @override
  State<ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductVariationData {
  const _ProductVariationData({
    required this.price,
    required this.stockQuantity,
    this.oldPrice,
    this.stock = 'In Stock',
  });

  final String price;
  final int stockQuantity;
  final String? oldPrice;
  final String stock;

  bool get isOutOfStock => stock == 'Out of Stock';
  bool get isLowStock => stockQuantity > 0 && stockQuantity < 5;
}

class _ProductDetailViewState extends State<ProductDetailView> {
  int quantity = 0;
  String selectedColor = 'Green';
  String selectedSize = 'Medium';
  late String currentImage;

  @override
  void initState() {
    super.initState();
    currentImage = widget.image;
  }

  _ProductVariationData get _currentVariation {
    final tier = _selectedPriceTier;
    final oldPrice = _variationPrice(widget.oldPrice, tier);
    final outOfStock =
        selectedSize == 'X-Large' ||
        (selectedColor == 'Red' && selectedSize == 'Large');
    final stockQuantity = outOfStock ? 0 : _availableQuantity;

    return _ProductVariationData(
      price: _variationPrice(widget.price, tier),
      stockQuantity: stockQuantity,
      oldPrice: oldPrice.isEmpty ? null : oldPrice,
      stock: outOfStock ? 'Out of Stock' : 'In Stock',
    );
  }

  int get _selectedPriceTier {
    return selectedSize == 'Large' || selectedSize == 'X-Large' ? 1 : 0;
  }

  int get _availableQuantity {
    final baseQuantity = switch (selectedSize) {
      'Small' => 12,
      'Medium' => 8,
      'Large' => 4,
      _ => 0,
    };
    final colorAdjustment = switch (selectedColor) {
      'Red' => -1,
      'Black' => 0,
      'Green' => 0,
      _ => 0,
    };
    return (baseQuantity + colorAdjustment).clamp(1, 99).toInt();
  }

  String _variationPrice(String? price, int tier) {
    final formatted = AppCurrency.formatPriceText(price);
    if (formatted.isEmpty) return '';

    final parts = formatted
        .split('-')
        .map((part) => part.trim())
        .where((part) => part.isNotEmpty)
        .toList(growable: false);

    if (parts.isEmpty) return '';

    final index = tier.clamp(0, parts.length - 1);
    return parts[index];
  }

  String _formatPrice(String? price) {
    return AppCurrency.formatPriceText(price);
  }

  String _formatSinglePrice(String? price) {
    return AppCurrency.formatPriceText(price?.split('-').first.trim());
  }

  double _parsePrice(String? price) {
    if (price == null) return 0;
    final singlePrice = price.split('-').first.trim();
    return double.tryParse(
          singlePrice.replaceAll(RegExp(r'[^0-9.,-]'), '').replaceAll(',', ''),
        ) ??
        0;
  }

  void _showImageDialog(BuildContext context, String imagePath) {
    final pageContext = context;

    showDialog(
      context: context,
      builder: (dialogContext) {
        final isDark = Theme.of(dialogContext).brightness == Brightness.dark;

        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCardColor : Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  height: 300,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.06)
                        : const Color(0xFFF3F5FA),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: AppImage(
                      source: imagePath,
                      fit: BoxFit.contain,
                      fallback: const Icon(AppIcons.image),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(dialogContext),
                        child: Text(pageContext.tr('Close')),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          final fileName = _imageFileName(imagePath);
                          final didDownload = await downloadAssetImage(
                            imagePath,
                            fileName,
                          );

                          if (!pageContext.mounted || !dialogContext.mounted) {
                            return;
                          }
                          Navigator.pop(dialogContext);

                          if (didDownload) {
                            CustomSnackBar.showSuccess(
                              context: pageContext,
                              title: 'Image download started',
                              message: fileName,
                            );
                          } else {
                            CustomSnackBar.showInfo(
                              context: pageContext,
                              title: 'Download unavailable here',
                              message: 'Try it from the web preview.',
                            );
                          }
                        },
                        icon: const Icon(AppIcons.document_download, size: 18),
                        label: Text(pageContext.tr('Download')),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _imageFileName(String imagePath) {
    final uri = Uri.tryParse(imagePath);
    final path = uri?.path ?? imagePath;
    final name = path.split('/').where((part) => part.isNotEmpty).lastOrNull;
    return name == null || name.isEmpty ? 'image' : name;
  }

  void _toggleWishlist(BuildContext context, bool wasFavorite) {
    context.read<WishlistCubit>().toggleItem(
      WishlistItem(
        image: widget.image,
        title: widget.title,
        brand: widget.brand,
        price: widget.price,
        oldPrice: widget.oldPrice,
        discount: widget.discount,
      ),
    );

    if (wasFavorite) {
      CustomSnackBar.showRemoved(
        context: context,
        title: 'Item removed from wishlist',
      );
    } else {
      CustomSnackBar.showAdded(
        context: context,
        title: 'Item added to wishlist',
      );
    }
  }

  void _addSelectedProductToCart({
    required BuildContext context,
    required _ProductVariationData variation,
    required bool isOutOfStock,
  }) {
    if (isOutOfStock) {
      CustomSnackBar.showWarning(
        context: context,
        title: 'Product is out of stock',
      );
      return;
    }

    if (quantity == 0) {
      CustomSnackBar.showWarning(
        context: context,
        title: 'Select quantity first',
      );
      return;
    }

    if (quantity > variation.stockQuantity) {
      CustomSnackBar.showWarning(
        context: context,
        title: context.isArabicLanguage
            ? 'متبقي ${variation.stockQuantity} فقط'
            : 'Only ${variation.stockQuantity} left in stock',
      );
      return;
    }

    context.read<CartCubit>().addItem(
      CartItemData(
        id: '${widget.title}_${selectedColor}_$selectedSize',
        productId: widget.productId,
        image: currentImage,
        brand: widget.brand,
        title: widget.title,
        price: _parsePrice(variation.price),
        quantity: 1,
        attributes: [
          CartItemAttribute(label: 'Color', value: selectedColor),
          CartItemAttribute(label: 'Size', value: selectedSize),
        ],
      ),
      quantity,
    );

    CustomSnackBar.showAdded(
      context: context,
      title: context.isArabicLanguage
          ? 'تمت إضافة ${context.productCount(quantity)} للسلة'
          : '${context.productCount(quantity)} added to cart',
    );
    setState(() => quantity = 0);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final variation = _currentVariation;
    final variationPrice = variation.price;
    final oldVariationPrice = variation.oldPrice;
    final stock = variation.stock;
    final isOutOfStock = variation.isOutOfStock;
    final stockColor = isOutOfStock ? AppColors.error : AppColors.success;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);
    final mutedColor = isDark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final textColor = isDark ? Colors.white : AppColors.lightTextPrimary;
    final isFavorite = context.watch<WishlistCubit>().isFavorite(widget.title);
    final thumbnailImages = _uniqueImageSources([
      widget.image,
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.tshirtBlueNoCollarFront,
      AppAssets.samsungS9Mobile,
    ]);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ProductGallery(
              isDark: isDark,
              currentImage: currentImage,
              thumbnailImages: thumbnailImages,
              isFavorite: isFavorite,
              onBack: () => Navigator.pop(context),
              onImageTap: () => _showImageDialog(context, currentImage),
              onWishlistTap: () => _toggleWishlist(context, isFavorite),
              onThumbnailTap: (asset) => setState(() => currentImage = asset),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _PriceHeader(
                    discount: widget.discount,
                    price: _formatPrice(widget.price),
                    oldPrice: _formatPrice(widget.oldPrice),
                    isDark: isDark,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    context.tr(widget.title),
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: textColor,
                      fontSize: 23,
                      height: 1.12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _StatusPill(
                        label: stock,
                        color: stockColor,
                        isDark: isDark,
                      ),
                      const SizedBox(width: 10),
                      _BrandPill(brand: widget.brand, isDark: isDark),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _VariationCard(
                    price: _formatSinglePrice(variationPrice),
                    oldPrice: _formatSinglePrice(oldVariationPrice),
                    stock: stock,
                    stockQuantity: variation.stockQuantity,
                    isLowStock: variation.isLowStock,
                    stockColor: stockColor,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 20),
                  _SectionTitle(title: 'Color', isDark: isDark),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _buildColorOption(Colors.green, 'Green'),
                      const SizedBox(width: 12),
                      _buildColorOption(Colors.black, 'Black'),
                      const SizedBox(width: 12),
                      _buildColorOption(Colors.red.shade400, 'Red'),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _SectionTitle(title: 'Size', isDark: isDark),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _buildSizeOption('Small', isAvailable: true),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildSizeOption('Medium', isAvailable: true),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildSizeOption('Large', isAvailable: true),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildSizeOption('X-Large', isAvailable: false),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _InfoCard(
                    isDark: isDark,
                    title: 'Description',
                    child: Text(
                      context.tr(widget.title),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: mutedColor,
                        height: 1.45,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _BottomAddToCartBar(
        isDark: isDark,
        quantity: quantity,
        price: _parsePrice(variationPrice),
        isOutOfStock: isOutOfStock,
        onDecrease: () {
          if (quantity > 0) setState(() => quantity--);
        },
        onIncrease: () {
          if (isOutOfStock) {
            CustomSnackBar.showWarning(
              context: context,
              title: 'Product is out of stock',
            );
            return;
          }

          if (quantity >= variation.stockQuantity) {
            CustomSnackBar.showWarning(
              context: context,
              title: context.isArabicLanguage
                  ? 'متبقي ${variation.stockQuantity} فقط'
                  : 'Only ${variation.stockQuantity} left in stock',
            );
            return;
          }
          setState(() => quantity++);
        },
        onAddToCart: () => _addSelectedProductToCart(
          context: context,
          variation: variation,
          isOutOfStock: isOutOfStock,
        ),
      ),
    );
  }

  Widget _buildColorOption(Color color, String colorName) {
    final isSelected = selectedColor == colorName;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => setState(() => selectedColor = colorName),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        width: 42,
        height: 42,
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : isDark
                ? Colors.white.withValues(alpha: 0.10)
                : Colors.black.withValues(alpha: 0.08),
            width: 2,
          ),
        ),
        child: Container(
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          child: isSelected
              ? const Icon(Icons.check, color: Colors.white, size: 18)
              : null,
        ),
      ),
    );
  }

  Widget _buildSizeOption(String size, {required bool isAvailable}) {
    final isSelected = selectedSize == size;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isAvailable ? () => setState(() => selectedSize = size) : null,
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primary
                : (!isAvailable
                      ? (isDark
                            ? Colors.white.withValues(alpha: 0.05)
                            : Colors.black.withValues(alpha: 0.04))
                      : (isDark ? AppColors.darkCardColor : Colors.white)),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected
                  ? AppColors.primary
                  : isDark
                  ? Colors.white.withValues(alpha: 0.10)
                  : Colors.black.withValues(alpha: 0.08),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            textDirection: TextDirection.ltr,
            children: [
              Flexible(
                child: Text(
                  size,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isSelected
                        ? Colors.white
                        : (!isAvailable
                              ? Colors.grey
                              : (isDark
                                    ? Colors.white
                                    : AppColors.lightTextPrimary)),
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              if (isSelected) ...[
                const SizedBox(width: 4),
                const Icon(Icons.check, color: Colors.white, size: 14),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
