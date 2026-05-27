import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../constants/app_colors.dart';
import 'app_image.dart';

class AppAvatar extends StatelessWidget {
  const AppAvatar({
    super.key,
    required this.initials,
    this.imageBytes,
    this.imageUrl,
    this.size = 48,
    this.borderRadius = 8,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1,
    this.textColor,
    this.textScale = 0.34,
  });

  final String initials;
  final Uint8List? imageBytes;
  final String? imageUrl;
  final double size;
  final double borderRadius;
  final Color? backgroundColor;
  final Color? borderColor;
  final double borderWidth;
  final Color? textColor;
  final double textScale;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(borderRadius);
    final effectiveBackground =
        backgroundColor ?? AppColors.primary.withValues(alpha: 0.10);
    final effectiveBorder =
        borderColor ?? AppColors.primary.withValues(alpha: 0.20);
    final fallback = _AvatarInitials(
      initials: initials,
      size: size,
      color: textColor ?? AppColors.primary,
      textScale: textScale,
    );
    final cacheSize = (size * MediaQuery.devicePixelRatioOf(context)).round();

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: effectiveBackground,
        borderRadius: radius,
        border: Border.all(color: effectiveBorder, width: borderWidth),
      ),
      child: AppImage(
        source: imageUrl,
        bytes: imageBytes,
        width: size,
        height: size,
        fit: BoxFit.cover,
        borderRadius: BorderRadius.circular(
          (borderRadius - borderWidth).clamp(0.0, borderRadius),
        ),
        cacheWidth: cacheSize,
        cacheHeight: cacheSize,
        fallback: fallback,
        placeholder: fallback,
      ),
    );
  }
}

class _AvatarInitials extends StatelessWidget {
  const _AvatarInitials({
    required this.initials,
    required this.size,
    required this.color,
    required this.textScale,
  });

  final String initials;
  final double size;
  final Color color;
  final double textScale;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        initials,
        style: TextStyle(
          color: color,
          fontSize: size * textScale,
          fontWeight: FontWeight.w900,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }
}
