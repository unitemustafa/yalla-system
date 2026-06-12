import 'package:flutter/material.dart';

import '../../../../core/constants/app_assets.dart';
import '../../../../core/constants/app_colors.dart';

class MarketCategoryData {
  const MarketCategoryData({
    required this.name,
    required this.count,
    required this.image,
    required this.galleryImages,
    required this.color,
    this.keywords = const [],
  });

  final String name;
  final String count;
  final String image;
  final List<String> galleryImages;
  final Color color;
  final List<String> keywords;
}

class MarketCategories {
  MarketCategories._();

  static const restaurants = MarketCategoryData(
    name: 'مطاعم',
    count: '42 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner1,
      AppAssets.promoBanner2,
    ],
    color: Color(0xFFEF4444),
    keywords: ['restaurant', 'food', 'اكل'],
  );

  static const vegetables = MarketCategoryData(
    name: 'خضار',
    count: '58 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner2,
      AppAssets.tomiDogFood,
    ],
    color: AppColors.success,
    keywords: ['vegetables', 'fresh'],
  );

  static const fruits = MarketCategoryData(
    name: 'فواكه',
    count: '44 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner3,
      AppAssets.promoBanner1,
    ],
    color: Color(0xFFF59E0B),
    keywords: ['fruits', 'fruit'],
  );

  static const supermarket = MarketCategoryData(
    name: 'سوبر ماركت',
    count: '126 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.tomiDogFood,
      AppAssets.promoBanner2,
    ],
    color: AppColors.primary,
    keywords: ['supermarket', 'grocery'],
  );

  static const poultry = MarketCategoryData(
    name: 'طيور',
    count: '31 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner1,
      AppAssets.promoBanner3,
    ],
    color: Color(0xFFF97316),
    keywords: ['poultry', 'chicken'],
  );

  static const fish = MarketCategoryData(
    name: 'أسماك',
    count: '29 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner2,
      AppAssets.promoBanner1,
    ],
    color: Color(0xFF06B6D4),
    keywords: ['fish', 'seafood'],
  );

  static const pharmacy = MarketCategoryData(
    name: 'صيدلية',
    count: '73 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner3,
      AppAssets.samsungS9Mobile,
    ],
    color: Color(0xFF14B8A6),
    keywords: ['pharmacy', 'medicine'],
  );

  static const freshMeat = MarketCategoryData(
    name: 'لحوم فريش',
    count: '36 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner1,
      AppAssets.promoBanner2,
    ],
    color: Color(0xFFDC2626),
    keywords: ['meat', 'fresh meat'],
  );

  static const dairy = MarketCategoryData(
    name: 'منتجات ألبان',
    count: '52 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner2,
      AppAssets.promoBanner3,
    ],
    color: Color(0xFF3B82F6),
    keywords: ['dairy', 'milk'],
  );

  static const bakeries = MarketCategoryData(
    name: 'مخبوزات',
    count: '47 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner1,
      AppAssets.promoBanner3,
    ],
    color: Color(0xFFD97706),
    keywords: ['bakery', 'bread'],
  );

  static const cafe = MarketCategoryData(
    name: 'كافيه',
    count: '24 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner3,
      AppAssets.promoBanner2,
    ],
    color: Color(0xFF8B5CF6),
    keywords: ['cafe', 'coffee'],
  );

  static const snacks = MarketCategoryData(
    name: 'مسليات',
    count: '65 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.tomiDogFood,
      AppAssets.promoBanner1,
    ],
    color: Color(0xFFF43F5E),
    keywords: ['snacks'],
  );

  static const sweets = MarketCategoryData(
    name: 'حلويات',
    count: '38 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner2,
      AppAssets.promoBanner3,
    ],
    color: Color(0xFFEC4899),
    keywords: ['sweets', 'dessert'],
  );

  static const stationery = MarketCategoryData(
    name: 'أدوات مكتبية',
    count: '33 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.samsungS9Mobile,
      AppAssets.promoBanner1,
    ],
    color: Color(0xFF64748B),
    keywords: ['stationery', 'office'],
  );

  static const decor = MarketCategoryData(
    name: 'الديكورات',
    count: '41 منتج',
    image: AppAssets.diningChairIcon,
    galleryImages: [
      AppAssets.diningChairIcon,
      AppAssets.leatherJacket2,
      AppAssets.temporaryMarketPlaceholder,
    ],
    color: Color(0xFF10B981),
    keywords: ['decor', 'decoration'],
  );

  static const personalCare = MarketCategoryData(
    name: 'النظافة والعناية الشخصية',
    count: '69 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner3,
      AppAssets.promoBanner1,
    ],
    color: Color(0xFF0EA5E9),
    keywords: ['personal care', 'hygiene'],
  );

  static const advertising = MarketCategoryData(
    name: 'دعاية وإعلان',
    count: '18 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.samsungS9MobileWithBack,
      AppAssets.promoBanner2,
    ],
    color: Color(0xFF6366F1),
    keywords: ['advertising', 'printing'],
  );

  static const clothes = MarketCategoryData(
    name: 'ملابس',
    count: '92 منتج',
    image: AppAssets.tailorsDummyIcon,
    galleryImages: [
      AppAssets.tshirtBlueNoCollarFront,
      AppAssets.tshirtGreenCollar,
      AppAssets.leatherJacket1,
    ],
    color: Color(0xFFEC4899),
    keywords: ['clothes', 'fashion'],
  );

  static const sportswear = MarketCategoryData(
    name: 'ملابس رياضية',
    count: '57 منتج',
    image: AppAssets.tshirtBlueCollar,
    galleryImages: [
      AppAssets.tshirtBlueCollar,
      AppAssets.tshirtYellowCollar,
      AppAssets.tshirtRedCollar,
    ],
    color: AppColors.primary,
    keywords: ['sportswear', 'sports clothes'],
  );

  static const shoes = MarketCategoryData(
    name: 'أحذية',
    count: '81 منتج',
    image: AppAssets.shoesIcon,
    galleryImages: [
      AppAssets.nikeShoes,
      AppAssets.nikeAirMax,
      AppAssets.nikeWildhorse,
    ],
    color: Color(0xFF111827),
    keywords: ['shoes', 'sneakers'],
  );

  static const electricalTools = MarketCategoryData(
    name: 'أدوات كهربائية',
    count: '34 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.samsungS9MobileBack,
      AppAssets.promoBanner1,
    ],
    color: Color(0xFFF59E0B),
    keywords: ['electrical tools'],
  );

  static const homeAppliances = MarketCategoryData(
    name: 'أجهزة كهربائية',
    count: '46 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.samsungS9MobileWithBack,
      AppAssets.promoBanner2,
    ],
    color: Color(0xFF22C55E),
    keywords: ['appliances'],
  );

  static const furnishings = MarketCategoryData(
    name: 'مفروشات',
    count: '39 منتج',
    image: AppAssets.diningChairIcon,
    galleryImages: [
      AppAssets.diningChairIcon,
      AppAssets.leatherJacket3,
      AppAssets.temporaryMarketPlaceholder,
    ],
    color: Color(0xFF8B5CF6),
    keywords: ['furnishings', 'home'],
  );

  static const electronics = MarketCategoryData(
    name: 'أجهزة إلكترونية',
    count: '88 منتج',
    image: AppAssets.smartphoneIcon,
    galleryImages: [
      AppAssets.samsungS9Mobile,
      AppAssets.samsungS9MobileBack,
      AppAssets.samsungS9MobileWithBack,
    ],
    color: AppColors.success,
    keywords: ['electronics', 'devices'],
  );

  static const perfumes = MarketCategoryData(
    name: 'عطور',
    count: '27 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.promoBanner3,
      AppAssets.promoBanner1,
    ],
    color: Color(0xFFA855F7),
    keywords: ['perfumes', 'fragrance'],
  );

  static const services = MarketCategoryData(
    name: 'خدمات',
    count: '22 منتج',
    image: AppAssets.temporaryMarketPlaceholder,
    galleryImages: [
      AppAssets.temporaryMarketPlaceholder,
      AppAssets.samsungS9Mobile,
      AppAssets.promoBanner2,
    ],
    color: Color(0xFF475569),
    keywords: ['services'],
  );

  static const all = [
    restaurants,
    vegetables,
    fruits,
    supermarket,
    poultry,
    fish,
    pharmacy,
    freshMeat,
    dairy,
    bakeries,
    cafe,
    snacks,
    sweets,
    stationery,
    decor,
    personalCare,
    advertising,
    clothes,
    sportswear,
    shoes,
    electricalTools,
    homeAppliances,
    furnishings,
    electronics,
    perfumes,
    services,
  ];

  static const featured = [
    restaurants,
    vegetables,
    supermarket,
    pharmacy,
    clothes,
    electronics,
  ];

  static const food = [
    restaurants,
    vegetables,
    fruits,
    supermarket,
    dairy,
    bakeries,
    cafe,
    snacks,
    sweets,
  ];

  static const fresh = [poultry, fish, freshMeat, vegetables, fruits, dairy];

  static const shopping = [pharmacy, stationery, personalCare, perfumes];

  static const home = [
    decor,
    electricalTools,
    homeAppliances,
    furnishings,
    electronics,
  ];

  static const fashion = [clothes, sportswear, shoes];

  static const business = [advertising, services, stationery];

  static const localShopCategories = [restaurants, supermarket, pharmacy];

  static bool hasLocalShops(String categoryName) {
    final normalized = categoryName.trim().toLowerCase();
    return localShopCategories.any(
      (category) => category.name.trim().toLowerCase() == normalized,
    );
  }
}
