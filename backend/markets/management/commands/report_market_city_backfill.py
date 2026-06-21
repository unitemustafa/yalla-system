from django.core.management.base import BaseCommand

from markets.models import Market


class Command(BaseCommand):
    help = "Report legacy markets that still require an explicit city assignment."

    def handle(self, *args, **options):
        markets = Market.objects.filter(city__isnull=True).order_by("id")
        if not markets.exists():
            self.stdout.write(self.style.SUCCESS("All markets have a city."))
            return
        self.stdout.write(
            f"{markets.count()} market(s) require an explicit city backfill:"
        )
        for market in markets:
            self.stdout.write(f"{market.pk}\t{market.name}\t{market.branch}")
