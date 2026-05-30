import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/store/data/demo/demo_categories.dart';
import 'package:yalla_market/features/store/data/demo/demo_shops.dart';

void main() {
  group('Market shop data', () {
    test('keeps services out of the shopping tab', () {
      expect(
        MarketCategories.shopping,
        isNot(contains(MarketCategories.services)),
      );
    });

    test('returns local restaurants for the selected city only', () {
      final cairoRestaurants = MarketShops.byCategoryAndCity(
        MarketCategories.restaurants.name,
        'cairo',
      );

      expect(cairoRestaurants, isNotEmpty);
      expect(
        cairoRestaurants.every((shop) => shop.citySlug == 'cairo'),
        isTrue,
      );
      expect(
        cairoRestaurants.every(
          (shop) => shop.categoryName == MarketCategories.restaurants.name,
        ),
        isTrue,
      );
      expect(cairoRestaurants.first.products, isNotEmpty);
    });
  });
}
