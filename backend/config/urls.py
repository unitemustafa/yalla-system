from django.urls import path, include

urlpatterns = [
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/dashboard/", include("dashboard.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/home/", include("markets.urls")),
]