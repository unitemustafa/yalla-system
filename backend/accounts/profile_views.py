from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .profile_serializers import (
    ChangePasswordSerializer,
    UserProfileUpdateSerializer,
)
from .serializer_utils import UserSerializer, normalize_phone, user_by_phone
from .view_utils import blacklist_user_tokens

User = get_user_model()


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
        return Response({"user": UserSerializer(serializer.save()).data})

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
        registered = (
            bool(phone)
            and user_by_phone(phone, User.objects.filter(is_active=True)) is not None
        )
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
