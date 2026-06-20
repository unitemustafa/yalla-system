from django.urls import path

from .views import (
    ChangePasswordView,
    CheckEmailView,
    CheckPhoneView,
    CheckUsernameView,
    CurrentUserView,
    CourierListCreateView,
    CourierLoginView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    ResendRegistrationOTPView,
    ResetPasswordView,
    SignupView,
    VerifyRegistrationOTPView,
)

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path(
        "verify-email",
        VerifyRegistrationOTPView.as_view(),
        name="verify-email",
    ),
    path(
        "resend-verification",
        ResendRegistrationOTPView.as_view(),
        name="resend-verification",
    ),
    path("login", LoginView.as_view(), name="login"),
    path("courier-login", CourierLoginView.as_view(), name="courier-login"),
    path("couriers", CourierListCreateView.as_view(), name="couriers"),
    path("refresh", RefreshTokenView.as_view(), name="token-refresh"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("me", CurrentUserView.as_view(), name="current-user"),
    path(
        "change-password",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path("check-email", CheckEmailView.as_view(), name="check-email"),
    path("check-phone", CheckPhoneView.as_view(), name="check-phone"),
    path("check-username", CheckUsernameView.as_view(), name="check-username"),
    path("forgot-password", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password", ResetPasswordView.as_view(), name="reset-password"),
]
