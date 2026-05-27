import 'package:flutter_test/flutter_test.dart';
import 'package:yallamarket/core/errors/failure.dart';
import 'package:yallamarket/features/personalization/data/repositories/address_repository_impl.dart';

import '../../../../helpers/domain_fixtures.dart';

void main() {
  group('AddressRepositoryImpl', () {
    test('loads seeded addresses with a default selection', () async {
      final repository = AddressRepositoryImpl();

      final result = await repository.getAddresses();

      result.when(
        success: (addresses) {
          expect(addresses, isNotEmpty);
          expect(addresses.where((address) => address.isDefault), hasLength(1));
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('saves a new address and selects it', () async {
      final repository = AddressRepositoryImpl();

      final result = await repository.saveAddress(
        sampleAddress.copyWith(id: ''),
      );

      result.when(
        success: (addresses) {
          expect(addresses.first.name, sampleAddress.name);
          expect(addresses.first.id, isNotEmpty);
          expect(addresses.first.isDefault, isTrue);
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('selects and deletes an address', () async {
      final repository = AddressRepositoryImpl();
      await repository.saveAddress(sampleAddress.copyWith(id: 'address_new'));
      await repository.selectAddress('address-1');

      final deleteResult = await repository.deleteAddress('address-1');

      deleteResult.when(
        success: (addresses) {
          expect(
            addresses.any((address) => address.id == 'address-1'),
            isFalse,
          );
          expect(addresses.where((address) => address.isDefault), hasLength(1));
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test(
      'returns validation failure for an unknown selected address',
      () async {
        final repository = AddressRepositoryImpl();

        final result = await repository.selectAddress('missing');

        result.when(
          success: (_) => fail('Selecting a missing address should fail.'),
          failure: (failure) {
            expect(failure, isA<ValidationFailure>());
            expect(failure.message, 'Address was not found.');
          },
        );
      },
    );
  });
}
