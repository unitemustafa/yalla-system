from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.management.seeders import (
    seed_additions,
    seed_catalog,
    seed_locations,
    seed_markets,
    seed_offers,
    seed_orders,
    seed_otps,
    seed_users,
)


class Command(BaseCommand):
    help = "Create idempotent fake data for all Yalla project tables."

    @transaction.atomic
    def handle(self, *args, **options):
        now = timezone.now()
        users = seed_users(now)
        seed_otps(users, now)
        areas = seed_locations(users)
        markets = seed_markets(areas)
        catalog = seed_catalog(markets)
        additions = seed_additions(catalog["products"])
        offers = seed_offers(markets, catalog["products"], now)
        seed_orders(users, markets, catalog["variants"], offers)

        self.stdout.write(
            self.style.SUCCESS(
                "Seed data ready. Test password: SeedPass1! | pending OTP: 123456"
            )
        )
        self.stdout.write(
            "Created/updated: "
            f"{len(users)} users, {len(areas)} delivery areas, "
            f"{len(markets)} markets, {len(catalog['products'])} products, "
            f"{len(additions)} additions, {len(offers)} offers."
        )
