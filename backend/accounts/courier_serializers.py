from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import CourierProfile
from .serializer_utils import (
    RequiredFieldMessagesMixin,
    available_username,
    normalize_phone,
    user_by_phone,
    validate_password_strength,
)
from .services import normalize_email

User = get_user_model()


class CourierSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    name = serializers.SerializerMethodField()
    photoUrl = serializers.CharField(source="courier_profile.photo_url", read_only=True)
    vehicle = serializers.CharField(source="courier_profile.vehicle", read_only=True)
    plateNumber = serializers.CharField(
        source="courier_profile.plate_number",
        read_only=True,
    )
    zone = serializers.CharField(source="courier_profile.zone", read_only=True)
    maxActiveOrders = serializers.IntegerField(
        source="courier_profile.max_active_orders",
        read_only=True,
    )
    status = serializers.SerializerMethodField()
    performance = serializers.SerializerMethodField()
    activeOrders = serializers.SerializerMethodField()
    deliveredOrders = serializers.SerializerMethodField()
    notDeliveredOrders = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "phone",
            "email",
            "photoUrl",
            "vehicle",
            "plateNumber",
            "zone",
            "maxActiveOrders",
            "status",
            "performance",
            "activeOrders",
            "deliveredOrders",
            "notDeliveredOrders",
        )

    def get_name(self, user):
        return user.get_full_name().strip() or user.username

    def get_status(self, user):
        labels = {
            CourierProfile.Status.AVAILABLE: "متاح",
            CourierProfile.Status.BUSY: "مشغول",
            CourierProfile.Status.OFFLINE: "غير متصل",
        }
        return labels.get(user.courier_profile.status, "غير متصل")

    def get_performance(self, _user):
        total = _user.courier_orders.count()
        delivered = _user.courier_orders.filter(status="delivered").count()
        return f"{round((delivered / total) * 100) if total else 0}%"

    def get_activeOrders(self, user):
        return list(
            user.courier_orders.filter(
                status__in=(
                    "pending",
                    "confirmed",
                    "under_preparation",
                    "ready",
                )
            ).values_list("id", flat=True)
        )

    def get_deliveredOrders(self, user):
        return list(
            user.courier_orders.filter(status="delivered").values_list(
                "id", flat=True
            )
        )

    def get_notDeliveredOrders(self, user):
        return list(
            user.courier_orders.filter(status="cancelled").values_list(
                "id", flat=True
            )
        )


class CourierCreateSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    name = serializers.CharField(max_length=300)
    phone = serializers.CharField(max_length=30)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    photoUrl = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    vehicle = serializers.CharField(max_length=120, required=False, allow_blank=True)
    plateNumber = serializers.CharField(max_length=60, required=False, allow_blank=True)
    zone = serializers.CharField(max_length=150, required=False, allow_blank=True)
    maxActiveOrders = serializers.IntegerField(min_value=1, max_value=50, default=3)

    def validate_password(self, value):
        return validate_password_strength(value)

    def validate_email(self, value):
        email = normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_phone(self, value):
        phone = normalize_phone(value)
        if user_by_phone(phone):
            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )
        return phone

    @transaction.atomic
    def create(self, validated_data):
        name_parts = validated_data.pop("name").strip().split(maxsplit=1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        email = validated_data.pop("email")
        phone = validated_data.pop("phone")
        password = validated_data.pop("password")
        username = available_username(email, fallback="courier")

        user = User.objects.create_user(
            username=username,
            email=email,
            phone=phone,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.REPRESENTATIVE,
            is_active=True,
        )
        CourierProfile.objects.create(
            user=user,
            photo_url=validated_data.get("photoUrl") or "",
            vehicle=validated_data.get("vehicle", ""),
            plate_number=validated_data.get("plateNumber", ""),
            zone=validated_data.get("zone", ""),
            max_active_orders=validated_data["maxActiveOrders"],
        )
        return user
