from django.urls import path

from .views import (
    DashboardCourierDetailView,
    DashboardCourierListCreateView,
    DashboardCourierPasswordView,
    DashboardLoginView,
    DashboardMeView,
)

urlpatterns = [
    path("auth/login", DashboardLoginView.as_view(), name="dashboard-auth-login"),
    path("auth/me", DashboardMeView.as_view(), name="dashboard-auth-me"),
    path("couriers", DashboardCourierListCreateView.as_view(), name="dashboard-couriers"),
    path(
        "couriers/<int:user_id>",
        DashboardCourierDetailView.as_view(),
        name="dashboard-courier-detail",
    ),
    path(
        "couriers/<int:user_id>/password",
        DashboardCourierPasswordView.as_view(),
        name="dashboard-courier-password",
    ),
]
