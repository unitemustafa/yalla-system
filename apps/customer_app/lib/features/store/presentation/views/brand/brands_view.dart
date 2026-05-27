import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/presentation/widgets/appbar/page_top_bar.dart';
import '../../../../../core/presentation/widgets/brands/brand_card.dart';
import '../../../../../core/presentation/widgets/layouts/grid_layout.dart';
import '../../../../../core/presentation/widgets/texts/section_heading.dart';
import '../../../../../core/routing/app_route_arguments.dart';
import '../../../../../core/routing/app_routes.dart';
import '../../cubit/product_discovery_cubit.dart';
import '../../cubit/product_discovery_state.dart';

class BrandsView extends StatelessWidget {
  const BrandsView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
          child: Column(
            children: [
              const PageTopBar(
                title: 'Categories',
                subtitle: 'Explore market categories',
              ),
              const SizedBox(height: 18),
              const SectionHeading(
                title: 'All Categories',
                showActionButton: false,
              ),
              const SizedBox(height: 16),
              BlocBuilder<ProductDiscoveryCubit, ProductDiscoveryState>(
                builder: (context, state) {
                  if (state is ProductDiscoveryLoading &&
                      state.categories.isEmpty) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  return GridLayout(
                    itemCount: state.categories.length,
                    mainAxisExtent: 78,
                    itemBuilder: (context, index) {
                      final category = state.categories[index];
                      return BrandCard(
                        showBorder: true,
                        brand: category.name,
                        productCount: category.productCountLabel,
                        logo: category.image,
                        accentColor: Color(category.accentColorValue),
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            AppRoutes.brandProducts,
                            arguments: BrandProductsRouteArgs(
                              brand: category.name,
                              productCount: category.productCountLabel,
                              logo: category.image,
                            ),
                          );
                        },
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
