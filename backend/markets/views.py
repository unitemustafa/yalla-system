from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product, ProductVariant
from offers.models import Offer

from .models import MarketClassification
from .serializers import (
    HomeMarketClassificationSerializer,
    HomeOfferSerializer,
    HomeProductSerializer,
)


class HomeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        city = request.user.current_city
        if city is None or not city.is_active:
            return Response(
                {
                    "code": "location_required",
                    "detail": "Select a supported city before loading the home page.",
                },
                status=428,
            )

        market_ids = list(
            city.markets.filter(status="active").values_list("id", flat=True)
        )
        now = timezone.now()

        products = (
            Product.objects.filter(market_id__in=market_ids)
            .select_related("category", "market")
            .prefetch_related(
                Prefetch(
                    "variants",
                    queryset=ProductVariant.objects.order_by("price", "id"),
                )
            )
            .order_by("-created_at", "-id")[:8]
        )
        offers = (
            Offer.objects.filter(
                market_id__in=market_ids,
                status=Offer.Status.ACTIVE,
                start_time__lte=now,
                end_time__gte=now,
            )
            .select_related("market")
            .prefetch_related(
                Prefetch(
                    "products",
                    queryset=Product.objects.filter(
                        market_id__in=market_ids,
                    )
                    .select_related("category", "market")
                    .prefetch_related(
                        Prefetch(
                            "variants",
                            queryset=ProductVariant.objects.order_by("price", "id"),
                        )
                    ),
                )
            )
            .order_by("-created_at", "-id")[:4]
        )
        classifications = (
            MarketClassification.objects.filter(
                markets__id__in=market_ids,
            )
            .distinct()
            .order_by("name")
        )

        return Response(
            {
                "location": {
                    "city_id": city.slug,
                    "slug": city.slug,
                    "name": city.name,
                    "name_ar": city.name_ar,
                },
                "offers": HomeOfferSerializer(
                    offers,
                    many=True,
                    context={"request": request},
                ).data,
                "market_classifications": HomeMarketClassificationSerializer(
                    classifications,
                    many=True,
                    context={"eligible_market_ids": market_ids},
                ).data,
                "products": HomeProductSerializer(
                    products,
                    many=True,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_200_OK,
        )
