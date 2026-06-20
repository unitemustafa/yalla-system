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
    RegisterView,
    ResendRegistrationOTPView,
    ResetPasswordView,
    SignupView,
    VerifyRegistrationOTPView,
)


def auth_path(route, view, name):
    return [
        path(route, view, name=name),
        path(f"{route}/", view, name=f"{name}-slash"),
    ]


urlpatterns = []

urlpatterns += auth_path("register", RegisterView.as_view(), "register")
urlpatterns += auth_path("signup", SignupView.as_view(), "signup")
urlpatterns += auth_path(
    "register/verify-otp",
    VerifyRegistrationOTPView.as_view(),
    "register-verify-otp",
)
urlpatterns += auth_path(
    "verify-email",
    VerifyRegistrationOTPView.as_view(),
    "verify-email",
)
urlpatterns += auth_path(
    "register/resend-otp",
    ResendRegistrationOTPView.as_view(),
    "register-resend-otp",
)
urlpatterns += auth_path(
    "resend-verification",
    ResendRegistrationOTPView.as_view(),
    "resend-verification",
)
urlpatterns += auth_path("login", LoginView.as_view(), "login")
urlpatterns += auth_path(
    "courier-login",
    CourierLoginView.as_view(),
    "courier-login",
)
urlpatterns += auth_path("couriers", CourierListCreateView.as_view(), "couriers")
urlpatterns += auth_path("refresh", RefreshTokenView.as_view(), "token-refresh")
urlpatterns += auth_path("logout", LogoutView.as_view(), "logout")
urlpatterns += auth_path("me", CurrentUserView.as_view(), "current-user")
urlpatterns += auth_path(
    "change-password",
    ChangePasswordView.as_view(),
    "change-password",
)
urlpatterns += auth_path("check-email", CheckEmailView.as_view(), "check-email")
urlpatterns += auth_path("check-phone", CheckPhoneView.as_view(), "check-phone")
urlpatterns += auth_path(
    "check-username",
    CheckUsernameView.as_view(),
    "check-username",
)
urlpatterns += auth_path(
    "forgot-password",
    ForgotPasswordView.as_view(),
    "forgot-password",
)
urlpatterns += auth_path(
    "reset-password",
    ResetPasswordView.as_view(),
    "reset-password",
)
