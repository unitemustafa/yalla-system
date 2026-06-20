from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.views import TokenRefreshView

from .models import OneTimePassword
from .serializers import (
    ChangePasswordSerializer,
    CourierCreateSerializer,
    CourierSerializer,
    EmailOTPSerializer,
    EmailTokenRefreshSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    SignupSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
    normalize_phone,
    user_by_phone,
)
from .services import issue_otp, otp_response_data, verify_otp

User = get_user_model()


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
    refresh_class = (
        SessionRefreshToken if remember_me is False else RefreshToken
    )
    refresh = refresh_class.for_user(user)
    access = str(refresh.access_token)
    refresh_value = str(refresh)
    access_lifetime = settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]
    payload = {
        "accessToken": access,
        "refreshToken": refresh_value,
        "expiresIn": int(access_lifetime.total_seconds()),
        "user": UserSerializer(user).data,
    }
    if remember_me is not None:
        payload["rememberMe"] = remember_me
    return payload


class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @transaction.atomic
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User.objects.filter(email__iexact=data["email"]).first()

        if user is None:
            user = User(
                email=data["email"],
                username=data["username"],
            )

        user.username = data["username"]
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.phone = data["phone"]
        user.terms_accepted = True
        user.terms_accepted_at = timezone.now()
        user.is_active = False
        user.set_password(data["password"])
        user.save()

        _, code = issue_otp(user, OneTimePassword.Purpose.REGISTRATION)
        return Response(
            {
                "detail": "Registration OTP sent.",
                "email": user.email,
                **otp_response_data(code),
            },
            status=status.HTTP_201_CREATED,
        )


class SignupView(RegisterView):
    serializer_class = SignupSerializer


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

        _, code = issue_otp(user, OneTimePassword.Purpose.REGISTRATION)
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


class CourierLoginView(LoginView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if user.role != User.Role.REPRESENTATIVE:
            return Response(
                {"detail": "This account is not a courier account."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(
            token_payload(
                user,
                remember_me=serializer.validated_data["rememberMe"],
            )
        )


class CourierListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        couriers = (
            User.objects.filter(
                role=User.Role.REPRESENTATIVE,
                courier_profile__isnull=False,
            )
            .select_related("courier_profile")
            .order_by("-created_at")
        )
        return Response({"couriers": CourierSerializer(couriers, many=True).data})

    def post(self, request):
        serializer = CourierCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        courier = serializer.save()
        return Response(
            {"courier": CourierSerializer(courier).data},
            status=status.HTTP_201_CREATED,
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


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": UserSerializer(request.user).data})

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"user": UserSerializer(user).data})

    def delete(self, request):
        password = request.data.get("password", "")
        if not password or not request.user.check_password(password):
            return Response(
                {"password": ["Invalid password."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.is_active = False
        request.user.save(update_fields=["is_active"])
        blacklist_user_tokens(request.user)
        return Response({"detail": "Account closed successfully."})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request, "user": request.user},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        blacklist_user_tokens(request.user)
        return Response({"detail": "Password changed successfully."})


class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = str(request.query_params.get("email", "")).strip()
        registered = bool(email) and User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).exists()
        return Response({"registered": registered, "available": not registered})


class CheckPhoneView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        phone = normalize_phone(request.query_params.get("phone", ""))
        registered = bool(phone) and user_by_phone(
            phone,
            User.objects.filter(is_active=True),
        ) is not None
        return Response({"registered": registered, "available": not registered})


class CheckUsernameView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        username = str(request.query_params.get("username", "")).strip()
        available = not bool(username) or not User.objects.filter(
            username__iexact=username,
            is_active=True,
        ).exists()
        return Response({"available": available, "registered": not available})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"],
            is_active=True,
        ).first()

        response_data = {
            "detail": "If an active account exists, a password reset OTP has been sent."
        }
        if user is None:
            return Response(
                {"email": ["No account found with this email."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, code = issue_otp(user, OneTimePassword.Purpose.PASSWORD_RESET)
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
