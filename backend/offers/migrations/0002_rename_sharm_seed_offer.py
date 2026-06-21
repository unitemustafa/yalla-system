from django.db import migrations


def rename_sharm_seed_offer(apps, schema_editor):
    Offer = apps.get_model("offers", "Offer")
    Offer.objects.filter(
        title="Algiers Lunch Flash",
        market__name="Atlas Family Kitchen",
    ).update(
        title="Sharm Lunch Flash",
        description="Seeded offer: Sharm Lunch Flash.",
    )


class Migration(migrations.Migration):
    dependencies = [
        ("markets", "0003_assign_seed_markets_to_cities"),
        ("offers", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(rename_sharm_seed_offer, migrations.RunPython.noop),
    ]
