from django.contrib.auth import get_user_model
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

from .models import OneTimePassword
from .serializer_utils import (
    CamelCaseInputMixin,
    PasswordValidationMixin,
    RequiredFieldMessagesMixin,
    available_username,
    normalize_phone,
    user_by_phone,
)
from .services import normalize_email, verify_otp

User = get_user_model()


class SignupSerializer(
    CamelCaseInputMixin,
    RequiredFieldMessagesMixin,
    PasswordValidationMixin,
    serializers.Serializer,
):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    username = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        validators=[UnicodeUsernameValidator()],
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(
        required=False,
        write_only=True,
        trim_whitespace=False,
    )
    terms_accepted = serializers.BooleanField(required=False, default=True)

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        if not data.get("password_confirm") and not data.get("passwordConfirm"):
            data["password_confirm"] = data.get("password", "")
        if "terms_accepted" not in data and "termsAccepted" not in data:
            data["terms_accepted"] = True
        if not str(data.get("username", "")).strip():
            normalized_email = normalize_email(str(data.get("email", "")))
            data["username"] = available_username(
                normalized_email,
                reusable_email=normalized_email,
            )
        return super().to_internal_value(data)

    def validate_email(self, value):
        email = normalize_email(value)
        user = User.objects.filter(email__iexact=email).first()
        if user and user.is_active:
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_username(self, value):
        username = value.strip()
        email = normalize_email(self.initial_data.get("email", ""))
        user = User.objects.filter(username__iexact=username).first()
        if user and user.email.lower() != email:
            raise serializers.ValidationError("This username is already taken.")
        return username

    def validate_phone(self, value):
        phone = normalize_phone(value)
        user = user_by_phone(phone)
        email = normalize_email(self.initial_data.get("email", ""))
        if user and user.email.lower() != email:
            raise serializers.ValidationError(
                "An account with this phone number already exists."
            )
        return phone

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must accept the terms and conditions."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs


class EmailOTPSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.RegexField(r"^\d{6}$")

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        if "code" in data and "otp" not in data:
            data["otp"] = data["code"]
        return super().to_internal_value(data)

    def validate_email(self, value):
        return normalize_email(value)


class OTPRequestSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=OneTimePassword.Purpose.choices)

    def validate_email(self, value):
        return normalize_email(value)


class OTPVerifySerializer(EmailOTPSerializer):
    purpose = serializers.ChoiceField(choices=OneTimePassword.Purpose.choices)
    password = serializers.CharField(
        required=False,
        write_only=True,
        trim_whitespace=False,
    )
    password_confirm = serializers.CharField(
        required=False,
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        if attrs["purpose"] == OneTimePassword.Purpose.PASSWORD_RESET:
            password = attrs.get("password")
            password_confirm = attrs.get("password_confirm")
            if not password:
                raise serializers.ValidationError(
                    {"password": "Password is required for password reset."}
                )
            if password != password_confirm:
                raise serializers.ValidationError(
                    {"password_confirm": "Passwords do not match."}
                )
            validate_password_strength(password)
        return attrs


class LoginSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    rememberMe = serializers.BooleanField(
        required=False,
        default=False,
        write_only=True,
    )

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        if "email" not in data:
            data["email"] = data.get("identifier") or data.get("login") or ""
        return super().to_internal_value(data)

    def validate(self, attrs):
        identifier = str(attrs["email"]).strip()
        normalized_email = normalize_email(identifier)
        user = User.objects.filter(
            Q(email__iexact=normalized_email)
            | Q(username__iexact=identifier)
            | Q(phone=identifier)
        ).first()
        if user is None:
            user = user_by_phone(identifier)
        if user is None or not user.check_password(attrs["password"]):
            raise AuthenticationFailed("Invalid login credentials.")
        if not user.is_active:
            raise serializers.ValidationError(
                "Account email has not been verified."
            )
        attrs["user"] = user
        return attrs


class ForgotPasswordSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return normalize_email(value)


class ResetPasswordSerializer(
    CamelCaseInputMixin,
    PasswordValidationMixin,
    EmailOTPSerializer,
):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        user = User.objects.filter(email__iexact=attrs["email"], is_active=True).first()
        if user is None:
            raise serializers.ValidationError({"otp": "Invalid verification code."})
        _, error = verify_otp(
            user,
            OneTimePassword.Purpose.PASSWORD_RESET,
            attrs["otp"],
        )
        if error:
            raise serializers.ValidationError({"otp": error})
        attrs["user"] = user
        return attrs
