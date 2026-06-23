from django.contrib.auth import get_user_model
from django.contrib.auth.validators import UnicodeUsernameValidator
from rest_framework import serializers

from .serializer_utils import (
    CamelCaseInputMixin,
    PasswordValidationMixin,
    RequiredFieldMessagesMixin,
    normalize_phone,
    user_by_phone,
)
from .services import normalize_email

User = get_user_model()


class ChangePasswordSerializer(
    CamelCaseInputMixin,
    RequiredFieldMessagesMixin,
    PasswordValidationMixin,
    serializers.Serializer,
):
    input_aliases = {
        **CamelCaseInputMixin.input_aliases,
        "currentPassword": "current_password",
        "newPassword": "new_password",
    }
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_current_password(self, value):
        user = self.context["user"]
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        return self._validate_password_strength(value)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {
                    "new_password": (
                        "New password must be different from the current password."
                    )
                }
            )
        return attrs

    def save(self, **kwargs):
        user = self.context["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class UserProfileUpdateSerializer(
    CamelCaseInputMixin,
    RequiredFieldMessagesMixin,
    serializers.Serializer,
):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    username = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        validators=[UnicodeUsernameValidator()],
    )
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate_email(self, value):
        email = normalize_email(value)
        user = User.objects.filter(email__iexact=email).exclude(pk=self.instance.pk).first()
        if user:
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_username(self, value):
        username = value.strip()
        if not username:
            raise serializers.ValidationError("Username is required.")
        user = User.objects.filter(username__iexact=username).exclude(
            pk=self.instance.pk,
        ).first()
        if user:
            raise serializers.ValidationError("This username is already taken.")
        return username

    def validate_phone(self, value):
        phone = normalize_phone(value)
        if not phone:
            raise serializers.ValidationError("Phone is required.")
        user = user_by_phone(phone, User.objects.exclude(pk=self.instance.pk))
        if user:
            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )
        return phone

    def update(self, instance, validated_data):
        fields = ("first_name", "last_name", "username", "email", "phone")
        for field in fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save(
            update_fields=[
                field
                for field in (*fields, "updated_at")
                if field in validated_data or field == "updated_at"
            ]
        )
        return instance
