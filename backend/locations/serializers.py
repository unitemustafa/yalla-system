from django.db import transaction
from rest_framework import serializers

from .models import Address, City
from .services import resolve_city


class UnsupportedCoordinates(serializers.ValidationError):
    status_code = 422
    default_code = "unsupported_location"


class CitySerializer(serializers.ModelSerializer):
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
        )


class CoordinatesSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7)

    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )
        return value


class CitySelectionSerializer(serializers.Serializer):
    city_id = serializers.CharField()

    def validate_city_id(self, value):
        queryset = City.objects.filter(is_active=True)
        city = queryset.filter(slug=value).first()
        if city is None and str(value).isdigit():
            city = queryset.filter(pk=value).first()
        if city is None:
            raise serializers.ValidationError("Active city was not found.")
        return city


class AddressSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    phone_number = serializers.CharField(source="phone", read_only=True)
    street = serializers.CharField(source="line1", read_only=True)
    city = CitySerializer(read_only=True)
    city_id = serializers.CharField(source="city.slug", read_only=True)

    class Meta:
        model = Address
        fields = (
            "id",
            "name",
            "full_name",
            "phone",
            "phone_number",
            "line1",
            "street",
            "line2",
            "landmark",
            "postal_code",
            "city",
            "city_id",
            "latitude",
            "longitude",
            "is_default",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")
        extra_kwargs = {
            "name": {"required": False, "allow_blank": True},
            "full_name": {"required": True},
            "phone": {"required": True},
            "line1": {"required": True},
            "latitude": {"required": True},
            "longitude": {"required": True},
        }

    aliases = {
        "fullName": "full_name",
        "phoneNumber": "phone",
        "street": "line1",
        "postalCode": "postal_code",
        "isDefault": "is_default",
    }

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        for alias, field in self.aliases.items():
            if alias in data and field not in data:
                data[field] = data[alias]
        # A client-provided city name/ID is display-only. Coordinates are authoritative.
        data.pop("city", None)
        data.pop("city_id", None)
        return super().to_internal_value(data)

    def validate(self, attrs):
        instance = self.instance
        latitude = attrs.get("latitude", getattr(instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(instance, "longitude", None))
        if latitude is None or longitude is None:
            raise serializers.ValidationError(
                {"coordinates": "Latitude and longitude are required."}
            )
        city = resolve_city(latitude, longitude)
        if city is None:
            raise UnsupportedCoordinates(
                {
                    "code": "unsupported_location",
                    "detail": "These coordinates are outside supported cities.",
                }
            )
        attrs["city"] = city
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        locked = Address.objects.select_for_update().filter(user=user)
        has_addresses = locked.exists()
        make_default = validated_data.get("is_default", not has_addresses)
        if make_default:
            locked.filter(is_default=True).update(is_default=False)
        validated_data["is_default"] = make_default
        validated_data["name"] = (
            validated_data.get("name")
            or validated_data.get("full_name")
            or "Address"
        )
        return Address.objects.create(user=user, **validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        locked = Address.objects.select_for_update().filter(user=instance.user)
        instance = locked.get(pk=instance.pk)
        make_default = validated_data.get("is_default")
        if make_default:
            locked.exclude(pk=instance.pk).filter(is_default=True).update(
                is_default=False
            )
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
