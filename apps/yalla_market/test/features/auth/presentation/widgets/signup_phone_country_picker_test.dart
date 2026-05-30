import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/auth/presentation/widgets/signup_phone_country_picker.dart';

void main() {
  const countries = [
    PhoneCountry(
      name: 'Egypt',
      isoCode: 'EG',
      dialCode: '+20',
      minDigits: 10,
      maxDigits: 11,
    ),
    PhoneCountry(
      name: 'Saudi Arabia',
      isoCode: 'SA',
      dialCode: '+966',
      minDigits: 9,
      maxDigits: 9,
    ),
  ];

  testWidgets('PhoneCountryPrefix shows country code and handles taps', (
    tester,
  ) async {
    var tapped = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PhoneCountryPrefix(
            country: countries.first,
            isDarkMode: false,
            onTap: () => tapped = true,
          ),
        ),
      ),
    );

    expect(find.text('EG +20'), findsOneWidget);

    await tester.tap(find.text('EG +20'));

    expect(tapped, isTrue);
  });

  testWidgets('CountryPickerSheet filters countries and returns selection', (
    tester,
  ) async {
    PhoneCountry? selectedCountry;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed: () async {
                  selectedCountry = await showModalBottomSheet<PhoneCountry>(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => CountryPickerSheet(
                      countries: countries,
                      selectedCountry: countries[0],
                    ),
                  );
                },
                child: const Text('Open'),
              );
            },
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    expect(find.text('Egypt'), findsOneWidget);
    expect(find.text('Saudi Arabia'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'sa');
    await tester.pumpAndSettle();

    expect(find.text('Egypt'), findsNothing);
    expect(find.text('Saudi Arabia'), findsOneWidget);

    await tester.tap(find.text('Saudi Arabia'));
    await tester.pumpAndSettle();

    expect(selectedCountry, countries[1]);
  });

  testWidgets(
    'CountryPickerSheet shows an empty state for unmatched searches',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CountryPickerSheet(
              countries: countries,
              selectedCountry: countries[0],
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'zzz');
      await tester.pumpAndSettle();

      expect(find.text('No countries found'), findsOneWidget);
    },
  );
}
