from django.db import migrations


MARKET_CITIES = (
    ("Yalla Fresh Market", "cairo", "Algiers Centre"),
    ("Atlas Family Kitchen", "sharm-el-sheikh", "Naama Bay"),
    ("Oran Golden Bakery", "alexandria", "Oran Centre"),
)


def assign_seed_markets_to_cities(apps, schema_editor):
    City = apps.get_model("locations", "City")
    Market = apps.get_model("markets", "Market")

    cities = {
        city.slug: city
        for city in City.objects.filter(
            slug__in=[city_slug for _, city_slug, _ in MARKET_CITIES]
        )
    }
    for market_name, city_slug, branch in MARKET_CITIES:
        city = cities.get(city_slug)
        if city is not None:
            Market.objects.filter(name=market_name).update(
                city=city,
                branch=branch,
            )


class Migration(migrations.Migration):
    dependencies = [
        ("locations", "0003_seed_supported_cities"),
        ("markets", "0002_market_city"),
    ]

    operations = [
        migrations.RunPython(
            assign_seed_markets_to_cities,
            migrations.RunPython.noop,
        ),
    ]
