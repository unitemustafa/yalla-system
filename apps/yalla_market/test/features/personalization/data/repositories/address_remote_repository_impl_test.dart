import 'package:flutter_test/flutter_test.dart';
import 'package:yalla_market/features/personalization/data/repositories/address_remote_repository_impl.dart';

import '../../../../helpers/domain_fixtures.dart';
import '../../../../helpers/fake_api_client.dart';

void main() {
  group('AddressRemoteRepositoryImpl', () {
    test('loads address items from the API payload', () async {
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'GET');
        expect(request.path, '/addresses');
        return {
          'items': [sampleAddress.toApiJson()],
        };
      });
      final repository = AddressRemoteRepositoryImpl(apiClient);

      final result = await repository.getAddresses();

      result.when(
        success: (addresses) {
          expect(addresses.single.name, sampleAddress.name);
          expect(addresses.single.isDefault, isTrue);
        },
        failure: (failure) => fail(failure.message),
      );
    });

    test('creates a new address with the production API contract', () async {
      late Map<String, Object?> body;
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'POST');
        expect(request.path, '/addresses');
        body = request.data! as Map<String, Object?>;
        return {
          'items': [sampleAddress.toApiJson()],
        };
      });
      final repository = AddressRemoteRepositoryImpl(apiClient);

      final result = await repository.saveAddress(
        sampleAddress.copyWith(id: ''),
      );

      expect(body['fullName'], sampleAddress.name);
      expect(body['phone'], sampleAddress.phoneNumber);
      result.when(
        success: (addresses) => expect(addresses.single.id, sampleAddress.id),
        failure: (failure) => fail(failure.message),
      );
    });

    test('marks an address as default', () async {
      final apiClient = FakeApiClient((request) {
        expect(request.method, 'PATCH');
        expect(request.path, '/addresses/${sampleAddress.id}/default');
        return {
          'items': [sampleAddress.toApiJson()],
        };
      });
      final repository = AddressRemoteRepositoryImpl(apiClient);

      final result = await repository.selectAddress(sampleAddress.id);

      result.when(
        success: (addresses) => expect(addresses.single.isDefault, isTrue),
        failure: (failure) => fail(failure.message),
      );
    });
  });
}
