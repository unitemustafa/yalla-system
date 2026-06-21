import os

from .settings import *  # noqa: F403

if os.getenv("USE_SQLITE_FOR_TESTS", "false").lower() in {"1", "true", "yes"}:
    DATABASES["default"] = {  # noqa: F405
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
else:
    DATABASES["default"]["CONN_MAX_AGE"] = 0  # noqa: F405
    DATABASES["default"]["TEST"] = {
        "NAME": os.getenv("POSTGRES_TEST_DB", "test_yalla_db"),
    }

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
