import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/core/storage/token_store.dart';

void main() {
  group('InMemoryTokenStore', () {
    test('saves, reads, and clears tokens', () async {
      final store = InMemoryTokenStore();
      final tokens = StoredAuthTokens(
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );

      await store.save(tokens);
      expect(await store.read(), tokens);

      await store.clear();
      expect(await store.read(), isNull);
    });

    test('reports tokens as expiring soon', () {
      final tokens = StoredAuthTokens(
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: DateTime.now().add(const Duration(seconds: 30)),
      );

      expect(tokens.expiresSoon, isTrue);
      expect(tokens.isExpired, isFalse);
    });

    test('preserves session-only marker when copied', () {
      final tokens = StoredAuthTokens(
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        isSessionOnly: true,
      );

      expect(tokens.copyWith(accessToken: 'next').isSessionOnly, isTrue);
    });
  });
}
