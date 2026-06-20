from datetime import timedelta
from decimal import Decimal

from offers.models import Offer
from orders.models import Order, OrderItem, OrderOffer


def seed_offers(markets, products, now):
    definitions = [
        (
            "Fresh Fruit Weekend",
            "Yalla Fresh Market",
            Offer.OfferType.DISCOUNT,
            "10.00",
            ["Red Apples", "Bananas"],
        ),
        (
            "Family Dinner Deal",
            "Atlas Family Kitchen",
            Offer.OfferType.PACKAGE,
            "15.00",
            ["Chicken Couscous", "Vegetable Chorba"],
        ),
        (
            "Hydration Essentials",
            "Yalla Fresh Market",
            Offer.OfferType.DELIVERY,
            "8.00",
            ["Mineral Water", "Orange Juice"],
        ),
        (
            "Algiers Lunch Flash",
            "Atlas Family Kitchen",
            Offer.OfferType.FLASH,
            "12.00",
            ["Grilled Chicken", "Vegetable Chorba"],
        ),
        (
            "Morning Bakery Flash",
            "Oran Golden Bakery",
            Offer.OfferType.FLASH,
            "12.00",
            ["Traditional Baguette", "Chocolate Croissant"],
        ),
    ]
    offers = {}
    for title, market_name, offer_type, discount, product_names in definitions:
        offer, _ = Offer.objects.update_or_create(
            market=markets[market_name],
            title=title,
            defaults={
                "description": f"Seeded offer: {title}.",
                "type": offer_type,
                "discount": Decimal(discount),
                "start_time": now - timedelta(days=1),
                "end_time": now + timedelta(days=30),
                "active_days": [0, 1, 2, 3, 4, 5, 6],
                "use_limits": 500,
                "user_limit": 3,
                "status": Offer.Status.ACTIVE,
            },
        )
        offer.products.set([products[name] for name in product_names])
        offers[title] = offer
    return offers


def seed_orders(users, markets, variants, offers):
    definitions = [
        {
            "marker": "SEED-ORDER-001",
            "user": users["seed.amina@yalla.test"],
            "market": markets["Yalla Fresh Market"],
            "status": Order.Status.DELIVERED,
            "payment_method": "cash",
            "delivery_price": Decimal("250.00"),
            "items": [
                (variants["Red Apples"][1], 2),
                (variants["Orange Juice"][0], 3),
            ],
            "offer": offers["Fresh Fruit Weekend"],
            "offer_discount": Decimal("120.00"),
        },
        {
            "marker": "SEED-ORDER-002",
            "user": users["seed.karim@yalla.test"],
            "market": markets["Atlas Family Kitchen"],
            "status": Order.Status.UNDER_PREPARATION,
            "payment_method": "card",
            "delivery_price": Decimal("300.00"),
            "items": [
                (variants["Chicken Couscous"][0], 1),
                (variants["Vegetable Chorba"][0], 2),
            ],
            "offer": offers["Family Dinner Deal"],
            "offer_discount": Decimal("180.00"),
        },
        {
            "marker": "SEED-ORDER-003",
            "user": users["seed.amina@yalla.test"],
            "market": markets["Oran Golden Bakery"],
            "status": Order.Status.PENDING,
            "payment_method": "cash",
            "delivery_price": Decimal("280.00"),
            "items": [
                (variants["Traditional Baguette"][1], 1),
                (variants["Chocolate Croissant"][0], 4),
            ],
            "offer": offers["Morning Bakery Flash"],
            "offer_discount": Decimal("75.00"),
        },
    ]

    for definition in definitions:
        subtotal = sum(
            variant.price * quantity for variant, quantity in definition["items"]
        )
        discount = definition["offer_discount"]
        total = subtotal + definition["delivery_price"] - discount
        order, _ = Order.objects.update_or_create(
            description=definition["marker"],
            defaults={
                "user": definition["user"],
                "market": definition["market"],
                "payment_method": definition["payment_method"],
                "discount": discount,
                "status": definition["status"],
                "delivery_price": definition["delivery_price"],
                "subtotal_price": subtotal,
                "total_price": total,
            },
        )
        order.items.all().delete()
        for variant, quantity in definition["items"]:
            OrderItem.objects.create(
                order=order,
                variant=variant,
                quantity=quantity,
                unit_price=variant.price,
            )
        OrderOffer.objects.update_or_create(
            order=order,
            offer=definition["offer"],
            defaults={"discount_amount": discount},
        )
