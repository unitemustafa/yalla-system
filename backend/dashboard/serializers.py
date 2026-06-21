import json
import re
import secrets
from decimal import Decimal, InvalidOperation

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers

from catalog.models import (
    CategoryClassification,
    Product,
    ProductCategory,
    ProductVariant,
)
from markets.models import Market, MarketClassification
from locations.models import City
from orders.models import Order

User = get_user_model()

DEFAULT_ITEM_IMAGE = (
    "https://bucket.ammenu.com/twins-cafe/"
    "tenantsthumbnails/1775081472381-tz4tlty8cn.webp"
)

STATUS_TO_ARABIC = {
    Order.Status.PENDING: "قيد الانتظار",
    Order.Status.CONFIRMED: "مؤكد",
    Order.Status.UNDER_PREPARATION: "قيد التحضير",
    Order.Status.READY: "جاهز",
    Order.Status.DELIVERED: "مكتمل",
    Order.Status.CANCELLED: "ملغي",
}
ARABIC_TO_STATUS = {
    **{label: value for value, label in STATUS_TO_ARABIC.items()},
    "pending": Order.Status.PENDING,
    "waiting": Order.Status.PENDING,
    "confirmed": Order.Status.CONFIRMED,
    "under_preparation": Order.Status.UNDER_PREPARATION,
    "ready": Order.Status.READY,
    "completed": Order.Status.DELIVERED,
    "complete": Order.Status.DELIVERED,
    "delivered": Order.Status.DELIVERED,
    "cancelled": Order.Status.CANCELLED,
    "canceled": Order.Status.CANCELLED,
}


def image_value(image):
    if not image:
        return DEFAULT_ITEM_IMAGE
    value = str(image)
    if value.startswith(("http://", "https://", "/")):
        return value
    try:
        return image.url
    except ValueError:
        return value


def parse_price(value, fallback=Decimal("0")):
    if isinstance(value, (int, float, Decimal)):
        try:
            return max(Decimal(str(value)), Decimal("0"))
        except InvalidOperation:
            return fallback
    match = re.search(r"-?\d+(?:\.\d+)?", str(value or ""))
    if not match:
        return fallback
    try:
        return max(Decimal(match.group()), Decimal("0"))
    except InvalidOperation:
        return fallback


def unique_sku():
    while True:
        sku = f"PRD-{secrets.token_hex(4).upper()}"
        if not ProductVariant.objects.filter(sku=sku).exists():
            return sku


def resolve_market(name):
    cleaned = str(name or "").strip()
    if cleaned:
        market = Market.objects.filter(
            name__iexact=cleaned,
            city__isnull=False,
        ).first()
        if market:
            return market
        raise serializers.ValidationError(
            {
                "shopName": [
                    "Choose an existing market that is assigned to a city."
                ]
            }
        )

    market = (
        Market.objects.filter(
            status=Market.Status.ACTIVE,
            city__isnull=False,
        )
        .order_by("id")
        .first()
    )
    if market:
        return market
    raise serializers.ValidationError(
        {"shopName": ["Create a city-assigned market before creating products."]}
    )


class DashboardCitySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug", read_only=True)

    class Meta:
        model = City
        fields = (
            "id",
            "slug",
            "name",
            "name_ar",
            "center_latitude",
            "center_longitude",
            "radius_km",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")

    def validate_radius_km(self, value):
        if value <= 0:
            raise serializers.ValidationError("Radius must be greater than zero.")
        return value

    def validate_center_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_center_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )
        return value


class DashboardMarketSerializer(serializers.ModelSerializer):
    city_id = serializers.SlugRelatedField(
        source="city",
        slug_field="slug",
        queryset=City.objects.filter(is_active=True),
    )
    classification_id = serializers.PrimaryKeyRelatedField(
        source="classification",
        queryset=MarketClassification.objects.all(),
    )
    city_name = serializers.CharField(source="city.name", read_only=True)
    classification_name = serializers.CharField(
        source="classification.name",
        read_only=True,
    )

    class Meta:
        model = Market
        fields = (
            "id",
            "name",
            "branch",
            "status",
            "city_id",
            "city_name",
            "classification_id",
            "classification_name",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")

    def validate(self, attrs):
        if attrs.get("city") is None and (
            self.instance is None or self.instance.city_id is None
        ):
            raise serializers.ValidationError(
                {"city_id": "A city is required for every market change."}
            )
        return attrs


def resolve_category(name, category_type):
    cleaned_name = str(name or "").strip() or "غير مصنف"
    cleaned_type = str(category_type or "").strip() or "عام"
    category = ProductCategory.objects.filter(name__iexact=cleaned_name).first()
    if category:
        return category

    classification, _ = CategoryClassification.objects.get_or_create(
        name=cleaned_type
    )
    return ProductCategory.objects.create(
        classification=classification,
        name=cleaned_name,
        type=cleaned_type,
    )


def product_code(product):
    variant = product.variants.order_by("id").first()
    return variant.sku if variant and variant.sku else f"PRD-{product.pk:06d}"


def product_variant_details(product):
    return json.dumps(
        [
            {"id": variant.pk, "sku": variant.sku, "price": str(variant.price)}
            for variant in product.variants.order_by("id")
        ],
        ensure_ascii=False,
    )


def product_to_dashboard(product, position):
    variant = product.variants.order_by("price", "id").first()
    region_names = list(
        product.market.delivery_areas.order_by("name").values_list("name", flat=True)
    )
    return {
        "index": str(position),
        "id": str(product.pk),
        "code": product_code(product),
        "image": image_value(product.image),
        "name": product.name,
        "description": product.description,
        "category": product.category.name,
        "subcategory": product.category.type
        or product.category.classification.name,
        "shopName": product.market.name,
        "calories": "",
        "price": f"{variant.price if variant else Decimal('0')} EGP",
        "variantDetails": product_variant_details(product),
        "visibilityMode": "regions" if region_names else "general",
        "regionSlugs": [slugify(name, allow_unicode=True) for name in region_names],
        "regionNames": region_names,
        "featured": "نعم" if product.discount > 0 else "لا",
        "active": product.market.status == Market.Status.ACTIVE,
    }


def order_number(order):
    return f"ORD-{order.created_at:%Y%m%d}-{order.pk:06d}"


def order_to_dashboard(order, position):
    customer = order.user.get_full_name().strip() or order.user.username
    local_created_at = timezone.localtime(order.created_at)
    return {
        "index": str(position),
        "number": order_number(order),
        "customer": customer,
        "phone": order.user.phone,
        "type": "توصيل",
        "status": STATUS_TO_ARABIC.get(order.status, order.status),
        "total": float(order.total_price),
        "date": local_created_at.strftime("%Y-%m-%d"),
        "time": local_created_at.strftime("%H:%M"),
        "payment": order.payment_method,
        "courierId": str(order.courier_id) if order.courier_id else None,
    }


def order_id_from_number(number):
    match = re.search(r"(\d+)$", str(number or ""))
    return int(match.group(1)) if match else None


class DashboardItemWriteSerializer(serializers.Serializer):
    image = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(max_length=100, required=False, allow_blank=True)
    subcategory = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )
    shopName = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )
    calories = serializers.CharField(required=False, allow_blank=True)
    price = serializers.CharField(required=False, allow_blank=True)
    variantDetails = serializers.CharField(required=False, allow_blank=True)
    visibilityMode = serializers.CharField(required=False, allow_blank=True)
    regionSlugs = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    regionNames = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    featured = serializers.JSONField(required=False)
    active = serializers.BooleanField(required=False)

    def validate(self, attrs):
        if self.instance is None and not str(attrs.get("name", "")).strip():
            raise serializers.ValidationError({"name": ["Product name is required."]})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        market = resolve_market(validated_data.get("shopName"))
        category = resolve_category(
            validated_data.get("category"),
            validated_data.get("subcategory"),
        )
        product = Product.objects.create(
            market=market,
            category=category,
            name=validated_data["name"].strip(),
            description=str(validated_data.get("description", "")).strip(),
            image=str(validated_data.get("image", "")).strip() or None,
            discount=(
                Decimal("1")
                if validated_data.get("featured") in (True, "نعم")
                else Decimal("0")
            ),
        )
        ProductVariant.objects.create(
            product=product,
            price=parse_price(validated_data.get("price")),
            sku=unique_sku(),
        )
        return product

    @transaction.atomic
    def update(self, product, validated_data):
        if validated_data.get("name"):
            product.name = validated_data["name"].strip()
        if "description" in validated_data:
            product.description = str(validated_data["description"]).strip()
        if validated_data.get("image"):
            product.image = validated_data["image"].strip()
        if "category" in validated_data or "subcategory" in validated_data:
            product.category = resolve_category(
                validated_data.get("category", product.category.name),
                validated_data.get(
                    "subcategory",
                    product.category.type or product.category.classification.name,
                ),
            )
        if "shopName" in validated_data:
            product.market = resolve_market(validated_data["shopName"])
        if "featured" in validated_data:
            product.discount = (
                Decimal("1")
                if validated_data["featured"] in (True, "نعم")
                else Decimal("0")
            )
        product.save()

        if "active" in validated_data:
            product.market.status = (
                Market.Status.ACTIVE
                if validated_data["active"]
                else Market.Status.INACTIVE
            )
            product.market.save(update_fields=["status", "updated_at"])

        if "price" in validated_data:
            variant = product.variants.order_by("id").first()
            if variant:
                variant.price = parse_price(validated_data["price"], variant.price)
                variant.save(update_fields=["price"])
            else:
                ProductVariant.objects.create(
                    product=product,
                    price=parse_price(validated_data["price"]),
                    sku=unique_sku(),
                )
        return product


class DashboardOrderWriteSerializer(serializers.Serializer):
    customer = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    type = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, allow_blank=True)
    total = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, min_value=0
    )
    date = serializers.CharField(required=False, allow_blank=True)
    time = serializers.CharField(required=False, allow_blank=True)
    payment = serializers.CharField(required=False, allow_blank=True)
    courierId = serializers.IntegerField(required=False, allow_null=True)

    def validate_courierId(self, value):
        if value is None:
            return None
        courier = User.objects.filter(
            pk=value,
            role=User.Role.REPRESENTATIVE,
            courier_profile__isnull=False,
            is_active=True,
        ).first()
        if courier is None:
            raise serializers.ValidationError("Active courier was not found.")
        return courier

    def _status(self, value, fallback=Order.Status.PENDING):
        cleaned = str(value or "").strip()
        return ARABIC_TO_STATUS.get(cleaned, ARABIC_TO_STATUS.get(cleaned.lower(), fallback))

    def _user(self, validated_data):
        phone = str(validated_data.get("phone", "")).strip()
        if phone:
            user = User.objects.filter(phone=phone).first()
            if user:
                return user

        user = User.objects.filter(role=User.Role.CLIENT, is_active=True).first()
        if user:
            return user

        name = str(validated_data.get("customer", "")).strip() or "عميل جديد"
        suffix = secrets.token_hex(4)
        parts = name.split(maxsplit=1)
        user = User(
            username=f"dashboard_customer_{suffix}",
            email=f"dashboard-{suffix}@local.invalid",
            phone=phone or f"dashboard-{suffix}",
            first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else "",
            role=User.Role.CLIENT,
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        return user

    @transaction.atomic
    def create(self, validated_data):
        market = Market.objects.filter(status=Market.Status.ACTIVE).first()
        if not market:
            market = resolve_market("")
        total = validated_data.get("total", Decimal("0"))
        return Order.objects.create(
            user=self._user(validated_data),
            market=market,
            courier=validated_data.get("courierId"),
            payment_method=str(validated_data.get("payment", "")).strip() or "نقدي",
            description=str(validated_data.get("type", "")).strip(),
            status=self._status(validated_data.get("status")),
            subtotal_price=total,
            total_price=total,
        )

    @transaction.atomic
    def update(self, order, validated_data):
        if "status" in validated_data:
            order.status = self._status(validated_data["status"], order.status)
        if "payment" in validated_data:
            order.payment_method = validated_data["payment"].strip()
        if "type" in validated_data:
            order.description = validated_data["type"].strip()
        if "total" in validated_data:
            order.subtotal_price = validated_data["total"]
            order.total_price = validated_data["total"]
        if "courierId" in validated_data:
            order.courier = validated_data["courierId"]
        order.save()
        return order
