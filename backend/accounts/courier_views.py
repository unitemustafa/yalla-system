from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth_serializers import LoginSerializer
from .auth_views import LoginView
from .courier_serializers import CourierCreateSerializer, CourierSerializer
from .view_utils import token_payload

User = get_user_model()


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
