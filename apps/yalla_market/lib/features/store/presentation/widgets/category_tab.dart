import 'package:flutter/material.dart';
import '../../../../core/presentation/widgets/brands/brand_showcase.dart';
import '../../../../core/routing/app_route_arguments.dart';
import '../../../../core/routing/app_routes.dart';
import '../../domain/entities/category_data.dart';

class CategoryTab extends StatelessWidget {
  const CategoryTab({super.key, required this.showcases});

  final List<CategoryData> showcases;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      itemCount: showcases.length,
      itemBuilder: (_, index) {
        final showcase = showcases[index];
        return BrandShowcase(
          brand: showcase.name,
          productCount: showcase.productCountLabel,
          logo: showcase.image,
          accentColor: Color(showcase.accentColorValue),
          images: showcase.galleryImages,
          onTap: () {
            Navigator.pushNamed(
              context,
              AppRoutes.brandProducts,
              arguments: BrandProductsRouteArgs(
                brand: showcase.name,
                logo: showcase.image,
                productCount: showcase.productCountLabel,
              ),
            );
          },
        );
      },
    );
  }
}
