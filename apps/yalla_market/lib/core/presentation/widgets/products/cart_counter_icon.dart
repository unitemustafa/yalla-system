import 'package:flutter/material.dart';
import 'package:yalla_market/core/icons/app_icons.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../features/cart/domain/entities/cart_item.dart';
import '../../../../features/cart/presentation/cubit/cart_cubit.dart';
import '../../../routing/app_routes.dart';
import '../../../constants/app_colors.dart';

class CartCounterIcon extends StatelessWidget {
  const CartCounterIcon({super.key, this.onPressed, required this.iconColor});

  final VoidCallback? onPressed;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        IconButton(
          onPressed:
              onPressed ?? () => Navigator.pushNamed(context, AppRoutes.cart),
          icon: Icon(AppIcons.shopping_bag, color: iconColor),
        ),
        Positioned(
          right: 0,
          top: 0,
          child: Container(
            width: 18,
            height: 18,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(100),
            ),
            child: Center(
              child: BlocBuilder<CartCubit, List<CartItemData>>(
                builder: (context, cartItems) {
                  int count = cartItems.fold(
                    0,
                    (sum, item) => sum + item.quantity,
                  );
                  return Text(
                    count.toString(),
                    style: Theme.of(context).textTheme.labelLarge!.apply(
                      color: Colors.white,
                      fontSizeFactor: 0.8,
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ],
    );
  }
}
