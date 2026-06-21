from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_serializers import (
    EmailOTPSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    ResetPasswordSerializer,
    SignupSerializer,
)
from .models import OneTimePassword
from .services import (
    OTPRateLimitError,
    issue_otp,
    otp_response_data,
    request_ip,
    verify_otp,
)
from .token_serializers import EmailTokenRefreshSerializer, LogoutSerializer
from .view_utils import blacklist_user_tokens, token_payload

User = get_user_model()


def rate_limit_response(error):
    return Response(
        {
            "code": "otp_rate_limited",
            "detail": error.message,
            "retry_after": error.retry_after,
        },
        status=status.HTTP_429_TOO_MANY_REQUESTS,
        headers={"Retry-After": str(error.retry_after)},
    )


def issue_otp_for_request(request, user, purpose):
    try:
        return issue_otp(user, purpose, request_ip(request))
    except OTPRateLimitError as error:
        return rate_limit_response(error)


class SignupView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User.objects.filter(email__iexact=data["email"]).first()
        if user is None:
            user = User(email=data["email"], username=data["username"])

        user.username = data["username"]
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.phone = data["phone"]
        user.terms_accepted = True
        user.terms_accepted_at = timezone.now()
        user.is_active = False
        user.set_password(data["password"])
        user.save()

        issued = issue_otp_for_request(
            request, user, OneTimePassword.Purpose.REGISTRATION
        )
        if isinstance(issued, Response):
            return issued
        _, code = issued
        return Response(
            {
                "detail": "Registration OTP sent.",
                "email": user.email,
                **otp_response_data(code),
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyRegistrationOTPView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = EmailOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"],
            is_active=False,
        ).first()
        if user is None:
            return Response(
                {"otp": ["Invalid verification code."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, error = verify_otp(
            user,
            OneTimePassword.Purpose.REGISTRATION,
            serializer.validated_data["otp"],
        )
        if error:
            return Response(
                {"otp": [error]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response(token_payload(user), status=status.HTTP_200_OK)


class ResendRegistrationOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"],
            is_active=False,
        ).first()
        if user is None:
            return Response(
                {"detail": "If registration is pending, a new OTP has been sent."}
            )

        issued = issue_otp_for_request(
            request, user, OneTimePassword.Purpose.REGISTRATION
        )
        if isinstance(issued, Response):
            return issued
        _, code = issued
        return Response(
            {
                "detail": "A new registration OTP has been sent.",
                **otp_response_data(code),
            }
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            token_payload(
                serializer.validated_data["user"],
                remember_me=serializer.validated_data["rememberMe"],
            )
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh") or request.data.get("refreshToken")
        if refresh:
            serializer = LogoutSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            blacklist_user_tokens(request.user)
        return Response(
            {"detail": "Logout successful."},
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"],
            is_active=True,
        ).first()
        if user is None:
            return Response(
                {"email": ["No account found with this email."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        issued = issue_otp_for_request(
            request, user, OneTimePassword.Purpose.PASSWORD_RESET
        )
        if isinstance(issued, Response):
            return issued
        _, code = issued
        response_data = {
            "detail": "If an active account exists, a password reset OTP has been sent."
        }
        response_data.update(otp_response_data(code))
        return Response(response_data)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        blacklist_user_tokens(user)
        return Response({"detail": "Password reset successfully."})


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenRefreshSerializer


class OTPRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purpose = serializer.validated_data["purpose"]
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"],
            is_active=(purpose == OneTimePassword.Purpose.PASSWORD_RESET),
        ).first()
        response_data = {
            "detail": "If the account is eligible, a verification code was sent."
        }
        if user is None:
            return Response(response_data)
        issued = issue_otp_for_request(request, user, purpose)
        if isinstance(issued, Response):
            return issued
        _, code = issued
        response_data.update(otp_response_data(code))
        return Response(response_data)


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        purpose = data["purpose"]
        user = User.objects.filter(
            email__iexact=data["email"],
            is_active=(purpose == OneTimePassword.Purpose.PASSWORD_RESET),
        ).first()
        if user is None:
            return Response(
                {"otp": ["Invalid verification code."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        _, error = verify_otp(user, purpose, data["otp"])
        if error:
            return Response(
                {"otp": [error]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if purpose == OneTimePassword.Purpose.REGISTRATION:
            user.is_active = True
            user.save(update_fields=["is_active"])
            return Response(token_payload(user))
        user.set_password(data["password"])
        user.save(update_fields=["password"])
        blacklist_user_tokens(user)
        return Response({"detail": "Password reset successfully."})
