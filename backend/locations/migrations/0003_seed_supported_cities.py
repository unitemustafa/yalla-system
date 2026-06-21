from django.db import migrations


SUPPORTED_CITIES = (
    {
        "slug": "cairo",
        "name": "Cairo",
        "name_ar": "القاهرة",
        "center_latitude": "30.0444000",
        "center_longitude": "31.2357000",
        "radius_km": "60.00",
    },
    {
        "slug": "alexandria",
        "name": "Alexandria",
        "name_ar": "الإسكندرية",
        "center_latitude": "31.2001000",
        "center_longitude": "29.9187000",
        "radius_km": "40.00",
    },
    {
        "slug": "sharm-el-sheikh",
        "name": "Sharm El Sheikh",
        "name_ar": "شرم الشيخ",
        "center_latitude": "27.9158000",
        "center_longitude": "34.3300000",
        "radius_km": "35.00",
    },
    {
        "slug": "hurghada",
        "name": "Hurghada",
        "name_ar": "الغردقة",
        "center_latitude": "27.2579000",
        "center_longitude": "33.8116000",
        "radius_km": "40.00",
    },
    {
        "slug": "mansoura",
        "name": "Mansoura",
        "name_ar": "المنصورة",
        "center_latitude": "31.0409000",
        "center_longitude": "31.3785000",
        "radius_km": "30.00",
    },
    {
        "slug": "tanta",
        "name": "Tanta",
        "name_ar": "طنطا",
        "center_latitude": "30.7865000",
        "center_longitude": "31.0004000",
        "radius_km": "25.00",
    },
)


def seed_supported_cities(apps, schema_editor):
    City = apps.get_model("locations", "City")
    for definition in SUPPORTED_CITIES:
        slug = definition["slug"]
        defaults = {**definition, "is_active": True}
        defaults.pop("slug")
        City.objects.update_or_create(slug=slug, defaults=defaults)


class Migration(migrations.Migration):
    dependencies = [
        ("locations", "0002_city_alter_address_options_address_full_name_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_supported_cities, migrations.RunPython.noop),
    ]
