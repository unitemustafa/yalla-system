from django.db import models


class MarketClassification(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Market(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    classification = models.ForeignKey(
        MarketClassification,
        on_delete=models.PROTECT,
        related_name="markets",
    )
    city = models.ForeignKey(
        "locations.City",
        on_delete=models.PROTECT,
        related_name="markets",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    branch = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    delivery_areas = models.ManyToManyField(
        "locations.DeliveryArea",
        related_name="markets",
        blank=True,
    )

    def __str__(self):
        return self.name
