import os

from .settings import *  # noqa: F403

DATABASES["default"]["CONN_MAX_AGE"] = 0  # noqa: F405
DATABASES["default"]["TEST"] = {
    "NAME": os.getenv("POSTGRES_TEST_DB", "test_yalla_db"),
    "MIRROR": None,
    "CHARSET": None,
    "COLLATION": None,
}

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
