class WishlistItem {
  const WishlistItem({
    required this.image,
    required this.title,
    required this.brand,
    required this.price,
    this.oldPrice,
    this.discount,
  });

  final String image;
  final String title;
  final String brand;
  final String price;
  final String? oldPrice;
  final String? discount;

  factory WishlistItem.fromJson(Map<String, dynamic> json) {
    return WishlistItem(
      image: json['image']?.toString() ?? json['imageUrl']?.toString() ?? '',
      title: json['title']?.toString() ?? json['name']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      price: json['price']?.toString() ?? '',
      oldPrice: json['oldPrice']?.toString() ?? json['old_price']?.toString(),
      discount: json['discount']?.toString(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'image': image,
      'title': title,
      'brand': brand,
      'price': price,
      'oldPrice': oldPrice,
      'discount': discount,
    };
  }
}
