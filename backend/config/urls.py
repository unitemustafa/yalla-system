from django.urls import path, include

urlpatterns = [
    path("api/auth/", include("accounts.urls")),
    path("api/v1/auth/", include("accounts.v1_auth_urls")),
    path("api/v1/dashboard/", include("accounts.dashboard_urls")),
    path("api/v1/courier/", include("accounts.courier_urls")),
    path("api/home/", include("markets.urls")),
]
