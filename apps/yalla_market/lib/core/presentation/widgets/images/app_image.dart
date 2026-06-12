import 'dart:typed_data';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../icons/app_icons.dart';

class AppImage extends StatelessWidget {
  const AppImage({
    super.key,
    this.source,
    this.bytes,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.alignment = Alignment.center,
    this.borderRadius,
    this.cacheWidth,
    this.cacheHeight,
    this.placeholder,
    this.fallback,
    this.backgroundColor,
    this.semanticLabel,
    this.filterQuality = FilterQuality.medium,
  });

  final String? source;
  final Uint8List? bytes;
  final double? width;
  final double? height;
  final BoxFit fit;
  final AlignmentGeometry alignment;
  final BorderRadius? borderRadius;
  final int? cacheWidth;
  final int? cacheHeight;
  final Widget? placeholder;
  final Widget? fallback;
  final Color? backgroundColor;
  final String? semanticLabel;
  final FilterQuality filterQuality;

  @override
  Widget build(BuildContext context) {
    final image = _buildImage(context);
    final clipped = borderRadius == null
        ? image
        : ClipRRect(
            borderRadius: borderRadius!,
            clipBehavior: Clip.hardEdge,
            child: image,
          );

    if (backgroundColor == null) return clipped;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: borderRadius,
      ),
      child: clipped,
    );
  }

  Widget _buildImage(BuildContext context) {
    final pickedBytes = bytes;
    final effectiveCacheWidth = _effectiveCacheWidth(context);
    final effectiveCacheHeight = _effectiveCacheHeight(context);

    if (pickedBytes != null && pickedBytes.isNotEmpty) {
      return Image.memory(
        pickedBytes,
        width: width,
        height: height,
        fit: fit,
        alignment: alignment,
        cacheWidth: effectiveCacheWidth,
        cacheHeight: effectiveCacheHeight,
        semanticLabel: semanticLabel,
        filterQuality: filterQuality,
        gaplessPlayback: true,
        errorBuilder: (_, _, _) => _buildFallback(context),
      );
    }

    final value = source?.trim() ?? '';
    if (value.isEmpty) return _buildFallback(context);

    if (_isNetworkSource(value)) {
      return CachedNetworkImage(
        imageUrl: value,
        memCacheWidth: effectiveCacheWidth,
        memCacheHeight: effectiveCacheHeight,
        filterQuality: filterQuality,
        useOldImageOnUrlChange: true,
        imageBuilder: (context, imageProvider) {
          return Image(
            image: imageProvider,
            width: width,
            height: height,
            fit: fit,
            alignment: alignment,
            semanticLabel: semanticLabel,
            filterQuality: filterQuality,
            gaplessPlayback: true,
          );
        },
        placeholder: (context, _) => placeholder ?? _buildPlaceholder(context),
        errorWidget: (context, _, _) => _buildFallback(context),
      );
    }

    return Image.asset(
      value,
      width: width,
      height: height,
      fit: fit,
      alignment: alignment,
      cacheWidth: effectiveCacheWidth,
      cacheHeight: effectiveCacheHeight,
      semanticLabel: semanticLabel,
      filterQuality: filterQuality,
      gaplessPlayback: true,
      errorBuilder: (_, _, _) => _buildFallback(context),
    );
  }

  Widget _buildPlaceholder(BuildContext context) {
    final indicator = const SizedBox.square(
      dimension: 18,
      child: CircularProgressIndicator(strokeWidth: 2),
    );

    if (width == null && height == null) {
      return Center(child: indicator);
    }

    return SizedBox(
      width: width,
      height: height,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Theme.of(
            context,
          ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.35),
        ),
        child: Center(child: indicator),
      ),
    );
  }

  Widget _buildFallback(BuildContext context) {
    final effectiveFallback = fallback ?? _DefaultImageFallback(size: height);
    if (width == null && height == null) return effectiveFallback;

    return SizedBox(width: width, height: height, child: effectiveFallback);
  }

  bool _isNetworkSource(String value) {
    final uri = Uri.tryParse(value);
    if (uri == null) return false;
    return uri.scheme == 'http' || uri.scheme == 'https';
  }

  int? _effectiveCacheWidth(BuildContext context) {
    if (cacheWidth != null) return cacheWidth;
    final imageWidth = width;
    if (imageWidth == null || imageWidth <= 0) return null;
    return (imageWidth * MediaQuery.devicePixelRatioOf(context)).round();
  }

  int? _effectiveCacheHeight(BuildContext context) {
    if (cacheHeight != null) return cacheHeight;
    final imageHeight = height;
    if (imageHeight == null || imageHeight <= 0) return null;
    return (imageHeight * MediaQuery.devicePixelRatioOf(context)).round();
  }
}

class _DefaultImageFallback extends StatelessWidget {
  const _DefaultImageFallback({this.size});

  final double? size;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
      ),
      child: Center(
        child: Icon(
          AppIcons.image,
          size: (size == null ? 24 : (size! * 0.32).clamp(18.0, 34.0)),
          color: isDark ? Colors.white38 : Colors.black38,
        ),
      ),
    );
  }
}
