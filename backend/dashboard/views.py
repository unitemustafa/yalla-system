from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product, ProductVariant
from orders.models import Order

from .serializers import (
    DashboardItemWriteSerializer,
    DashboardOrderWriteSerializer,
    order_id_from_number,
    order_to_dashboard,
    product_to_dashboard,
    unique_sku,
)


class DashboardItemListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        products = (
            Product.objects.select_related(
                "category__classification",
                "market__classification",
            )
            .prefetch_related("variants", "market__delivery_areas")
            .order_by("-created_at", "-id")
        )
        return Response(
            {
                "items": [
                    product_to_dashboard(product, position)
                    for position, product in enumerate(products, start=1)
                ]
            }
        )

    def post(self, request):
        serializer = DashboardItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        product = Product.objects.select_related(
            "category__classification", "market__classification"
        ).prefetch_related("variants", "market__delivery_areas").get(pk=product.pk)
        return Response(
            {"item": product_to_dashboard(product, Product.objects.count())},
            status=status.HTTP_201_CREATED,
        )


class DashboardItemDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, item_id):
        return (
            Product.objects.select_related(
                "category__classification", "market__classification"
            )
            .prefetch_related("variants", "market__delivery_areas")
            .filter(pk=item_id)
            .first()
        )

    def patch(self, request, item_id):
        product = self.get_object(item_id)
        if not product:
            return Response({"message": "Item not found"}, status=404)
        serializer = DashboardItemWriteSerializer(
            product,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        product = self.get_object(product.pk)
        return Response({"item": product_to_dashboard(product, 1)})

    def delete(self, request, item_id):
        product = self.get_object(item_id)
        if not product:
            return Response({"message": "Item not found"}, status=404)
        try:
            product.delete()
        except ProtectedError:
            return Response(
                {"message": "This item is used by an order and cannot be deleted."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response({"ok": True})


class DashboardItemDuplicateView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def post(self, request, item_id):
        product = (
            Product.objects.prefetch_related("variants")
            .filter(pk=item_id)
            .first()
        )
        if not product:
            return Response({"message": "Item not found"}, status=404)

        variants = list(product.variants.all())
        product.pk = None
        product.name = f"{product.name} نسخة"
        product.created_at = timezone.now()
        product.updated_at = timezone.now()
        product.save()
        for variant in variants:
            ProductVariant.objects.create(
                product=product,
                price=variant.price,
                sku=unique_sku(),
            )

        product = Product.objects.select_related(
            "category__classification", "market__classification"
        ).prefetch_related("variants", "market__delivery_areas").get(pk=product.pk)
        return Response(
            {"item": product_to_dashboard(product, Product.objects.count())},
            status=status.HTTP_201_CREATED,
        )


class DashboardOrderListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = (
            Order.objects.select_related("user", "market")
            .order_by("-created_at", "-id")
        )
        return Response(
            {
                "orders": [
                    order_to_dashboard(order, position)
                    for position, order in enumerate(orders, start=1)
                ]
            }
        )

    def post(self, request):
        serializer = DashboardOrderWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {"order": order_to_dashboard(order, Order.objects.count())},
            status=status.HTTP_201_CREATED,
        )


class DashboardOrderDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, order_number):
        order_id = order_id_from_number(order_number)
        if order_id is None:
            return None
        return (
            Order.objects.select_related("user", "market")
            .filter(pk=order_id)
            .first()
        )

    def patch(self, request, order_number):
        order = self.get_object(order_number)
        if not order:
            return Response({"message": "Order not found"}, status=404)
        serializer = DashboardOrderWriteSerializer(
            order,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response({"order": order_to_dashboard(order, 1)})

    def delete(self, request, order_number):
        order = self.get_object(order_number)
        if not order:
            return Response({"message": "Order not found"}, status=404)
        order.delete()
        return Response({"ok": True})


class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        orders = Order.objects.all()
        total = orders.count()
        completed = orders.filter(status=Order.Status.DELIVERED).count()
        return Response(
            {
                "todayOrders": orders.filter(created_at__date=today).count(),
                "completedPercent": (
                    round((completed / total) * 100) if total else 0
                ),
            }
        )

