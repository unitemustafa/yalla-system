from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        CLIENT = "client", "Client"
        REPRESENTATIVE = "representative", "Representative"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, unique=True)
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.CLIENT)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    gender = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    username_changed_at = models.DateTimeField(null=True, blank=True)
    current_city = models.ForeignKey(
        "locations.City",
        on_delete=models.SET_NULL,
        related_name="current_users",
        null=True,
        blank=True,
    )
    fcm_token = models.TextField(blank=True, null=True)

    terms_accepted = models.BooleanField(default=False)
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    privacy_policy_version = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta(AbstractUser.Meta):
        constraints = [
            models.UniqueConstraint(
                Lower("username"),
                name="accounts_user_username_ci_unique",
            ),
        ]


class OneTimePassword(models.Model):
    class Purpose(models.TextChoices):
        REGISTRATION = "registration", "Registration"
        PASSWORD_RESET = "password_reset", "Password reset"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="one_time_passwords",
    )
    purpose = models.CharField(max_length=30, choices=Purpose.choices)
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "purpose", "created_at"]),
        ]


class OTPRequestLog(models.Model):
    purpose = models.CharField(max_length=30, choices=OneTimePassword.Purpose.choices)
    target_hash = models.CharField(max_length=64)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["target_hash", "purpose", "created_at"]),
            models.Index(fields=["ip_address", "created_at"]),
        ]


class CourierProfile(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        BUSY = "busy", "Busy"
        OFFLINE = "offline", "Offline"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="courier_profile",
    )
    photo_url = models.TextField(blank=True)
    vehicle = models.CharField(max_length=120, blank=True)
    plate_number = models.CharField(max_length=60, blank=True)
    zone = models.CharField(max_length=150, blank=True)
    max_active_orders = models.PositiveSmallIntegerField(default=3)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Courier profile for {self.user}"
