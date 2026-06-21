from datetime import datetime, timezone as datetime_timezone

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.views import TokenRefreshView

from .models import CourierProfile, OneTimePassword
from .serializers import (
    ApiUserSerializer,
    CourierCreateSerializer,
    CourierLoginSerializer,
    CourierPasswordSerializer,
    CourierProfileSerializer,
    CourierUpdateSerializer,
    CustomerSignupSerializer,
    DashboardLoginSerializer,
    DeleteAccountSerializer,
    EmailCodeSerializer,
    EmailOTPSerializer,
    EmailTokenRefreshSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    MeUpdateSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    split_full_name,
)
from .services import issue_otp, otp_response_data, verify_otp

User = get_user_model()


def token_payload(user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_value = str(refresh)
    return {
        "accessToken": access,
        "refreshToken": refresh_value,
        "user": UserSerializer(user).data,
    }


def access_token_expires_at(access_token):
    exp = AccessToken(access_token)["exp"]
    return (
        datetime.fromtimestamp(exp, tz=datetime_timezone.utc)
        .isoformat()
        .replace("+00:00", "Z")
    )


def token_payload_v1(user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    return {
        "user": ApiUserSerializer(user).data,
        "accessToken": access,
        "refreshToken": str(refresh),
        "expiresAt": access_token_expires_at(access),
    }


def blacklist_user_tokens(user):
    BlacklistedToken.objects.bulk_create(
        [
            BlacklistedToken(token=token)
            for token in OutstandingToken.objects.filter(user=user)
        ],
        ignore_conflicts=True,
    )


def is_admin(user):
    return user.is_authenticated and user.role == User.Role.ADMIN


def is_representative(user):
    return user.is_authenticated and user.role == User.Role.REPRESENTATIVE


def forbidden_response():
    return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
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
        return Response(token_payload(serializer.validated_data["user"]))


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
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

        response_data = {
            "detail": "If an active account exists, a password reset OTP has been sent."
        }
        if user is not None:
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
        BlacklistedToken.objects.bulk_create(
            [
                BlacklistedToken(token=token)
                for token in OutstandingToken.objects.filter(user=user)
            ],
            ignore_conflicts=True,
        )
        return Response({"detail": "Password reset successfully."})


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenRefreshSerializer


class CustomerSignupView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = CustomerSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User.objects.filter(email__iexact=data["email"]).first()
        if user is None:
            user = User(email=data["email"])

        user.username = data["username"]
        user.first_name = data["firstName"]
        user.last_name = data["lastName"]
        user.phone = data["phone"]
        user.role = User.Role.CLIENT
        user.terms_accepted = True
        user.terms_accepted_at = timezone.now()
        user.is_active = False
        user.set_password(data["password"])
        user.save()

        _, code = issue_otp(user, OneTimePassword.Purpose.REGISTRATION)
        return Response(
            {
                "email": user.email,
                "message": "Verification email sent.",
                **otp_response_data(code),
            },
            status=status.HTTP_201_CREATED,
        )


class CustomerVerifyEmailView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = EmailCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"],
            role=User.Role.CLIENT,
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
            serializer.validated_data["code"],
        )
        if error:
            return Response(
                {"otp": [error]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response(token_payload_v1(user), status=status.HTTP_200_OK)


class CustomerResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"],
            role=User.Role.CLIENT,
            is_active=False,
        ).first()
        if user is None:
            return Response(
                {"message": "If registration is pending, a new OTP has been sent."}
            )

        _, code = issue_otp(user, OneTimePassword.Purpose.REGISTRATION)
        return Response(
            {
                "message": "A new verification code has been sent.",
                **otp_response_data(code),
            }
        )


class CustomerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if user.role != User.Role.CLIENT:
            return Response(
                {"detail": "This account cannot access this app."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(token_payload_v1(user))


class V1RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailTokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return Response(
            {
                **data,
                "expiresAt": access_token_expires_at(data["accessToken"]),
            }
        )


class V1LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
        return Response(True, status=status.HTTP_200_OK)


class CustomerMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.CLIENT:
            return forbidden_response()
        return Response(ApiUserSerializer(request.user).data)

    def patch(self, request):
        if request.user.role != User.Role.CLIENT:
            return forbidden_response()
        serializer = MeUpdateSerializer(
            data=request.data,
            partial=True,
            context={"user": request.user},
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = request.user
        if "firstName" in data:
            user.first_name = data["firstName"]
        if "lastName" in data:
            user.last_name = data["lastName"]
        if "username" in data and data["username"]:
            user.username = data["username"]
        if "email" in data:
            user.email = data["email"]
        if "phone" in data and data["phone"]:
            user.phone = data["phone"]
        user.save()
        return Response(ApiUserSerializer(user).data)

    @transaction.atomic
    def delete(self, request):
        if request.user.role != User.Role.CLIENT:
            return forbidden_response()
        serializer = DeleteAccountSerializer(
            data=request.data,
            context={"user": request.user},
        )
        serializer.is_valid(raise_exception=True)
        user = request.user
        blacklist_user_tokens(user)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(True, status=status.HTTP_200_OK)


class UsernameAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        username = request.query_params.get("username", "").strip()
        available = bool(username) and not User.objects.filter(
            username__iexact=username,
        ).exists()
        return Response({"available": available})


class EmailAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get("email", "").strip()
        registered = bool(email) and User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).exists()
        return Response({"registered": registered, "exists": registered})


class PhoneAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        phone = request.query_params.get("phone", "").strip()
        registered = bool(phone) and User.objects.filter(phone=phone).exists()
        return Response({"registered": registered, "exists": registered})


class DashboardLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DashboardLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(token_payload_v1(serializer.validated_data["user"]))


class DashboardMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return forbidden_response()
        return Response(ApiUserSerializer(request.user).data)


class DashboardCourierListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return forbidden_response()
        profiles = (
            User.objects.filter(role=User.Role.REPRESENTATIVE)
            .select_related("courier_profile")
            .order_by("-created_at")
        )
        courier_profiles = [
            getattr(user, "courier_profile", None) for user in profiles
        ]
        courier_profiles = [profile for profile in courier_profiles if profile]
        return Response(CourierProfileSerializer(courier_profiles, many=True).data)

    @transaction.atomic
    def post(self, request):
        if not is_admin(request.user):
            return forbidden_response()
        serializer = CourierCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        first_name, last_name = split_full_name(data["name"])
        user = User(
            email=data["email"],
            username=data["username"],
            first_name=first_name,
            last_name=last_name,
            phone=data["phone"],
            role=User.Role.REPRESENTATIVE,
            is_active=True,
        )
        user.set_password(data["password"])
        user.save()
        profile = CourierProfile.objects.create(
            user=user,
            photo_url=data.get("photoUrl", ""),
            vehicle=data.get("vehicle", ""),
            plate_number=data.get("plateNumber", ""),
            zone=data.get("zone", ""),
            max_active_orders=data.get("maxActiveOrders", 3),
            created_by=request.user,
        )
        return Response(
            CourierProfileSerializer(profile).data,
            status=status.HTTP_201_CREATED,
        )


class DashboardCourierDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_profile(self, user_id):
        return (
            User.objects.filter(pk=user_id, role=User.Role.REPRESENTATIVE)
            .select_related("courier_profile")
            .first()
        )

    def get(self, request, user_id):
        if not is_admin(request.user):
            return forbidden_response()
        user = self.get_profile(user_id)
        if user is None or not hasattr(user, "courier_profile"):
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(CourierProfileSerializer(user.courier_profile).data)

    @transaction.atomic
    def patch(self, request, user_id):
        if not is_admin(request.user):
            return forbidden_response()
        user = self.get_profile(user_id)
        if user is None or not hasattr(user, "courier_profile"):
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CourierUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if "name" in data:
            user.first_name, user.last_name = split_full_name(data["name"])
        if "email" in data:
            exists = User.objects.filter(email__iexact=data["email"]).exclude(pk=user.pk).exists()
            if exists:
                return Response(
                    {"email": ["Email is already registered."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.email = data["email"]
        if "phone" in data:
            exists = User.objects.filter(phone=data["phone"]).exclude(pk=user.pk).exists()
            if exists:
                return Response(
                    {"phone": ["Phone number is already registered."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.phone = data["phone"]
        if "isActive" in data:
            user.is_active = data["isActive"]
        user.save()

        profile = user.courier_profile
        if "photoUrl" in data:
            profile.photo_url = data["photoUrl"] or ""
        if "vehicle" in data:
            profile.vehicle = data["vehicle"]
        if "plateNumber" in data:
            profile.plate_number = data["plateNumber"]
        if "zone" in data:
            profile.zone = data["zone"]
        if "maxActiveOrders" in data:
            profile.max_active_orders = data["maxActiveOrders"]
        if "status" in data:
            profile.status = data["status"]
        profile.save()
        return Response(CourierProfileSerializer(profile).data)

    @transaction.atomic
    def delete(self, request, user_id):
        if not is_admin(request.user):
            return forbidden_response()
        user = self.get_profile(user_id)
        if user is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        blacklist_user_tokens(user)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(True, status=status.HTTP_200_OK)


class DashboardCourierPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, user_id):
        if not is_admin(request.user):
            return forbidden_response()
        user = User.objects.filter(
            pk=user_id,
            role=User.Role.REPRESENTATIVE,
        ).first()
        if user is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CourierPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        blacklist_user_tokens(user)
        return Response(True, status=status.HTTP_200_OK)


class CourierLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CourierLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        profile, _ = CourierProfile.objects.get_or_create(user=user)
        return Response(
            {
                **token_payload_v1(user),
                "courier": CourierProfileSerializer(profile).data,
            }
        )


class CourierMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_representative(request.user):
            return forbidden_response()
        profile, _ = CourierProfile.objects.get_or_create(user=request.user)
        return Response(
            {
                "user": ApiUserSerializer(request.user).data,
                "courier": CourierProfileSerializer(profile).data,
            }
        )
