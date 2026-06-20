from decimal import Decimal

from catalog.models import (
    AdditionClassification,
    CategoryAttribute,
    CategoryClassification,
    CategoryOption,
    Product,
    ProductAddition,
    ProductAttributeValue,
    ProductCategory,
    ProductVariant,
    VariantAttributeValue,
)
from markets.models import Market, MarketClassification


def seed_markets(areas):
    classifications = {}
    for name in ("Supermarket", "Restaurant", "Bakery"):
        obj, _ = MarketClassification.objects.get_or_create(name=name)
        classifications[name] = obj

    definitions = [
        (
            "Yalla Fresh Market",
            "Algiers Centre",
            "Supermarket",
            ["Central Algiers", "Bab Ezzouar"],
        ),
        (
            "Atlas Family Kitchen",
            "Bab Ezzouar",
            "Restaurant",
            ["Central Algiers", "Bab Ezzouar"],
        ),
        (
            "Oran Golden Bakery",
            "Oran Centre",
            "Bakery",
            ["Oran Centre"],
        ),
    ]
    markets = {}
    for name, branch, classification, area_names in definitions:
        market, _ = Market.objects.update_or_create(
            name=name,
            branch=branch,
            defaults={
                "classification": classifications[classification],
                "status": Market.Status.ACTIVE,
            },
        )
        market.delivery_areas.set([areas[name] for name in area_names])
        markets[name] = market
    return markets


def seed_catalog(markets):
    grocery, _ = CategoryClassification.objects.get_or_create(name="Grocery")
    food, _ = CategoryClassification.objects.get_or_create(name="Prepared Food")

    category_definitions = [
        ("Fresh Produce", grocery, "produce", "Fresh fruit and vegetables"),
        ("Drinks", grocery, "beverage", "Cold and shelf-stable drinks"),
        ("Bakery", food, "bakery", "Bread and baked goods"),
        ("Meals", food, "meal", "Ready-to-eat meals"),
    ]
    categories = {}
    for name, classification, category_type, description in category_definitions:
        category, _ = ProductCategory.objects.update_or_create(
            name=name,
            classification=classification,
            defaults={"type": category_type, "description": description},
        )
        categories[name] = category

    attribute_definitions = {
        "Fresh Produce": ("Unit", ["500 g", "1 kg"]),
        "Drinks": ("Size", ["330 ml", "1 L"]),
        "Bakery": ("Pack", ["Single", "Pack of 4"]),
        "Meals": ("Portion", ["Regular", "Family"]),
    }
    attributes = {}
    options = {}
    for category_name, (attribute_name, values) in attribute_definitions.items():
        attribute, _ = CategoryAttribute.objects.update_or_create(
            category=categories[category_name],
            name=attribute_name,
        )
        attributes[category_name] = attribute
        options[category_name] = []
        for value in values:
            option, _ = CategoryOption.objects.get_or_create(
                attribute=attribute,
                value=value,
            )
            options[category_name].append(option)

    product_definitions = [
        ("Red Apples", "Yalla Fresh Market", "Fresh Produce", "320.00"),
        ("Bananas", "Yalla Fresh Market", "Fresh Produce", "240.00"),
        ("Orange Juice", "Yalla Fresh Market", "Drinks", "180.00"),
        ("Fresh Milk", "Yalla Fresh Market", "Drinks", "160.00"),
        ("Mineral Water", "Yalla Fresh Market", "Drinks", "70.00"),
        ("Chicken Couscous", "Atlas Family Kitchen", "Meals", "850.00"),
        ("Vegetable Chorba", "Atlas Family Kitchen", "Meals", "420.00"),
        ("Grilled Chicken", "Atlas Family Kitchen", "Meals", "980.00"),
        ("Traditional Baguette", "Oran Golden Bakery", "Bakery", "60.00"),
        ("Chocolate Croissant", "Oran Golden Bakery", "Bakery", "140.00"),
    ]
    products = {}
    variants = {}
    for index, (name, market_name, category_name, base_price) in enumerate(
        product_definitions,
        start=1,
    ):
        product, _ = Product.objects.update_or_create(
            market=markets[market_name],
            name=name,
            defaults={
                "category": categories[category_name],
                "description": f"Seeded {name.lower()} product.",
                "discount": Decimal("0.00"),
            },
        )
        products[name] = product
        attribute = attributes[category_name]
        first_option, second_option = options[category_name]
        ProductAttributeValue.objects.update_or_create(
            product=product,
            attribute=attribute,
            defaults={"option": first_option},
        )

        product_variants = []
        for variant_index, option in enumerate(
            (first_option, second_option),
            start=1,
        ):
            multiplier = Decimal("1.00") if variant_index == 1 else Decimal("1.75")
            variant, _ = ProductVariant.objects.update_or_create(
                product=product,
                sku=f"SEED-{index:02d}-{variant_index}",
                defaults={"price": Decimal(base_price) * multiplier},
            )
            VariantAttributeValue.objects.update_or_create(
                variant=variant,
                attribute=attribute,
                defaults={"option": option},
            )
            product_variants.append(variant)
        variants[name] = product_variants

    return {"products": products, "variants": variants}


def seed_additions(products):
    classifications = {}
    for name in ("Sauce", "Packaging", "Extra"):
        obj, _ = AdditionClassification.objects.get_or_create(name=name)
        classifications[name] = obj

    definitions = [
        (
            "Garlic Sauce",
            "\ufffd\ufffd\ufffd\ufffd \ufffd\ufffd\ufffd\ufffd\ufffd",
            "Sauce",
            "80.00",
            ["Chicken Couscous", "Vegetable Chorba"],
        ),
        (
            "Gift Bag",
            "\ufffd\ufffd\ufffd \ufffd\ufffd\ufffd\ufffd",
            "Packaging",
            "50.00",
            ["Red Apples", "Orange Juice", "Chocolate Croissant"],
        ),
        (
            "Extra Bread",
            "\ufffd\ufffd\ufffd \ufffd\ufffd\ufffd\ufffd\ufffd",
            "Extra",
            "40.00",
            ["Chicken Couscous", "Vegetable Chorba"],
        ),
    ]
    additions = {}
    for english, arabic, classification, price, product_names in definitions:
        addition, _ = ProductAddition.objects.update_or_create(
            name_en=english,
            defaults={
                "name_ar": arabic,
                "classification": classifications[classification],
                "price": Decimal(price),
                "is_active": True,
            },
        )
        addition.products.set([products[name] for name in product_names])
        additions[english] = addition
    return additions
