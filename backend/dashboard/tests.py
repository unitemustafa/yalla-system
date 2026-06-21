from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import CourierProfile
from locations.models import City
from markets.models import Market, MarketClassification
from orders.models import Order

User = get_user_model()


class DashboardIntegrationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            phone="+218940000001",
            password="Password1!",
            role=User.Role.ADMIN,
        )
        token = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
        self.city = City.objects.create(
            slug="tripoli",
            name="Tripoli",
            center_latitude=Decimal("32.8872"),
            center_longitude=Decimal("13.1913"),
            radius_km=Decimal("20"),
        )
        self.classification = MarketClassification.objects.create(name="General")
        self.market = Market.objects.create(
            name="Market",
            classification=self.classification,
            city=self.city,
        )
        self.courier = User.objects.create_user(
            username="courier",
            email="courier@example.com",
            phone="+218940000002",
            password="Password1!",
            role=User.Role.REPRESENTATIVE,
        )
        CourierProfile.objects.create(user=self.courier, zone="Tripoli")

    def test_market_api_requires_city_and_city_crud_is_available(self):
        response = self.client.post(
            "/api/v1/dashboard/markets",
            {
                "name": "Missing city",
                "classification_id": self.classification.pk,
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("city_id", response.data)

        response = self.client.get("/api/v1/dashboard/cities")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["cities"][0]["id"], "tripoli")

    def test_order_assignment_accepts_only_representatives_and_counts_statuses(self):
        response = self.client.post(
            "/api/v1/dashboard/orders",
            {
                "customer": "Customer",
                "phone": "+218940000003",
                "payment": "cash",
                "total": "10",
                "courierId": self.courier.pk,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get()
        self.assertEqual(order.courier, self.courier)

        order.status = Order.Status.DELIVERED
        order.save(update_fields=["status"])
        response = self.client.get("/api/v1/auth/couriers")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        courier = response.data["couriers"][0]
        self.assertEqual(courier["activeOrders"], [])
        self.assertEqual(courier["deliveredOrders"], [order.pk])

        client_user = User.objects.create_user(
            username="client",
            email="client@example.com",
            phone="+218940000004",
            password="Password1!",
        )
        response = self.client.post(
            "/api/v1/dashboard/orders",
            {"courierId": client_user.pk},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
