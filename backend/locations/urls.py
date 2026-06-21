from django.urls import path

from .views import (
    AddressDefaultView,
    AddressDetailView,
    AddressListCreateView,
    CityListView,
    DefaultAddressView,
    LocationResolveView,
    LocationSelectView,
)

urlpatterns = [
    path("cities", CityListView.as_view(), name="cities"),
    path("location/resolve", LocationResolveView.as_view(), name="location-resolve"),
    path("location/select", LocationSelectView.as_view(), name="location-select"),
    path("addresses", AddressListCreateView.as_view(), name="addresses"),
    path("addresses/default", DefaultAddressView.as_view(), name="default-address"),
    path(
        "addresses/<int:address_id>",
        AddressDetailView.as_view(),
        name="address-detail",
    ),
    path(
        "addresses/<int:address_id>/default",
        AddressDefaultView.as_view(),
        name="address-default",
    ),
]
