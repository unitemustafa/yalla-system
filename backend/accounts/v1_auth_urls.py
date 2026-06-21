from django.urls import path

from .views import (
    CustomerLoginView,
    CustomerMeView,
    CustomerResendVerificationView,
    CustomerSignupView,
    CustomerVerifyEmailView,
    EmailAvailabilityView,
    PhoneAvailabilityView,
    UsernameAvailabilityView,
    V1LogoutView,
    V1RefreshTokenView,
)

urlpatterns = [
    path("signup", CustomerSignupView.as_view(), name="v1-auth-signup"),
    path("verify-email", CustomerVerifyEmailView.as_view(), name="v1-auth-verify-email"),
    path(
        "resend-verification",
        CustomerResendVerificationView.as_view(),
        name="v1-auth-resend-verification",
    ),
    path("login", CustomerLoginView.as_view(), name="v1-auth-login"),
    path("refresh", V1RefreshTokenView.as_view(), name="v1-auth-refresh"),
    path("logout", V1LogoutView.as_view(), name="v1-auth-logout"),
    path("me", CustomerMeView.as_view(), name="v1-auth-me"),
    path(
        "check-username",
        UsernameAvailabilityView.as_view(),
        name="v1-auth-check-username",
    ),
    path("check-email", EmailAvailabilityView.as_view(), name="v1-auth-check-email"),
    path("check-phone", PhoneAvailabilityView.as_view(), name="v1-auth-check-phone"),
]
