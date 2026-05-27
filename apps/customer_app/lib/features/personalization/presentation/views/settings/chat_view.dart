import 'package:flutter/material.dart';
import 'package:yallamarket/core/icons/app_icons.dart';

import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/presentation/widgets/appbar/app_navigation_icon_button.dart';
import '../../../../../core/presentation/widgets/states/app_state_view.dart';

class ChatView extends StatelessWidget {
  const ChatView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark
        ? AppColors.darkBackground
        : const Color(0xFFF7F8FB);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  AppNavigationIconButton.back(
                    onPressed: () => Navigator.pop(context),
                    color: isDark ? Colors.white : Colors.black,
                  ),
                ],
              ),
            ),
            const Expanded(
              child: AppEmptyState(
                title: 'Coming soon',
                message:
                    'Support chat is closed for now. It will be available soon.',
                icon: AppIcons.messages,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
