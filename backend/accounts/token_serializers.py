from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .serializer_utils import RequiredFieldMessagesMixin


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
