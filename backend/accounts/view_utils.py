from django.conf import settings
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken

from .serializer_utils import UserSerializer


class SessionRefreshToken(RefreshToken):
    lifetime = settings.AUTH_SESSION_REFRESH_TOKEN_LIFETIME


def blacklist_user_tokens(user):
    BlacklistedToken.objects.bulk_create(
        [
            BlacklistedToken(token=token)
            for token in OutstandingToken.objects.filter(user=user)
        ],
        ignore_conflicts=True,
    )


def token_payload(user, remember_me=None):
    refresh_class = SessionRefreshToken if remember_me is False else RefreshToken
    refresh = refresh_class.for_user(user)
    payload = {
        "accessToken": str(refresh.access_token),
        "refreshToken": str(refresh),
        "expiresIn": int(
            settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
        ),
        "user": UserSerializer(user).data,
    }
    if remember_me is not None:
        payload["rememberMe"] = remember_me
    return payload
