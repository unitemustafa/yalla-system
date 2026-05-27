import 'package:flutter_test/flutter_test.dart';

import 'package:yalla_courier/main.dart';

void main() {
  testWidgets('shows courier login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const YallaCourierApp());

    expect(find.text('أهلاً يا كابتن'), findsOneWidget);
    expect(find.text('رقم الموبايل أو الإيميل'), findsOneWidget);
    expect(find.text('دخول Demo'), findsOneWidget);
  });
}
