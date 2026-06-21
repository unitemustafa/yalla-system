from django.db import transaction
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, City
from .serializers import (
    AddressSerializer,
    CitySelectionSerializer,
    CitySerializer,
    CoordinatesSerializer,
    UnsupportedCoordinates,
)
from .services import resolve_city


class CityListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CitySerializer

    def get_queryset(self):
        return City.objects.filter(is_active=True)


class LocationResolveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CoordinatesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        city = resolve_city(
            serializer.validated_data["latitude"],
            serializer.validated_data["longitude"],
        )
        if city is None:
            raise UnsupportedCoordinates(
                {
                    "code": "unsupported_location",
                    "detail": "These coordinates are outside supported cities.",
                }
            )
        previous_city_id = request.user.current_city_id
        request.user.current_city = city
        request.user.save(update_fields=["current_city", "updated_at"])
        return Response(
            {
                "city": CitySerializer(city).data,
                "city_changed": (
                    previous_city_id is not None and previous_city_id != city.pk
                ),
                "source": "gps",
            }
        )


class LocationSelectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CitySelectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        city = serializer.validated_data["city_id"]
        previous_city_id = request.user.current_city_id
        request.user.current_city = city
        request.user.save(update_fields=["current_city", "updated_at"])
        return Response(
            {
                "city": CitySerializer(city).data,
                "city_changed": (
                    previous_city_id is not None and previous_city_id != city.pk
                ),
                "source": "manual",
            }
        )


def _address_payload(user):
    addresses = Address.objects.filter(user=user).select_related("city")
    return {"addresses": AddressSerializer(addresses, many=True).data}


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_address_payload(request.user))

    def post(self, request):
        serializer = AddressSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            _address_payload(request.user),
            status=status.HTTP_201_CREATED,
        )


class DefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        address = (
            Address.objects.filter(user=request.user, is_default=True)
            .select_related("city")
            .first()
        )
        if address is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(AddressSerializer(address).data)


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, address_id):
        return (
            Address.objects.filter(user=request.user, pk=address_id)
            .select_related("city")
            .first()
        )

    def patch(self, request, address_id):
        address = self.get_object(request, address_id)
        if address is None:
            return Response({"detail": "Address not found."}, status=404)
        serializer = AddressSerializer(
            address,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(_address_payload(request.user))

    @transaction.atomic
    def delete(self, request, address_id):
        addresses = Address.objects.select_for_update().filter(user=request.user)
        address = addresses.filter(pk=address_id).first()
        if address is None:
            return Response({"detail": "Address not found."}, status=404)
        was_default = address.is_default
        address.delete()
        if was_default:
            replacement = addresses.order_by("-updated_at", "-id").first()
            if replacement:
                replacement.is_default = True
                replacement.save(update_fields=["is_default", "updated_at"])
        return Response(_address_payload(request.user))


class AddressDefaultView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, address_id):
        addresses = Address.objects.select_for_update().filter(user=request.user)
        address = addresses.filter(pk=address_id).first()
        if address is None:
            return Response({"detail": "Address not found."}, status=404)
        addresses.filter(is_default=True).exclude(pk=address.pk).update(
            is_default=False
        )
        if not address.is_default:
            address.is_default = True
            address.save(update_fields=["is_default", "updated_at"])
        return Response(_address_payload(request.user))
