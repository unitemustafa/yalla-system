from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from catalog.models import (
    CategoryClassification,
    Product,
    ProductCategory,
    ProductVariant,
)
from locations.models import City
from offers.models import Offer

from .models import Market, MarketClassification

User = get_user_model()


class HomeAPITests(APITestCase):
    def setUp(self):
        self.city = self.create_city("tripoli", "32.8872", "13.1913")
        self.other_city = self.create_city("benghazi", "32.1194", "20.0868")
        self.user = User.objects.create_user(
            username="home-user",
            email="home@example.com",
            phone="+218920000001",
            password="Password1!",
            current_city=self.city,
        )
        classification = MarketClassification.objects.create(name="Markets")
        self.market = Market.objects.create(
            classification=classification,
            city=self.city,
            name="Tripoli Market",
        )
        self.other_market = Market.objects.create(
            classification=classification,
            city=self.other_city,
            name="Benghazi Market",
        )
        self.legacy_market = Market.objects.create(
            classification=classification,
            name="Legacy Market",
        )
        category_classification = CategoryClassification.objects.create(name="Food")
        category = ProductCategory.objects.create(
            classification=category_classification,
            name="Groceries",
        )
        self.product = self.create_product(self.market, category, "Local", "10.00")
        ProductVariant.objects.create(
            product=self.product,
            price=Decimal("7.50"),
            sku="LOCAL-CHEAP",
        )
        self.other_product = self.create_product(
            self.other_market, category, "Remote", "2.00"
        )
        self.legacy_product = self.create_product(
            self.legacy_market, category, "Legacy", "1.00"
        )
        now = timezone.now()
        self.offer = Offer.objects.create(
            market=self.market,
            title="Local offer",
            type=Offer.OfferType.DISCOUNT,
            discount=Decimal("10"),
            start_time=now - timedelta(hours=1),
            end_time=now + timedelta(hours=1),
        )
        self.offer.products.add(self.product)

    def authenticate(self):
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def test_home_requires_current_city_with_428(self):
        self.user.current_city = None
        self.user.save(update_fields=["current_city"])
        self.authenticate()
        response = self.client.get("/api/v1/home/")
        self.assertEqual(response.status_code, 428)
        self.assertEqual(response.data["code"], "location_required")

    def test_both_home_routes_are_city_isolated_and_use_real_min_price(self):
        self.authenticate()
        for path in ("/api/v1/home/", "/api/home/"):
            response = self.client.get(path)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["location"]["city_id"], "tripoli")
            product_ids = {item["id"] for item in response.data["products"]}
            self.assertIn(self.product.pk, product_ids)
            self.assertNotIn(self.other_product.pk, product_ids)
            self.assertNotIn(self.legacy_product.pk, product_ids)
            local = next(
                item
                for item in response.data["products"]
                if item["id"] == self.product.pk
            )
            self.assertEqual(Decimal(local["min_price"]), Decimal("7.50"))
            self.assertIsNone(local["image"])

    def create_city(self, slug, latitude, longitude):
        return City.objects.create(
            slug=slug,
            name=slug.title(),
            center_latitude=Decimal(latitude),
            center_longitude=Decimal(longitude),
            radius_km=Decimal("20"),
        )

    def create_product(self, market, category, name, price):
        product = Product.objects.create(
            market=market,
            category=category,
            name=name,
        )
        ProductVariant.objects.create(
            product=product,
            price=Decimal(price),
            sku=name.upper(),
        )
        return product
