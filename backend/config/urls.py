from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/", include("locations.urls")),
    path("api/v1/dashboard/", include("dashboard.urls")),
    path("api/v1/home/", include("markets.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/home/", include("markets.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
