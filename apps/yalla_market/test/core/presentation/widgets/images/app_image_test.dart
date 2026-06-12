import 'dart:typed_data';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/constants/app_assets.dart';
import 'package:yalla_market/core/presentation/widgets/images/app_avatar.dart';
import 'package:yalla_market/core/presentation/widgets/images/app_image.dart';
import 'package:yalla_market/core/preferences/app_preferences_controller.dart';

void main() {
  setUp(() {
    AppPreferencesController.instance.value = const AppPreferences();
  });

  tearDown(() {
    AppPreferencesController.instance.value = const AppPreferences();
  });

  group('AppImage', () {
    testWidgets('uses AssetImage for local asset paths', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const AppImage(
            source: AppAssets.temporaryMarketPlaceholder,
            width: 40,
            height: 40,
          ),
        ),
      );

      final image = tester.widget<Image>(find.byType(Image));
      final resizeImage = image.image as ResizeImage;

      expect(resizeImage.imageProvider, isA<AssetImage>());
      expect(
        (resizeImage.imageProvider as AssetImage).assetName,
        AppAssets.temporaryMarketPlaceholder,
      );
    });

    testWidgets('uses CachedNetworkImage for http URLs', (tester) async {
      const imageUrl = 'https://cdn.example.com/products/shoe.png';

      await tester.pumpWidget(
        _wrap(const AppImage(source: imageUrl, width: 40, height: 40)),
      );

      final image = tester.widget<CachedNetworkImage>(
        find.byType(CachedNetworkImage),
      );

      expect(image.imageUrl, imageUrl);
      expect(image.placeholder, isNotNull);
      expect(image.errorWidget, isNotNull);
    });

    testWidgets('prioritizes in-memory bytes over source', (tester) async {
      final bytes = Uint8List.fromList(_transparentPngBytes);

      await tester.pumpWidget(
        _wrap(
          AppImage(
            source: AppAssets.temporaryMarketPlaceholder,
            bytes: bytes,
            width: 40,
            height: 40,
          ),
        ),
      );

      final image = tester.widget<Image>(find.byType(Image));
      final resizeImage = image.image as ResizeImage;

      expect(resizeImage.imageProvider, isA<MemoryImage>());
    });

    testWidgets('keeps explicit cache size for network images', (tester) async {
      const imageUrl = 'https://cdn.example.com/products/thumb.png';

      await tester.pumpWidget(
        _wrap(
          const AppImage(source: imageUrl, cacheWidth: 80, cacheHeight: 60),
        ),
      );

      final image = tester.widget<CachedNetworkImage>(
        find.byType(CachedNetworkImage),
      );

      expect(image.memCacheWidth, 80);
      expect(image.memCacheHeight, 60);
    });

    testWidgets('shows fallback when source is empty', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const AppImage(
            source: '',
            width: 40,
            height: 40,
            fallback: Text('missing image'),
          ),
        ),
      );

      expect(find.text('missing image'), findsOneWidget);
      expect(find.byType(Image), findsNothing);
    });
  });

  group('AppAvatar', () {
    testWidgets('prioritizes bytes over URL', (tester) async {
      final bytes = Uint8List.fromList(_transparentPngBytes);

      await tester.pumpWidget(
        _wrap(
          AppAvatar(
            initials: 'MA',
            imageBytes: bytes,
            imageUrl: 'https://cdn.example.com/avatar.png',
          ),
        ),
      );

      final image = tester.widget<Image>(find.byType(Image));

      expect(image.image, isA<ResizeImage>());
      expect((image.image as ResizeImage).imageProvider, isA<MemoryImage>());
      expect(find.text('MA'), findsNothing);
    });

    testWidgets('shows initials when no image is available', (tester) async {
      await tester.pumpWidget(_wrap(const AppAvatar(initials: 'MA')));

      expect(find.text('MA'), findsOneWidget);
      expect(find.byType(Image), findsNothing);
    });
  });
}

Widget _wrap(Widget child) {
  return MaterialApp(
    home: Scaffold(body: Center(child: child)),
  );
}

const _transparentPngBytes = <int>[
  0x89,
  0x50,
  0x4E,
  0x47,
  0x0D,
  0x0A,
  0x1A,
  0x0A,
  0x00,
  0x00,
  0x00,
  0x0D,
  0x49,
  0x48,
  0x44,
  0x52,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x08,
  0x06,
  0x00,
  0x00,
  0x00,
  0x1F,
  0x15,
  0xC4,
  0x89,
  0x00,
  0x00,
  0x00,
  0x0A,
  0x49,
  0x44,
  0x41,
  0x54,
  0x78,
  0x9C,
  0x63,
  0x00,
  0x01,
  0x00,
  0x00,
  0x05,
  0x00,
  0x01,
  0x0D,
  0x0A,
  0x2D,
  0xB4,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4E,
  0x44,
  0xAE,
  0x42,
  0x60,
  0x82,
];
