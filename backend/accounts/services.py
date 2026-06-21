import secrets
import hashlib
import hmac
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import OneTimePassword, OTPRequestLog


OTP_LENGTH = 6
OTP_MAX_ATTEMPTS = 5


class OTPRateLimitError(Exception):
    def __init__(self, message, retry_after):
        super().__init__(message)
        self.message = message
        self.retry_after = max(1, int(retry_after))


def normalize_email(email):
    return email.strip().lower()


def request_ip(request):
    forwarded = str(request.META.get("HTTP_X_FORWARDED_FOR", "")).split(",")[0]
    return forwarded.strip() or request.META.get("REMOTE_ADDR") or None


def target_hash(email):
    return hmac.new(
        settings.SECRET_KEY.encode(),
        normalize_email(email).encode(),
        hashlib.sha256,
    ).hexdigest()


@transaction.atomic
def issue_otp(user, purpose, ip_address=None):
    now = timezone.now()
    email_hash = target_hash(user.email)
    target_logs = OTPRequestLog.objects.filter(
        target_hash=email_hash,
        purpose=purpose,
    ).order_by("-created_at")
    latest = target_logs.first()
    cooldown = settings.AUTH_OTP_COOLDOWN_SECONDS
    if latest and latest.created_at > now - timedelta(seconds=cooldown):
        retry_after = cooldown - (now - latest.created_at).total_seconds()
        raise OTPRateLimitError("Wait before requesting another code.", retry_after)

    target_window = settings.AUTH_OTP_TARGET_WINDOW_SECONDS
    if (
        target_logs.filter(
            created_at__gte=now - timedelta(seconds=target_window)
        ).count()
        >= settings.AUTH_OTP_TARGET_LIMIT
    ):
        oldest = target_logs.filter(
            created_at__gte=now - timedelta(seconds=target_window)
        ).order_by("created_at").first()
        retry_after = target_window - (now - oldest.created_at).total_seconds()
        raise OTPRateLimitError(
            "Too many codes requested for this email.", retry_after
        )

    if ip_address:
        ip_window = settings.AUTH_OTP_IP_WINDOW_SECONDS
        ip_logs = OTPRequestLog.objects.filter(
            ip_address=ip_address,
            created_at__gte=now - timedelta(seconds=ip_window),
        )
        if ip_logs.count() >= settings.AUTH_OTP_IP_LIMIT:
            oldest = ip_logs.order_by("created_at").first()
            retry_after = ip_window - (now - oldest.created_at).total_seconds()
            raise OTPRateLimitError(
                "Too many verification requests from this address.", retry_after
            )

    OneTimePassword.objects.filter(
        user=user,
        purpose=purpose,
        used_at__isnull=True,
    ).update(used_at=now)
    code = "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))
    otp = OneTimePassword.objects.create(
        user=user,
        purpose=purpose,
        code_hash=make_password(code),
        expires_at=now + timedelta(seconds=settings.AUTH_OTP_EXPIRY_SECONDS),
    )
    OTPRequestLog.objects.create(
        purpose=purpose,
        target_hash=email_hash,
        ip_address=ip_address,
    )
    send_mail(
        subject=_otp_subject(purpose),
        message=(
            f"Your Yalla verification code is {code}. "
            f"It expires in {settings.AUTH_OTP_EXPIRY_SECONDS // 60} minutes."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return otp, code


def verify_otp(user, purpose, code):
    otp = (
        OneTimePassword.objects.filter(
            user=user,
            purpose=purpose,
            used_at__isnull=True,
        )
        .order_by("-created_at")
        .first()
    )

    if otp is None:
        return None, "No active verification code was found."
    if otp.expires_at <= timezone.now():
        otp.used_at = timezone.now()
        otp.save(update_fields=["used_at"])
        return None, "The verification code has expired."
    if otp.attempts >= OTP_MAX_ATTEMPTS:
        otp.used_at = timezone.now()
        otp.save(update_fields=["used_at"])
        return None, "Too many invalid attempts. Request a new code."
    if not check_password(code, otp.code_hash):
        otp.attempts += 1
        update_fields = ["attempts"]
        if otp.attempts >= OTP_MAX_ATTEMPTS:
            otp.used_at = timezone.now()
            update_fields.append("used_at")
        otp.save(update_fields=update_fields)
        return None, "Invalid verification code."

    otp.used_at = timezone.now()
    otp.save(update_fields=["used_at"])
    return otp, None


def otp_response_data(code):
    if settings.DEBUG and settings.AUTH_OTP_INCLUDE_IN_RESPONSE:
        return {"dev_otp": code}
    return {}


def _otp_subject(purpose):
    if purpose == OneTimePassword.Purpose.REGISTRATION:
        return "Verify your Yalla account"
    return "Reset your Yalla password"
