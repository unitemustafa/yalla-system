import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../domain/home_data.dart';

class HomeCategories extends StatelessWidget {
  const HomeCategories({super.key, required this.classifications});

  final List<HomeClassificationData> classifications;

  @override
  Widget build(BuildContext context) {
    if (classifications.isEmpty) {
      return const Text('No market classifications are available.');
    }
    return SizedBox(
      height: 82,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: classifications.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final item = classifications[index];
          return Container(
            width: 132,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.12),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  item.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 5),
                Text('${item.marketCount} markets'),
              ],
            ),
          );
        },
      ),
    );
  }
}
