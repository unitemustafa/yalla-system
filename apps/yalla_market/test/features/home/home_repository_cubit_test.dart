import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/home/data/home_repository.dart';
import 'package:yalla_market/features/home/presentation/cubit/home_cubit.dart';

import '../../helpers/fake_api_client.dart';

void main() {
  test('Home parses city-isolated offers classifications and real min price', () async {
    final repository = HomeRepository(
      FakeApiClient((request) {
        expect(request.path, '/home/');
        return {
          'location': {'city_id': 'tripoli', 'name': 'Tripoli'},
          'offers': [
            {
              'id': 1,
              'title': 'Offer',
              'description': 'Real offer',
              'image': null,
              'discount': '10.00',
            },
          ],
          'market_classifications': [
            {
              'id': 2,
              'name': 'Groceries',
              'markets': [
                {'id': 3, 'name': 'Market'},
              ],
            },
          ],
          'products': [
            {
              'id': 4,
              'name': 'Milk',
              'image': null,
              'discount': '0.00',
              'min_price': '7.50',
              'category': {'name': 'Dairy'},
              'market': {'name': 'Market', 'city_id': 'tripoli'},
              'variants': [
                {'price': '7.50'},
              ],
            },
          ],
        };
      }),
    );
    final cubit = HomeCubit(repository);
    addTearDown(cubit.close);

    await cubit.load();

    final state = cubit.state as HomeReady;
    expect(state.data.citySlug, 'tripoli');
    expect(state.data.offers.single.image, isNull);
    expect(state.data.classifications.single.marketCount, 1);
    expect(state.data.products.single.price, '7.50');
    expect(state.data.products.single.image, isEmpty);
  });

  test('Home emits an explicit empty state', () async {
    final cubit = HomeCubit(
      HomeRepository(
        FakeApiClient(
          (_) => {
            'location': {'city_id': 'tripoli', 'name': 'Tripoli'},
            'offers': [],
            'market_classifications': [],
            'products': [],
          },
        ),
      ),
    );
    addTearDown(cubit.close);

    await cubit.load();

    expect(cubit.state, isA<HomeEmpty>());
  });
}
