import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/location/domain/entities/city_data.dart';
import 'package:yalla_market/features/location/presentation/cubit/location_state.dart';
import 'package:yalla_market/features/location/presentation/widgets/city_selection_panel.dart';

void main() {
  testWidgets('other city input accepts custom city names', (tester) async {
    CityData? selectedCity;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: CitySelectionPanel(
              state: const LocationReady(null),
              compact: true,
              onCitySelected: (city) => selectedCity = city,
              onUseCurrentLocation: () {},
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Other'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'Hehia');
    await tester.ensureVisible(find.text('Save city'));
    await tester.tap(find.text('Save city'));
    await tester.pumpAndSettle();

    expect(selectedCity?.name, 'Hehia');
    expect(selectedCity?.slug, 'hehia');
  });
}
