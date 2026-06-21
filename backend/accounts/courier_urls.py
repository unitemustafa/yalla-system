from django.urls import path

from .views import CourierLoginView, CourierMeView

urlpatterns = [
    path("auth/login", CourierLoginView.as_view(), name="courier-auth-login"),
    path("auth/me", CourierMeView.as_view(), name="courier-auth-me"),
]
