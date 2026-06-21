from rest_framework import serializers

from catalog.models import Product, ProductCategory, ProductVariant
from offers.models import Offer

from .models import Market, MarketClassification


class HomeMarketSerializer(serializers.ModelSerializer):
    classification_id = serializers.IntegerField(read_only=True)
    city_id = serializers.CharField(source="city.slug", read_only=True)

    class Meta:
        model = Market
        fields = (
            "id",
            "name",
            "branch",
            "status",
            "classification_id",
            "city_id",
        )


class HomeMarketClassificationSerializer(serializers.ModelSerializer):
    markets = serializers.SerializerMethodField()

    class Meta:
        model = MarketClassification
        fields = ("id", "name", "markets")

    def get_markets(self, classification):
        eligible_market_ids = self.context["eligible_market_ids"]
        markets = classification.markets.filter(
            id__in=eligible_market_ids,
            status=Market.Status.ACTIVE,
        ).order_by("name")
        return HomeMarketSerializer(markets, many=True).data


class HomeCategorySerializer(serializers.ModelSerializer):
    classification_id = serializers.IntegerField(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductCategory
        fields = (
            "id",
            "name",
            "type",
            "description",
            "image",
            "classification_id",
        )

    def get_image(self, category):
        return _absolute_image(self.context.get("request"), category.image)


class HomeVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ("id", "price", "sku")


class HomeProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    market = HomeMarketSerializer(read_only=True)
    variants = HomeVariantSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "image",
            "discount",
            "category",
            "market",
            "variants",
            "min_price",
        )

    def get_category(self, product):
        return HomeCategorySerializer(
            product.category,
            context={"request": self.context.get("request")},
        ).data

    def get_image(self, product):
        return _absolute_image(self.context.get("request"), product.image)

    def get_min_price(self, product):
        variant = min(
            product.variants.all(),
            key=lambda item: (item.price, item.pk),
            default=None,
        )
        return variant.price if variant else None


class HomeOfferSerializer(serializers.ModelSerializer):
    market = HomeMarketSerializer(read_only=True)
    products = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = (
            "id",
            "title",
            "description",
            "image",
            "type",
            "discount",
            "start_time",
            "end_time",
            "active_days",
            "use_limits",
            "user_limit",
            "status",
            "market",
            "products",
        )

    def get_products(self, offer):
        return HomeProductSerializer(
            offer.products.all(),
            many=True,
            context={"request": self.context.get("request")},
        ).data

    def get_image(self, offer):
        return _absolute_image(self.context.get("request"), offer.image)


def _absolute_image(request, image):
    if not image:
        return None
    try:
        url = image.url
    except ValueError:
        return None
    return request.build_absolute_uri(url) if request else url
