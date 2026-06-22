import re

from django.contrib.auth import get_user_model
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CourierProfile, OneTimePassword
from .services import normalize_email, verify_otp

User = get_user_model()


API_ROLE_BY_MODEL_ROLE = {
    User.Role.ADMIN: "ADMIN",
    User.Role.CLIENT: "CUSTOMER",
    User.Role.REPRESENTATIVE: "REPRESENTATIVE",
}


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
        fields = ("id", "first_name", "last_name", "email", "phone", "role")


class ApiUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    firstName = serializers.CharField(source="first_name", read_only=True)
    lastName = serializers.CharField(source="last_name", read_only=True)
    avatarUrl = serializers.SerializerMethodField()
    hasPassword = serializers.SerializerMethodField()
    birthDate = serializers.SerializerMethodField()
    usernameChangedAt = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "firstName",
            "lastName",
            "role",
            "hasPassword",
            "username",
            "phone",
            "gender",
            "avatarUrl",
            "birthDate",
            "usernameChangedAt",
        )

    def get_avatarUrl(self, obj):
        profile = getattr(obj, "courier_profile", None)
        if profile and profile.photo_url:
            return profile.photo_url
        return None

    def get_hasPassword(self, obj):
        return obj.has_usable_password()

    def get_birthDate(self, obj):
        if obj.birth_date:
            return obj.birth_date.isoformat()
        return None

    def get_usernameChangedAt(self, obj):
        if obj.username_changed_at:
            return obj.username_changed_at.isoformat().replace("+00:00", "Z")
        return None

    def get_role(self, obj):
        return API_ROLE_BY_MODEL_ROLE.get(obj.role, obj.role.upper())


class CourierProfileSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="user.id", read_only=True)
    userId = serializers.CharField(source="user.id", read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    photoUrl = serializers.CharField(source="photo_url", read_only=True)
    plateNumber = serializers.CharField(source="plate_number", read_only=True)
    maxActiveOrders = serializers.IntegerField(
        source="max_active_orders",
        read_only=True,
    )

    class Meta:
        model = CourierProfile
        fields = (
            "id",
            "userId",
            "name",
            "email",
            "phone",
            "photoUrl",
            "vehicle",
            "plateNumber",
            "zone",
            "maxActiveOrders",
            "status",
        )

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username or obj.user.email


class PasswordValidationMixin:
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


def unique_username_from_email(email):
    seed = re.sub(r"[^A-Za-z0-9_]+", "_", email.split("@", 1)[0]).strip("_")
    seed = seed[:24] or "user"
    username = seed
    counter = 1
    while User.objects.filter(username__iexact=username).exists():
        suffix = f"_{counter}"
        username = f"{seed[:150 - len(suffix)]}{suffix}"
        counter += 1
    return username


def split_full_name(name):
    parts = name.strip().split()
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


class RegisterSerializer(
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
        phone = value.strip()
        user = User.objects.filter(phone=phone).first()
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


class CustomerSignupSerializer(
    RequiredFieldMessagesMixin,
    PasswordValidationMixin,
    serializers.Serializer,
):
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    username = serializers.CharField(
        max_length=150,
        validators=[UnicodeUsernameValidator()],
    )
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        email = normalize_email(value)
        user = User.objects.filter(email__iexact=email).first()
        if user and user.is_active:
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate_phone(self, value):
        phone = value.strip()
        email = normalize_email(self.initial_data.get("email", ""))
        user = User.objects.filter(phone=phone).first()
        if user and user.email.lower() != email:
            raise serializers.ValidationError("Phone number is already registered.")
        return phone

    def validate(self, attrs):
        email = attrs["email"]
        username = attrs["username"].strip()
        user = User.objects.filter(username__iexact=username).first()
        if user and user.email.lower() != email:
            raise serializers.ValidationError(
                {"username": "Username is already taken."}
            )
        attrs["username"] = username
        return attrs


class EmailCodeSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.RegexField(r"^\d{6}$", required=False)
    otp = serializers.RegexField(r"^\d{6}$", required=False)

    def validate_email(self, value):
        return normalize_email(value)

    def validate(self, attrs):
        code = attrs.get("code") or attrs.get("otp")
        if not code:
            raise serializers.ValidationError({"code": "Code is required."})
        attrs["code"] = code
        return attrs


class EmailOTPSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.RegexField(r"^\d{6}$")

    def validate_email(self, value):
        return normalize_email(value)


class LoginSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        email = normalize_email(attrs["email"])
        user = User.objects.filter(email__iexact=email).first()

        if user is None or not user.check_password(attrs["password"]):
            raise AuthenticationFailed("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError(
                "Account email has not been verified."
            )

        attrs["user"] = user
        return attrs


class RoleLoginSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    allowed_roles = ()
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    identifier = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier = (
            attrs.get("identifier")
            or attrs.get("email")
            or attrs.get("phone")
            or ""
        ).strip()
        if not identifier:
            raise serializers.ValidationError(
                {"identifier": "Email or phone is required."}
            )

        if "@" in identifier:
            user = User.objects.filter(email__iexact=normalize_email(identifier)).first()
        else:
            user = User.objects.filter(phone=identifier).first()

        if user is None or not user.check_password(attrs["password"]):
            raise AuthenticationFailed("Invalid email or password.")
        if not user.is_active:
            raise AuthenticationFailed("Account is not active.")
        if self.allowed_roles and user.role not in self.allowed_roles:
            raise AuthenticationFailed("This account cannot access this app.")

        attrs["user"] = user
        return attrs


class DashboardLoginSerializer(RoleLoginSerializer):
    allowed_roles = (User.Role.ADMIN,)


class CourierLoginSerializer(RoleLoginSerializer):
    allowed_roles = (User.Role.REPRESENTATIVE,)


class ForgotPasswordSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return normalize_email(value)


class ResetPasswordSerializer(PasswordValidationMixin, EmailOTPSerializer):
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


class MeUpdateSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=150, required=False, allow_blank=True)
    lastName = serializers.CharField(max_length=150, required=False, allow_blank=True)
    username = serializers.CharField(
        max_length=150,
        validators=[UnicodeUsernameValidator()],
        required=False,
        allow_blank=True,
    )
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    gender = serializers.CharField(max_length=20, required=False, allow_blank=True)
    birthDate = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_email(self, value):
        email = normalize_email(value)
        user = self.context["user"]
        exists = User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists()
        if exists:
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate_username(self, value):
        username = value.strip()
        if not username:
            return username
        user = self.context["user"]
        exists = (
            User.objects.filter(username__iexact=username)
            .exclude(pk=user.pk)
            .exists()
        )
        if exists:
            raise serializers.ValidationError("Username is already taken.")
        return username

    def validate_phone(self, value):
        phone = value.strip()
        if not phone:
            return phone
        user = self.context["user"]
        exists = User.objects.filter(phone=phone).exclude(pk=user.pk).exists()
        if exists:
            raise serializers.ValidationError("Phone number is already registered.")
        return phone

    def validate_birthDate(self, value):
        if value in (None, ""):
            return None
        date_value = parse_date(value)
        if date_value is not None:
            return date_value
        datetime_value = parse_datetime(value)
        if datetime_value is not None:
            return datetime_value.date()
        raise serializers.ValidationError("Birth date must be a valid date.")


class DeleteAccountSerializer(RequiredFieldMessagesMixin, serializers.Serializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = self.context["user"]
        if not user.check_password(attrs["password"]):
            raise AuthenticationFailed("Invalid password.")
        return attrs


class CourierCreateSerializer(
    RequiredFieldMessagesMixin,
    PasswordValidationMixin,
    serializers.Serializer,
):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    photoUrl = serializers.CharField(required=False, allow_blank=True)
    vehicle = serializers.CharField(max_length=100, required=False, allow_blank=True)
    plateNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    zone = serializers.CharField(max_length=100, required=False, allow_blank=True)
    maxActiveOrders = serializers.IntegerField(required=False, min_value=1)

    def validate_email(self, value):
        email = normalize_email(value)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email is already registered.")
        return email

    def validate_phone(self, value):
        phone = value.strip()
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Phone number is already registered.")
        return phone

    def validate(self, attrs):
        attrs["username"] = unique_username_from_email(attrs["email"])
        return attrs


class CourierUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    photoUrl = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    vehicle = serializers.CharField(max_length=100, required=False, allow_blank=True)
    plateNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    zone = serializers.CharField(max_length=100, required=False, allow_blank=True)
    maxActiveOrders = serializers.IntegerField(required=False, min_value=1)
    status = serializers.ChoiceField(
        choices=CourierProfile.Status.choices,
        required=False,
    )
    isActive = serializers.BooleanField(required=False)


class CourierPasswordSerializer(PasswordValidationMixin, serializers.Serializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    passwordConfirm = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        required=False,
        allow_blank=True,
    )

    def validate(self, attrs):
        confirm = attrs.get("passwordConfirm")
        if confirm and attrs["password"] != confirm:
            raise serializers.ValidationError(
                {"passwordConfirm": "Passwords do not match."}
            )
        return attrs


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
