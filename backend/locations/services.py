from math import asin, cos, radians, sin, sqrt

from .models import City


EARTH_RADIUS_KM = 6371.0088


def distance_km(latitude_1, longitude_1, latitude_2, longitude_2):
    latitude_delta = radians(float(latitude_2) - float(latitude_1))
    longitude_delta = radians(float(longitude_2) - float(longitude_1))
    haversine = (
        sin(latitude_delta / 2) ** 2
        + cos(radians(float(latitude_1)))
        * cos(radians(float(latitude_2)))
        * sin(longitude_delta / 2) ** 2
    )
    return 2 * EARTH_RADIUS_KM * asin(sqrt(haversine))


def resolve_city(latitude, longitude):
    matches = []
    for city in City.objects.filter(is_active=True):
        distance = distance_km(
            latitude,
            longitude,
            city.center_latitude,
            city.center_longitude,
        )
        if distance <= float(city.radius_km):
            matches.append((distance, city))
    return min(matches, key=lambda item: (item[0], item[1].pk))[1] if matches else None
