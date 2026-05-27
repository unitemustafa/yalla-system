// ignore_for_file: deprecated_member_use

// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

import 'package:flutter/services.dart';

Future<bool> downloadAssetImage(String imageSource, String fileName) async {
  final source = imageSource.trim();
  if (source.isEmpty) return false;

  if (_isNetworkSource(source)) {
    html.AnchorElement(href: source)
      ..download = _safeFileName(source, fileName)
      ..target = '_blank'
      ..click();
    return true;
  }

  try {
    final bytes = await rootBundle.load(source);
    final blob = html.Blob([bytes.buffer.asUint8List()]);
    final url = html.Url.createObjectUrlFromBlob(blob);

    html.AnchorElement(href: url)
      ..download = _safeFileName(source, fileName)
      ..click();

    html.Url.revokeObjectUrl(url);
    return true;
  } catch (_) {
    return false;
  }
}

bool _isNetworkSource(String value) {
  final uri = Uri.tryParse(value);
  if (uri == null) return false;
  return uri.scheme == 'http' || uri.scheme == 'https';
}

String _safeFileName(String source, String fileName) {
  final trimmed = fileName.trim();
  if (trimmed.isNotEmpty) return trimmed.split('?').first;

  final path = Uri.tryParse(source)?.path ?? source;
  final name = path.split('/').where((part) => part.isNotEmpty).lastOrNull;
  return name == null || name.isEmpty ? 'image' : name;
}
