import '../../domain/entities/product_data.dart';
import 'demo_categories.dart';

class MarketShopData {
  const MarketShopData({
    required this.id,
    required this.name,
    required this.categoryName,
    required this.citySlug,
    required this.cityName,
    required this.logo,
    required this.galleryImages,
    required this.accentColorValue,
    required this.rating,
    required this.deliveryEstimate,
    required this.products,
  });

  final String id;
  final String name;
  final String categoryName;
  final String citySlug;
  final String cityName;
  final String logo;
  final List<String> galleryImages;
  final int accentColorValue;
  final double rating;
  final String deliveryEstimate;
  final List<ProductData> products;

  int get productCount => products.length;

  String get productCountLabel => '$productCount منتج';
}

class MarketShops {
  MarketShops._();

  static final List<MarketShopData> all = [
    for (final city in _cities) ..._shopsForCity(city),
  ];

  static List<MarketShopData> byCategoryAndCity(
    String categoryName,
    String citySlug,
  ) {
    final category = categoryName.trim().toLowerCase();
    final city = citySlug.trim().toLowerCase();
    return all
        .where(
          (shop) =>
              shop.categoryName.trim().toLowerCase() == category &&
              shop.citySlug == city,
        )
        .toList(growable: false);
  }

  static MarketShopData? byId(String id) {
    final normalized = id.trim().toLowerCase();
    for (final shop in all) {
      if (shop.id == normalized) return shop;
    }
    return null;
  }

  static List<MarketShopData> _shopsForCity(_MarketCity city) {
    return [
      _shop(
        city: city,
        category: MarketCategories.restaurants,
        name: 'مطعم البلد ${city.shortName}',
        rating: 4.8,
        deliveryEstimate: '25-35 دقيقة',
        products: const [
          _ShopProduct('وجبة فراخ مشوية', 'EGP 145.00', '12%'),
          _ShopProduct('ساندوتش شاورما', 'EGP 78.00', ''),
          _ShopProduct('وجبة عائلية', 'EGP 260.00', '18%'),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.restaurants,
        name: 'بيتزا الحارة ${city.shortName}',
        rating: 4.6,
        deliveryEstimate: '30-40 دقيقة',
        products: const [
          _ShopProduct('بيتزا ميكس جبن', 'EGP 190.00', ''),
          _ShopProduct('بيتزا فراخ باربكيو', 'EGP 210.00', '10%'),
          _ShopProduct('باستا وايت صوص', 'EGP 125.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.supermarket,
        name: 'سوبر ماركت المدينة ${city.shortName}',
        rating: 4.7,
        deliveryEstimate: '20-30 دقيقة',
        products: const [
          _ShopProduct('باقة احتياجات يومية', 'EGP 185.00', '9%'),
          _ShopProduct('أرز وسكر وزيت', 'EGP 240.00', ''),
          _ShopProduct('منظفات منزلية', 'EGP 135.00', '15%'),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.pharmacy,
        name: 'صيدلية الشفاء ${city.shortName}',
        rating: 4.9,
        deliveryEstimate: '15-25 دقيقة',
        products: const [
          _ShopProduct('باقة عناية يومية', 'EGP 95.00', ''),
          _ShopProduct('فيتامينات ومكملات', 'EGP 180.00', '8%'),
          _ShopProduct('طلب روشتة سريع', 'EGP 50.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.bakeries,
        name: 'مخبز الصباح ${city.shortName}',
        rating: 4.5,
        deliveryEstimate: '20-30 دقيقة',
        products: const [
          _ShopProduct('عيش بلدي طازج', 'EGP 20.00', ''),
          _ShopProduct('كرواسون وجبات', 'EGP 85.00', '10%'),
          _ShopProduct('مخبوزات مشكلة', 'EGP 120.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.cafe,
        name: 'قهوة الركن ${city.shortName}',
        rating: 4.4,
        deliveryEstimate: '20-35 دقيقة',
        products: const [
          _ShopProduct('لاتيه مثلج', 'EGP 65.00', ''),
          _ShopProduct('قهوة تركي', 'EGP 35.00', ''),
          _ShopProduct('كيك شوكولاتة', 'EGP 72.00', '11%'),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.vegetables,
        name: 'خضار اليوم ${city.shortName}',
        rating: 4.7,
        deliveryEstimate: '25-35 دقيقة',
        products: const [
          _ShopProduct('سلة خضار طازجة', 'EGP 120.00', '14%'),
          _ShopProduct('طماطم وخيار وفلفل', 'EGP 75.00', ''),
          _ShopProduct('ورقيات مشكلة', 'EGP 45.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.fruits,
        name: 'فاكهة الموسم ${city.shortName}',
        rating: 4.6,
        deliveryEstimate: '25-35 دقيقة',
        products: const [
          _ShopProduct('سلة فواكه مشكلة', 'EGP 155.00', '12%'),
          _ShopProduct('موز وتفاح وبرتقال', 'EGP 110.00', ''),
          _ShopProduct('عصير فريش باك', 'EGP 88.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.poultry,
        name: 'طيور بلدنا ${city.shortName}',
        rating: 4.5,
        deliveryEstimate: '30-45 دقيقة',
        products: const [
          _ShopProduct('دجاج بلدي طازج', 'EGP 150.00', ''),
          _ShopProduct('صدور دجاج', 'EGP 175.00', '7%'),
          _ShopProduct('أوراك دجاج', 'EGP 120.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.fish,
        name: 'سمك البحر ${city.shortName}',
        rating: 4.4,
        deliveryEstimate: '35-50 دقيقة',
        products: const [
          _ShopProduct('سمك بلطي طازج', 'EGP 130.00', ''),
          _ShopProduct('جمبري وسط', 'EGP 260.00', '9%'),
          _ShopProduct('فيليه سمك', 'EGP 180.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.freshMeat,
        name: 'جزارة الأمانة ${city.shortName}',
        rating: 4.8,
        deliveryEstimate: '35-45 دقيقة',
        products: const [
          _ShopProduct('لحمة مكعبات', 'EGP 310.00', ''),
          _ShopProduct('كفتة جاهزة', 'EGP 220.00', '10%'),
          _ShopProduct('برجر بلدي', 'EGP 180.00', ''),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.dairy,
        name: 'ألبان الريف ${city.shortName}',
        rating: 4.5,
        deliveryEstimate: '25-35 دقيقة',
        products: const [
          _ShopProduct('لبن وزبادي', 'EGP 90.00', ''),
          _ShopProduct('جبنة قريش', 'EGP 70.00', ''),
          _ShopProduct('باقة ألبان أسبوعية', 'EGP 210.00', '13%'),
        ],
      ),
      _shop(
        city: city,
        category: MarketCategories.sweets,
        name: 'حلويات الفرحة ${city.shortName}',
        rating: 4.6,
        deliveryEstimate: '30-45 دقيقة',
        products: const [
          _ShopProduct('تورتة صغيرة', 'EGP 220.00', ''),
          _ShopProduct('شرقي مشكل', 'EGP 160.00', '10%'),
          _ShopProduct('دوناتس بوكس', 'EGP 135.00', ''),
        ],
      ),
    ];
  }

  static MarketShopData _shop({
    required _MarketCity city,
    required MarketCategoryData category,
    required String name,
    required double rating,
    required String deliveryEstimate,
    required List<_ShopProduct> products,
  }) {
    final id =
        '${_slugFrom(city.slug)}-${_slugFrom(category.name)}-${_slugFrom(name)}';
    final menu = products
        .map(
          (product) => ProductData(
            id: '$id-${_slugFrom(product.title)}',
            slug: '$id-${_slugFrom(product.title)}',
            image: category.galleryImages.first,
            title: product.title,
            brand: name,
            price: product.price,
            oldPrice: null,
            discount: product.discount,
            tags: [name, category.name, ...category.keywords, 'menu'],
            citySlug: city.slug,
            cityName: city.name,
          ),
        )
        .toList(growable: false);

    return MarketShopData(
      id: id,
      name: name,
      categoryName: category.name,
      citySlug: city.slug,
      cityName: city.name,
      logo: category.image,
      galleryImages: category.galleryImages,
      accentColorValue: category.color.toARGB32(),
      rating: rating,
      deliveryEstimate: deliveryEstimate,
      products: menu,
    );
  }

  static String _slugFrom(String value) {
    final slug = value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\u0600-\u06ff]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    if (slug.isNotEmpty) return slug;

    final stableCode = value.codeUnits.fold<int>(
      0,
      (sum, codeUnit) => (sum + codeUnit) & 0xFFFF,
    );
    return 'item-$stableCode';
  }

  static const _cities = [
    _MarketCity(name: 'Cairo', slug: 'cairo', shortName: 'القاهرة'),
    _MarketCity(
      name: 'Alexandria',
      slug: 'alexandria',
      shortName: 'الإسكندرية',
    ),
    _MarketCity(
      name: 'Sharm El Sheikh',
      slug: 'sharm-el-sheikh',
      shortName: 'شرم',
    ),
    _MarketCity(name: 'Hurghada', slug: 'hurghada', shortName: 'الغردقة'),
    _MarketCity(name: 'Mansoura', slug: 'mansoura', shortName: 'المنصورة'),
    _MarketCity(name: 'Tanta', slug: 'tanta', shortName: 'طنطا'),
  ];
}

class _MarketCity {
  const _MarketCity({
    required this.name,
    required this.slug,
    required this.shortName,
  });

  final String name;
  final String slug;
  final String shortName;
}

class _ShopProduct {
  const _ShopProduct(this.title, this.price, this.discount);

  final String title;
  final String price;
  final String discount;
}
