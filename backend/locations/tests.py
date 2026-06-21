from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, City

User = get_user_model()


class LocationAndAddressAPITests(APITestCase):
    def setUp(self):
        self.city = City.objects.create(
            slug="tripoli",
            name="Tripoli",
            name_ar="طرابلس",
            center_latitude=Decimal("32.8872000"),
            center_longitude=Decimal("13.1913000"),
            radius_km=Decimal("25.00"),
        )
        self.user = User.objects.create_user(
            username="location-user",
            email="location@example.com",
            phone="+218910000001",
            password="Password1!",
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def address_payload(self, **overrides):
        return {
            "fullName": "Test User",
            "phone": "+218910000001",
            "line1": "Main street",
            "latitude": "32.8872000",
            "longitude": "13.1913000",
            **overrides,
        }

    def test_resolve_and_manual_select_set_current_city(self):
        response = self.client.post(
            "/api/v1/location/resolve",
            {"latitude": "32.8872", "longitude": "13.1913"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["city"]["id"], "tripoli")
        self.user.refresh_from_db()
        self.assertEqual(self.user.current_city, self.city)

        response = self.client.post(
            "/api/v1/location/select",
            {"city_id": "tripoli"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["source"], "manual")

    def test_resolve_rejects_unsupported_coordinates_with_422(self):
        response = self.client.post(
            "/api/v1/location/resolve",
            {"latitude": "0", "longitude": "0"},
        )
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.data["code"], "unsupported_location")

    def test_address_crud_is_owned_and_city_is_computed(self):
        response = self.client.post(
            "/api/v1/addresses",
            self.address_payload(city="client-value-is-ignored"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        address = Address.objects.get(user=self.user)
        self.assertEqual(address.city, self.city)
        self.assertTrue(address.is_default)

        other = User.objects.create_user(
            username="other",
            email="other@example.com",
            phone="+218910000002",
            password="Password1!",
        )
        foreign_address = Address.objects.create(
            user=other,
            name="Other",
            full_name="Other",
            phone=other.phone,
            line1="Other street",
            city=self.city,
            latitude=self.city.center_latitude,
            longitude=self.city.center_longitude,
        )
        response = self.client.patch(
            f"/api/v1/addresses/{foreign_address.pk}",
            {"line1": "No access"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_only_one_default_address_is_allowed(self):
        first = Address.objects.create(
            user=self.user,
            name="One",
            full_name="One",
            phone=self.user.phone,
            line1="One",
            city=self.city,
            latitude=self.city.center_latitude,
            longitude=self.city.center_longitude,
            is_default=True,
        )
        second = Address.objects.create(
            user=self.user,
            name="Two",
            full_name="Two",
            phone=self.user.phone,
            line1="Two",
            city=self.city,
            latitude=self.city.center_latitude,
            longitude=self.city.center_longitude,
        )
        response = self.client.patch(f"/api/v1/addresses/{second.pk}/default")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertFalse(first.is_default)
        self.assertTrue(second.is_default)

        with self.assertRaises(IntegrityError), transaction.atomic():
            Address.objects.create(
                user=self.user,
                name="Three",
                full_name="Three",
                phone=self.user.phone,
                line1="Three",
                city=self.city,
                latitude=self.city.center_latitude,
                longitude=self.city.center_longitude,
                is_default=True,
            )
