import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/services.dart';

const MethodChannel _downloadsChannel = MethodChannel('yallamarket/downloads');

Future<bool> downloadAssetImage(String imageSource, String fileName) async {
  final source = imageSource.trim();
  if (source.isEmpty) return false;

  try {
    final bytes = await _bytesFromSource(source);
    final safeName = _safeFileName(source, fileName);

    if (Platform.isAndroid) {
      return await _downloadsChannel.invokeMethod<bool>(
            'saveImageToDownloads',
            {'fileName': safeName, 'bytes': bytes},
          ) ??
          false;
    }

    final downloadsDirectory = _downloadsDirectory();
    if (downloadsDirectory == null) return false;

    await downloadsDirectory.create(recursive: true);
    final file = File(_uniquePath(downloadsDirectory, safeName));
    await file.writeAsBytes(bytes, flush: true);
    return true;
  } catch (_) {
    return false;
  }
}

Future<Uint8List> _bytesFromSource(String source) async {
  if (_isNetworkSource(source)) return _networkBytes(source);

  final bytes = await rootBundle.load(source);
  return bytes.buffer.asUint8List();
}

Future<Uint8List> _networkBytes(String source) async {
  final client = HttpClient();
  try {
    final request = await client.getUrl(Uri.parse(source));
    request.followRedirects = true;
    final response = await request.close();
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw const HttpException('Image download failed.');
    }

    final builder = BytesBuilder(copy: false);
    await for (final chunk in response) {
      builder.add(chunk);
    }
    return builder.takeBytes();
  } finally {
    client.close(force: true);
  }
}

Directory? _downloadsDirectory() {
  final home =
      Platform.environment['USERPROFILE'] ?? Platform.environment['HOME'];
  if (home == null || home.trim().isEmpty) return null;

  return Directory(_joinPath(home, 'Downloads', 'YallaMarket'));
}

String _joinPath(String first, String second, String third) {
  final separator = Platform.pathSeparator;
  return [first, second, third].join(separator);
}

bool _isNetworkSource(String value) {
  final uri = Uri.tryParse(value);
  if (uri == null) return false;
  return uri.scheme == 'http' || uri.scheme == 'https';
}

String _safeFileName(String source, String fileName) {
  final preferred = fileName.trim().isNotEmpty
      ? fileName.trim()
      : _nameFromSource(source);
  final withoutQuery = preferred.split('?').first;
  final sanitized = withoutQuery
      .replaceAll(RegExp(r'[<>:"/\\|?*\x00-\x1F]'), '_')
      .replaceAll(RegExp(r'\s+'), '_')
      .trim();
  final name = sanitized.isEmpty ? 'image' : sanitized;
  return name.contains('.') ? name : '$name.png';
}

String _nameFromSource(String source) {
  final path = Uri.tryParse(source)?.path ?? source;
  final name = path.split('/').where((part) => part.isNotEmpty).lastOrNull;
  return name == null || name.isEmpty ? 'image.png' : name;
}

String _uniquePath(Directory directory, String fileName) {
  final separator = Platform.pathSeparator;
  final originalPath = '${directory.path}$separator$fileName';
  if (!File(originalPath).existsSync()) return originalPath;

  final dotIndex = fileName.lastIndexOf('.');
  final stem = dotIndex <= 0 ? fileName : fileName.substring(0, dotIndex);
  final extension = dotIndex <= 0 ? '' : fileName.substring(dotIndex);

  var index = 1;
  while (true) {
    final path = '${directory.path}$separator$stem-$index$extension';
    if (!File(path).existsSync()) return path;
    index++;
  }
}
