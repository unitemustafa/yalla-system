import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/presentation/widgets/images/app_image.dart';
import '../../domain/home_data.dart';

class PromoSlider extends StatelessWidget {
  const PromoSlider({super.key, required this.offers});

  final List<HomeOfferData> offers;

  @override
  Widget build(BuildContext context) {
    if (offers.isEmpty) {
      return const SizedBox.shrink();
    }
    return SizedBox(
      height: 174,
      child: PageView.builder(
        itemCount: offers.length,
        controller: PageController(viewportFraction: 0.94),
        itemBuilder: (context, index) {
          final offer = offers[index];
          return Container(
            margin: const EdgeInsetsDirectional.only(end: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        offer.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        offer.description,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white70),
                      ),
                      if (offer.discount.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          '${offer.discount}% off',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 92,
                  height: 112,
                  child: AppImage(
                    source: offer.image ?? '',
                    fit: BoxFit.cover,
                    fallback: const Icon(
                      Icons.local_offer_outlined,
                      color: Colors.white,
                      size: 50,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
