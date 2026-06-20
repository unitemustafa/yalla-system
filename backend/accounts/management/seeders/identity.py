from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

from accounts.models import OneTimePassword
from locations.models import Address, DeliveryArea

User = get_user_model()


def seed_users(now):
    definitions = [
        {
            "email": "seed.admin@yalla.test",
            "username": "seed_admin",
            "first_name": "Yalla",
            "last_name": "Admin",
            "phone": "+213555100001",
            "role": User.Role.ADMIN,
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        },
        {
            "email": "seed.amina@yalla.test",
            "username": "seed_amina",
            "first_name": "Amina",
            "last_name": "Bensalem",
            "phone": "+213555100002",
            "role": User.Role.CLIENT,
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
        },
        {
            "email": "seed.karim@yalla.test",
            "username": "seed_karim",
            "first_name": "Karim",
            "last_name": "Mansouri",
            "phone": "+213555100003",
            "role": User.Role.CLIENT,
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
        },
        {
            "email": "seed.courier@yalla.test",
            "username": "seed_courier",
            "first_name": "Sofiane",
            "last_name": "Delivery",
            "phone": "+213555100004",
            "role": User.Role.REPRESENTATIVE,
            "is_staff": False,
            "is_superuser": False,
            "is_active": True,
        },
        {
            "email": "seed.pending@yalla.test",
            "username": "seed_pending",
            "first_name": "Pending",
            "last_name": "Customer",
            "phone": "+213555100005",
            "role": User.Role.CLIENT,
            "is_staff": False,
            "is_superuser": False,
            "is_active": False,
        },
    ]
    users = {}
    for definition in definitions:
        email = definition["email"]
        defaults = {
            **definition,
            "terms_accepted": True,
            "terms_accepted_at": now,
            "privacy_policy_version": "seed-v1",
        }
        defaults.pop("email")
        user, _ = User.objects.update_or_create(email=email, defaults=defaults)
        user.set_password("SeedPass1!")
        user.save(update_fields=["password"])
        users[email] = user
    return users


def seed_otps(users, now):
    pending = users["seed.pending@yalla.test"]
    OneTimePassword.objects.update_or_create(
        user=pending,
        purpose=OneTimePassword.Purpose.REGISTRATION,
        used_at__isnull=True,
        defaults={
            "code_hash": make_password("123456"),
            "expires_at": now + timedelta(hours=1),
            "attempts": 0,
        },
    )

    client = users["seed.amina@yalla.test"]
    otp, _ = OneTimePassword.objects.get_or_create(
        user=client,
        purpose=OneTimePassword.Purpose.PASSWORD_RESET,
        used_at__isnull=False,
        defaults={
            "code_hash": make_password("654321"),
            "expires_at": now - timedelta(hours=1),
            "attempts": 0,
            "used_at": now - timedelta(hours=2),
        },
    )
    if otp.used_at is None:
        otp.used_at = now - timedelta(hours=2)
        otp.save(update_fields=["used_at"])


def seed_locations(users):
    area_definitions = [
        ("Central Algiers", "250.00", "36.7538000", "3.0588000", "8.00"),
        ("Bab Ezzouar", "300.00", "36.7167000", "3.1833000", "6.50"),
        ("Oran Centre", "280.00", "35.6969000", "-0.6331000", "7.00"),
    ]
    areas = {}
    for name, price, latitude, longitude, radius in area_definitions:
        area, _ = DeliveryArea.objects.update_or_create(
            name=name,
            defaults={
                "delivery_price": Decimal(price),
                "center_latitude": Decimal(latitude),
                "center_longitude": Decimal(longitude),
                "radius_km": Decimal(radius),
                "is_active": True,
            },
        )
        areas[name] = area

    addresses = [
        (users["seed.amina@yalla.test"], "Home", "36.7525000", "3.0419000", True),
        (users["seed.amina@yalla.test"], "Work", "36.7110000", "3.1810000", False),
        (users["seed.karim@yalla.test"], "Home", "35.7002000", "-0.6401000", True),
    ]
    for user, name, latitude, longitude, is_default in addresses:
        Address.objects.update_or_create(
            user=user,
            name=name,
            defaults={
                "latitude": Decimal(latitude),
                "longitude": Decimal(longitude),
                "is_default": is_default,
            },
        )
    return areas
