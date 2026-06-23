import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .services import normalize_email

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


def available_username(email, *, fallback="user", reusable_email=None):
    normalized_email = normalize_email(str(email))
    local_part = normalized_email.split("@", 1)[0]
    base = re.sub(r"[^A-Za-z0-9_.+-]+", "_", local_part).strip("._+-")
    base = (base or fallback)[:140]
    candidate = base
    suffix = 1

    while True:
        matching_users = User.objects.filter(username__iexact=candidate)
        if reusable_email:
            matching_users = matching_users.exclude(email__iexact=reusable_email)
        if not matching_users.exists():
            return candidate

        suffix_text = f"_{suffix}"
        candidate = f"{base[:150 - len(suffix_text)]}{suffix_text}"
        suffix += 1


def validate_password_strength(value, *, user=None):
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
        validate_password(value, user=user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(list(exc.messages)) from exc
    return value


class CamelCaseInputMixin:
    input_aliases = {
        "firstName": "first_name",
        "lastName": "last_name",
        "passwordConfirm": "password_confirm",
        "termsAccepted": "terms_accepted",
    }

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
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


class PasswordValidationMixin:
    def validate_password(self, value):
        return self._validate_password_strength(value)

    def _validate_password_strength(self, value):
        return validate_password_strength(value, user=self.context.get("user"))


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
