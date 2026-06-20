import re

from django.contrib.auth import get_user_model
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CourierProfile, OneTimePassword
from .services import normalize_email, verify_otp

User = get_user_model()

PHONE_COUNTRY_CODES = (
    "966",
    "964",
    "971",
    "44",
    "91",
    "92",
    "90",
    "20",
    "1",
)
PHONE_TRUNK_ZERO_COUNTRY_CODES = set(PHONE_COUNTRY_CODES) - {"1", "91"}


def normalize_phone(value):
    raw_value = str(value or "").strip()
    digits = re.sub(r"\D", "", raw_value)
    if not digits:
        return raw_value
    if digits.startswith("00"):
        digits = digits[2:]

    for country_code in PHONE_COUNTRY_CODES:
        if digits.startswith(country_code) and len(digits) > len(country_code):
            national_number = digits[len(country_code) :]
            if (
                country_code in PHONE_TRUNK_ZERO_COUNTRY_CODES
                and national_number.startswith("0")
            ):
                national_number = national_number[1:]
            return f"+{country_code}{national_number}"

    if re.match(r"^01[0125]\d{8}$", digits):
        return f"+20{digits[1:]}"
    return raw_value


def phone_lookup_keys(value):
    digits = re.sub(r"\D", "", str(value or ""))
    if not digits:
        return set()
    if digits.startswith("00"):
        digits = digits[2:]

    keys = {digits}
    if digits.startswith("0") and len(digits) > 1:
        keys.add(digits[1:])

    for country_code in PHONE_COUNTRY_CODES:
        if digits.startswith(country_code) and len(digits) > len(country_code):
            national_number = digits[len(country_code) :]
            keys.add(national_number)
            if national_number.startswith("0") and len(national_number) > 1:
                national_number = national_number[1:]
                keys.add(national_number)
            keys.add(f"{country_code}{national_number}")
            break

    return {key for key in keys if key}


def phones_equivalent(left, right):
    return bool(phone_lookup_keys(left) & phone_lookup_keys(right))


def user_by_phone(phone, queryset=None):
    if not phone_lookup_keys(phone):
        return None
    users = queryset if queryset is not None else User.objects.exclude(phone="")
    for user in users.exclude(phone=""):
        if phones_equivalent(user.phone, phone):
            return user
    return None


class CamelCaseInputMixin:
    input_aliases = {
        "firstName": "first_name",
        "lastName": "last_name",
        "passwordConfirm": "password_confirm",
        "termsAccepted": "terms_accepted",
    }

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        else:
            data = dict(data)

        for alias, field_name in self.input_aliases.items():
            if alias in data and field_name not in data:
                data[field_name] = data[alias]

        return super().to_internal_value(data)


class RequiredFieldMessagesMixin:
    def get_fields(self):
        fields = super().get_fields()
        for name, field in fields.items():
            if field.required:
                label = field.label or name.replace("_", " ").capitalize()
                message = f"{label} is required."
                field.error_messages["required"] = message
                field.error_messages["blank"] = message
        return fields


class UserSerializer(RequiredFieldMessagesMixin, serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "phone",
            "role",
        )


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
        return "100%"

    def get_activeOrders(self, _user):
        return []

    def get_deliveredOrders(self, _user):
        return []

    def get_notDeliveredOrders(self, _user):
        return []


class CourierCreateSerializer(
    RequiredFieldMessagesMixin,
    serializers.Serializer,
):
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
        errors = []
        if len(value) < 8:
            errors.append("Password must be at least 8 characters.")
        if not re.search(r"[A-Z]", value):
            errors.append("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", value):
            errors.append("Password must contain at least one number.")
        if not re.search(r"[^A-Za-z0-9]", value):
            errors.append("Password must contain at least one special character.")
        if errors:
            raise serializers.ValidationError(errors)

        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

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
        username = self._available_username(email)

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

    def _available_username(self, email):
        local_part = email.split("@", 1)[0]
        base = re.sub(r"[^A-Za-z0-9_.+-]+", "_", local_part).strip("._+-")
        base = (base or "courier")[:140]
        candidate = base
        suffix = 1
        while User.objects.filter(username__iexact=candidate).exists():
            suffix_text = f"_{suffix}"
            candidate = f"{base[:150 - len(suffix_text)]}{suffix_text}"
            suffix += 1
        return candidate


class PasswordValidationMixin:
    def validate_password(self, value):
        return self._validate_password_strength(value)

    def _validate_password_strength(self, value):
        errors = []
        if len(value) < 8:
            errors.append("Password must be at least 8 characters.")
        if not re.search(r"[A-Z]", value):
            errors.append("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", value):
            errors.append("Password must contain at least one number.")
        if not re.search(r"[^A-Za-z0-9]", value):
            errors.append("Password must contain at least one special character.")
        if errors:
            raise serializers.ValidationError(errors)

        try:
            validate_password(value, user=self.context.get("user"))
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value


class RegisterSerializer(
    CamelCaseInputMixin,
    RequiredFieldMessagesMixin,
    PasswordValidationMixin,
    serializers.Serializer,
):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    username = serializers.CharField(
        max_length=150,
        validators=[UnicodeUsernameValidator()],
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)
    terms_accepted = serializers.BooleanField()

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


class SignupSerializer(RegisterSerializer):
    username = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        validators=[UnicodeUsernameValidator()],
    )
    password_confirm = serializers.CharField(
        required=False,
        write_only=True,
        trim_whitespace=False,
    )
    terms_accepted = serializers.BooleanField(required=False, default=True)

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        else:
            data = dict(data)

        if not data.get("password_confirm") and not data.get("passwordConfirm"):
            data["password_confirm"] = data.get("password", "")
        if "terms_accepted" not in data and "termsAccepted" not in data:
            data["terms_accepted"] = True
        if not str(data.get("username", "")).strip():
            data["username"] = self._username_from_email(data.get("email", ""))

        return super().to_internal_value(data)

    def _username_from_email(self, email):
        normalized_email = normalize_email(str(email))
        local_part = normalized_email.split("@", 1)[0]
        base = re.sub(r"[^A-Za-z0-9_.+-]+", "_", local_part).strip("._+-")
        base = (base or "user")[:140]
        candidate = base
        suffix = 1

        while User.objects.filter(username__iexact=candidate).exclude(
            email__iexact=normalized_email,
        ).exists():
            suffix_text = f"_{suffix}"
            candidate = f"{base[:150 - len(suffix_text)]}{suffix_text}"
            suffix += 1

        return candidate


class EmailOTPSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.RegexField(r"^\d{6}$")

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        else:
            data = dict(data)

        if "code" in data and "otp" not in data:
            data["otp"] = data["code"]

        return super().to_internal_value(data)

    def validate_email(self, value):
        return normalize_email(value)


class LoginSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    rememberMe = serializers.BooleanField(
        required=False,
        default=False,
        write_only=True,
    )

    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
        else:
            data = dict(data)

        if "email" not in data:
            data["email"] = data.get("identifier") or data.get("login") or ""

        return super().to_internal_value(data)

    def validate(self, attrs):
        identifier = str(attrs["email"]).strip()
        normalized_email = normalize_email(identifier)
        user = (
            User.objects.filter(
                Q(email__iexact=normalized_email)
                | Q(username__iexact=identifier)
                | Q(phone=identifier)
            )
            .first()
        )
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

        user = User.objects.filter(
            email__iexact=attrs["email"],
            is_active=True,
        ).first()
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
                {"new_password": "New password must be different from the current password."}
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
        user = User.objects.filter(email__iexact=email).exclude(
            pk=self.instance.pk,
        ).first()
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
        for field in ("first_name", "last_name", "username", "email", "phone"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save(
            update_fields=[
                field
                for field in (
                    "first_name",
                    "last_name",
                    "username",
                    "email",
                    "phone",
                    "updated_at",
                )
                if field in validated_data or field == "updated_at"
            ]
        )
        return instance


class LogoutSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    refresh = serializers.CharField(required=False)
    refreshToken = serializers.CharField(required=False, write_only=True)

    def validate(self, attrs):
        refresh = attrs.get("refresh") or attrs.get("refreshToken")
        if not refresh:
            raise serializers.ValidationError(
                {"refresh": "Refresh token is required."}
            )
        attrs["refresh"] = refresh
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.validated_data["refresh"]).blacklist()
        except TokenError as exc:
            raise serializers.ValidationError(
                {"refresh": "Invalid or expired refresh token."}
            ) from exc


class EmailTokenRefreshSerializer(
    RequiredFieldMessagesMixin,
    TokenRefreshSerializer,
):
    refresh = serializers.CharField(required=False)
    refreshToken = serializers.CharField(required=False, write_only=True)

    def validate(self, attrs):
        refresh = attrs.get("refresh") or attrs.get("refreshToken")
        if not refresh:
            raise serializers.ValidationError(
                {"refresh": "Refresh token is required."}
            )
        data = super().validate({"refresh": refresh})
        return {
            "accessToken": data["access"],
            "refreshToken": data.get("refresh", refresh),
        }
