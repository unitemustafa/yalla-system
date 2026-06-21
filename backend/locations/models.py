from django.db import models
from django.db.models import Q


class City(models.Model):
    slug = models.SlugField(max_length=120, unique=True)
    name = models.CharField(max_length=150)
    name_ar = models.CharField(max_length=150, blank=True)
    center_latitude = models.DecimalField(max_digits=10, decimal_places=7)
    center_longitude = models.DecimalField(max_digits=10, decimal_places=7)
    radius_km = models.DecimalField(max_digits=7, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name", "id")
        verbose_name_plural = "cities"

    def __str__(self):
        return self.name


class DeliveryArea(models.Model):
    name = models.CharField(max_length=100)
    delivery_price = models.DecimalField(max_digits=10, decimal_places=2)

    center_latitude = models.DecimalField(max_digits=10, decimal_places=7)
    center_longitude = models.DecimalField(max_digits=10, decimal_places=7)
    radius_km = models.DecimalField(max_digits=6, decimal_places=2)

    is_active = models.BooleanField(default=True)


class Address(models.Model):
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    name = models.CharField(max_length=100)  # Home, Work
    full_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    line1 = models.CharField(max_length=255, blank=True)
    line2 = models.CharField(max_length=255, blank=True)
    landmark = models.CharField(max_length=255, blank=True)
    postal_code = models.CharField(max_length=30, blank=True)
    city = models.ForeignKey(
        City,
        on_delete=models.PROTECT,
        related_name="addresses",
        null=True,
        blank=True,
    )

    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)

    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-is_default", "-updated_at", "-id")
        constraints = [
            models.UniqueConstraint(
                fields=("user",),
                condition=Q(is_default=True),
                name="locations_one_default_address_per_user",
            ),
        ]
