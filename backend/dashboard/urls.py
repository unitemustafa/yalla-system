from django.urls import path

from .views import (
    DashboardItemDetailView,
    DashboardItemDuplicateView,
    DashboardItemListCreateView,
    DashboardOrderDetailView,
    DashboardOrderListCreateView,
    DashboardStatsView,
    DashboardCityDetailView,
    DashboardCityListCreateView,
    DashboardMarketDetailView,
    DashboardMarketListCreateView,
    DashboardMarketClassificationListView,
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
    path("cities", DashboardCityListCreateView.as_view(), name="dashboard-cities"),
    path(
        "cities/<slug:city_id>",
        DashboardCityDetailView.as_view(),
        name="dashboard-city-detail",
    ),
    path(
        "markets",
        DashboardMarketListCreateView.as_view(),
        name="dashboard-markets",
    ),
    path(
        "markets/<int:market_id>",
        DashboardMarketDetailView.as_view(),
        name="dashboard-market-detail",
    ),
    path(
        "market-classifications",
        DashboardMarketClassificationListView.as_view(),
        name="dashboard-market-classifications",
    ),
]
