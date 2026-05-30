import 'package:flutter/material.dart';

import 'app_navigation_icon_button.dart';
import '../images/app_image.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CustomAppBar({
    super.key,
    this.title,
    this.actions,
    this.leadingIcon,
    this.leadingOnPressed,
    this.showBackArrow = false,
    this.profileImageUrl,
  });

  final Widget? title;
  final bool showBackArrow;
  final IconData? leadingIcon;
  final List<Widget>? actions;
  final VoidCallback? leadingOnPressed;

  /// Optional profile image URL or asset path to show a circular avatar on the leading side.
  final String? profileImageUrl;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: AppBar(
        automaticallyImplyLeading: false,
        titleSpacing: 0,
        leading: showBackArrow
            ? AppNavigationIconButton.back(
                onPressed: leadingOnPressed ?? () => Navigator.pop(context),
              )
            : profileImageUrl != null
            ? GestureDetector(
                onTap: leadingOnPressed,
                child: Padding(
                  padding: const EdgeInsets.only(
                    left: 0,
                    top: 8,
                    bottom: 8,
                    right: 8,
                  ),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      shape: BoxShape.circle,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: AppImage(
                      source: profileImageUrl,
                      fit: BoxFit.cover,
                      cacheWidth: 72,
                      cacheHeight: 72,
                      fallback: Icon(
                        Icons.person,
                        size: 20,
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                ),
              )
            : leadingIcon != null
            ? IconButton(onPressed: leadingOnPressed, icon: Icon(leadingIcon))
            : null,
        title: title,
        actions: actions,
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
