from django.urls import path

from .views import (
    DashboardItemDetailView,
    DashboardItemDuplicateView,
    DashboardItemListCreateView,
    DashboardOrderDetailView,
    DashboardOrderListCreateView,
    DashboardStatsView,
)

urlpatterns = [
    path("items", DashboardItemListCreateView.as_view(), name="dashboard-items"),
    path(
        "items/<int:item_id>",
        DashboardItemDetailView.as_view(),
        name="dashboard-item-detail",
    ),
    path(
        "items/<int:item_id>/duplicate",
        DashboardItemDuplicateView.as_view(),
        name="dashboard-item-duplicate",
    ),
    path("orders", DashboardOrderListCreateView.as_view(), name="dashboard-orders"),
    path(
        "orders/<str:order_number>",
        DashboardOrderDetailView.as_view(),
        name="dashboard-order-detail",
    ),
    path("stats", DashboardStatsView.as_view(), name="dashboard-stats"),
]

