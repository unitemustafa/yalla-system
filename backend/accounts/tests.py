from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import OneTimePassword

User = get_user_model()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    AUTH_OTP_INCLUDE_IN_RESPONSE=True,
)
class AuthenticationAPITests(APITestCase):
    password = "StrongPassword123!"
    new_password = "NewStrongPassword456!"
    email = "customer@example.com"

    def registration_payload(self):
        return {
            "first_name": "Yalla",
            "last_name": "Customer",
            "username": "yalla_customer",
            "email": self.email.upper(),
            "phone": "+213555000001",
            "password": self.password,
            "password_confirm": self.password,
            "terms_accepted": True,
        }

    def create_active_user(self):
        return User.objects.create_user(
            username="customer",
            email=self.email,
            phone="+213555000001",
            password=self.password,
            is_active=True,
        )

    def test_registration_requires_otp_before_login(self):
        response = self.client.post("/api/auth/register/", self.registration_payload())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], self.email)
        self.assertEqual(len(response.data["dev_otp"]), 6)
        self.assertEqual(len(mail.outbox), 1)

        user = User.objects.get(email=self.email)
        self.assertFalse(user.is_active)
        self.assertTrue(user.check_password(self.password))
        self.assertEqual(user.username, "yalla_customer")

        login_response = self.client.post(
            "/api/auth/login/",
            {"email": self.email, "password": self.password},
        )
        self.assertEqual(login_response.status_code, status.HTTP_400_BAD_REQUEST)

        verify_response = self.client.post(
            "/api/auth/register/verify-otp/",
            {"email": self.email, "otp": response.data["dev_otp"]},
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn("accessToken", verify_response.data)
        self.assertIn("refreshToken", verify_response.data)
        self.assertTrue(User.objects.get(pk=user.pk).is_active)

    def test_registration_rejects_duplicate_active_email(self):
        self.create_active_user()
        response = self.client.post("/api/auth/register/", self.registration_payload())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_registration_rejects_duplicate_username_case_insensitively(self):
        User.objects.create_user(
            username="Yalla_Customer",
            email="existing@example.com",
            phone="+213555000002",
            password=self.password,
        )

        response = self.client.post(
            "/api/auth/register/",
            self.registration_payload(),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["username"],
            ["This username is already taken."],
        )

    def test_registration_enforces_password_complexity(self):
        payload = self.registration_payload()
        payload["password"] = "password"
        payload["password_confirm"] = "password"

        response = self.client.post("/api/auth/register/", payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["password"],
            [
                "Password must contain at least one uppercase letter.",
                "Password must contain at least one number.",
                "Password must contain at least one special character.",
            ],
        )

    def test_registration_rejects_password_shorter_than_eight_characters(self):
        payload = self.registration_payload()
        payload["password"] = "Ab1!"
        payload["password_confirm"] = "Ab1!"

        response = self.client.post("/api/auth/register/", payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Password must be at least 8 characters.",
            response.data["password"],
        )

    def test_login_uses_case_insensitive_email(self):
        self.create_active_user()
        response = self.client.post(
            "/api/auth/login/",
            {"email": self.email.upper(), "password": self.password},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], self.email)
        self.assertIn("accessToken", response.data)
        self.assertIn("refreshToken", response.data)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_login_accepts_username_or_phone(self):
        self.create_active_user()

        username_response = self.client.post(
            "/api/auth/login/",
            {"identifier": "customer", "password": self.password},
        )
        self.assertEqual(username_response.status_code, status.HTTP_200_OK)
        self.assertEqual(username_response.data["user"]["email"], self.email)

        phone_response = self.client.post(
            "/api/auth/login/",
            {"login": "+213555000001", "password": self.password},
        )
        self.assertEqual(phone_response.status_code, status.HTTP_200_OK)
        self.assertEqual(phone_response.data["user"]["email"], self.email)

    def test_admin_creates_courier_that_can_login_to_courier_app(self):
        admin = User.objects.create_user(
            username="dashboard_admin",
            email="admin@example.com",
            phone="+201000000010",
            password=self.password,
            role=User.Role.ADMIN,
            is_staff=True,
        )
        self.client.force_authenticate(admin)

        create_response = self.client.post(
            "/api/v1/auth/couriers",
            {
                "name": "مصطفى علي",
                "phone": "+201001234567",
                "email": "courier@example.com",
                "password": self.password,
                "vehicle": "موتوسيكل",
                "plateNumber": "ABC-123",
                "zone": "القاهرة",
                "maxActiveOrders": 4,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        courier = User.objects.get(email="courier@example.com")
        self.assertEqual(courier.role, User.Role.REPRESENTATIVE)
        self.assertTrue(courier.check_password(self.password))
        self.assertEqual(courier.courier_profile.vehicle, "موتوسيكل")

        self.client.force_authenticate(user=None)
        login_response = self.client.post(
            "/api/v1/auth/courier-login",
            {
                "identifier": "+201001234567",
                "password": self.password,
                "rememberMe": True,
            },
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            login_response.data["user"]["role"],
            User.Role.REPRESENTATIVE,
        )

    def test_non_admin_cannot_create_courier(self):
        user = self.create_active_user()
        self.client.force_authenticate(user)
        response = self.client.post(
            "/api/v1/auth/couriers",
            {
                "name": "Courier",
                "phone": "+201001234568",
                "email": "courier@example.com",
                "password": self.password,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_cannot_login_to_courier_app(self):
        self.create_active_user()
        response = self.client.post(
            "/api/v1/auth/courier-login",
            {"identifier": self.email, "password": self.password},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_accepts_egyptian_phone_with_or_without_leading_zero(self):
        User.objects.create_user(
            username="egypt_customer",
            email="egypt@example.com",
            phone="+2001016487371",
            password=self.password,
            is_active=True,
        )

        leading_zero_response = self.client.post(
            "/api/auth/login/",
            {"identifier": "01016487371", "password": self.password},
        )
        self.assertEqual(leading_zero_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            leading_zero_response.data["user"]["email"],
            "egypt@example.com",
        )

        without_zero_response = self.client.post(
            "/api/auth/login/",
            {"identifier": "1016487371", "password": self.password},
        )
        self.assertEqual(without_zero_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            without_zero_response.data["user"]["email"],
            "egypt@example.com",
        )

    def test_check_phone_matches_equivalent_egyptian_formats(self):
        User.objects.create_user(
            username="egypt_customer",
            email="egypt@example.com",
            phone="+201016487371",
            password=self.password,
            is_active=True,
        )

        response = self.client.get(
            "/api/v1/auth/check-phone",
            {"phone": "+2001016487371"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["registered"])
        self.assertFalse(response.data["available"])

    def test_missing_fields_return_field_specific_required_messages(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": self.email},
        )
        self.assertEqual(login_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            login_response.data["password"],
            ["Password is required."],
        )

        blank_password_response = self.client.post(
            "/api/auth/login/",
            {"email": self.email, "password": ""},
        )
        self.assertEqual(
            blank_password_response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            blank_password_response.data["password"],
            ["Password is required."],
        )

        register_response = self.client.post(
            "/api/auth/register/",
            {},
        )
        self.assertEqual(register_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            register_response.data["email"],
            ["Email is required."],
        )
        self.assertEqual(
            register_response.data["username"],
            ["Username is required."],
        )
        self.assertEqual(
            register_response.data["phone"],
            ["Phone is required."],
        )

    def test_logout_blacklists_refresh_token(self):
        user = self.create_active_user()
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        response = self.client.post(
            "/api/auth/logout/",
            {"refresh": str(refresh)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Logout successful.")
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=refresh["jti"]).exists())

    def test_refresh_accepts_mobile_refresh_token_name(self):
        user = self.create_active_user()
        refresh = RefreshToken.for_user(user)

        response = self.client.post(
            "/api/auth/refresh/",
            {"refreshToken": str(refresh)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("accessToken", response.data)
        self.assertIn("refreshToken", response.data)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_login_remember_me_controls_refresh_token_lifetime(self):
        self.create_active_user()

        session_response = self.client.post(
            "/api/auth/login/",
            {
                "email": self.email,
                "password": self.password,
                "rememberMe": False,
            },
        )
        remembered_response = self.client.post(
            "/api/auth/login/",
            {
                "email": self.email,
                "password": self.password,
                "rememberMe": True,
            },
        )

        self.assertEqual(session_response.status_code, status.HTTP_200_OK)
        self.assertEqual(remembered_response.status_code, status.HTTP_200_OK)
        self.assertFalse(session_response.data["rememberMe"])
        self.assertTrue(remembered_response.data["rememberMe"])

        session_token = RefreshToken(session_response.data["refreshToken"])
        remembered_token = RefreshToken(remembered_response.data["refreshToken"])
        self.assertEqual(
            session_token["exp"] - session_token["iat"],
            int(settings.AUTH_SESSION_REFRESH_TOKEN_LIFETIME.total_seconds()),
        )
        self.assertEqual(
            remembered_token["exp"] - remembered_token["iat"],
            int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        )

    def test_change_password_requires_current_password_and_blacklists_tokens(self):
        user = self.create_active_user()
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        wrong_response = self.client.post(
            "/api/v1/auth/change-password",
            {
                "currentPassword": "WrongPassword123!",
                "newPassword": self.new_password,
                "passwordConfirm": self.new_password,
            },
        )
        self.assertEqual(wrong_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", wrong_response.data)

        response = self.client.post(
            "/api/v1/auth/change-password",
            {
                "currentPassword": self.password,
                "newPassword": self.new_password,
                "passwordConfirm": self.new_password,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password(self.new_password))
        with self.assertRaises(TokenError):
            RefreshToken(str(refresh)).check_blacklist()

        self.client.credentials()
        old_login = self.client.post(
            "/api/auth/login/",
            {"email": self.email, "password": self.password},
        )
        self.assertEqual(old_login.status_code, status.HTTP_401_UNAUTHORIZED)

        new_login = self.client.post(
            "/api/auth/login/",
            {"email": self.email, "password": self.new_password},
        )
        self.assertEqual(new_login.status_code, status.HTTP_200_OK)

    def test_forgot_and_reset_password_with_otp(self):
        user = self.create_active_user()
        existing_refresh = RefreshToken.for_user(user)

        forgot_response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": self.email},
        )
        self.assertEqual(forgot_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(forgot_response.data["dev_otp"]), 6)
        self.assertEqual(len(mail.outbox), 1)

        reset_response = self.client.post(
            "/api/auth/reset-password/",
            {
                "email": self.email,
                "otp": forgot_response.data["dev_otp"],
                "password": self.new_password,
                "password_confirm": self.new_password,
            },
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password(self.new_password))
        self.assertTrue(
            BlacklistedToken.objects.filter(token__user=user).exists()
        )
        with self.assertRaises(TokenError):
            RefreshToken(str(existing_refresh)).check_blacklist()

        reused_otp_response = self.client.post(
            "/api/auth/reset-password/",
            {
                "email": self.email,
                "otp": forgot_response.data["dev_otp"],
                "password": self.password,
                "password_confirm": self.password,
            },
        )
        self.assertEqual(reused_otp_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_forgot_password_rejects_unknown_email(self):
        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "unknown@example.com"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["email"],
            ["No account found with this email."],
        )
        self.assertNotIn("dev_otp", response.data)

    def test_invalid_otp_is_limited(self):
        register_response = self.client.post(
            "/api/auth/register/",
            self.registration_payload(),
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        for _ in range(5):
            response = self.client.post(
                "/api/auth/register/verify-otp/",
                {"email": self.email, "otp": "000000"},
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        otp = OneTimePassword.objects.get(
            user__email=self.email,
            purpose=OneTimePassword.Purpose.REGISTRATION,
        )
        self.assertEqual(otp.attempts, 5)
        self.assertIsNotNone(otp.used_at)

    def test_versioned_flutter_auth_contract(self):
        signup_response = self.client.post(
            "/api/v1/auth/signup",
            {
                "firstName": "Flutter",
                "lastName": "Customer",
                "username": "flutter_customer",
                "email": "flutter@example.com",
                "phone": "+201000000001",
                "password": self.password,
            },
        )
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(signup_response.data["email"], "flutter@example.com")
        self.assertEqual(len(signup_response.data["dev_otp"]), 6)

        email_check = self.client.get(
            "/api/v1/auth/check-email",
            {"email": "flutter@example.com"},
        )
        self.assertEqual(email_check.status_code, status.HTTP_200_OK)
        self.assertFalse(email_check.data["registered"])
        self.assertTrue(email_check.data["available"])

        phone_check = self.client.get(
            "/api/v1/auth/check-phone",
            {"phone": "+201000000001"},
        )
        self.assertEqual(phone_check.status_code, status.HTTP_200_OK)
        self.assertFalse(phone_check.data["registered"])
        self.assertTrue(phone_check.data["available"])

        username_check = self.client.get(
            "/api/v1/auth/check-username",
            {"username": "flutter_customer"},
        )
        self.assertEqual(username_check.status_code, status.HTTP_200_OK)
        self.assertFalse(username_check.data["registered"])
        self.assertTrue(username_check.data["available"])

        verify_response = self.client.post(
            "/api/v1/auth/verify-email",
            {
                "email": "flutter@example.com",
                "code": signup_response.data["dev_otp"],
            },
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn("accessToken", verify_response.data)
        self.assertIn("refreshToken", verify_response.data)
        self.assertEqual(verify_response.data["expiresIn"], 15 * 60)
        self.assertEqual(
            verify_response.data["user"]["username"],
            "flutter_customer",
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {verify_response.data['accessToken']}"
        )
        me_response = self.client.get("/api/v1/auth/me")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["user"]["email"], "flutter@example.com")

        update_response = self.client.patch(
            "/api/v1/auth/me",
            {"firstName": "Updated"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["user"]["first_name"], "Updated")

        logout_response = self.client.post("/api/v1/auth/logout")
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        with self.assertRaises(TokenError):
            RefreshToken(verify_response.data["refreshToken"]).check_blacklist()

    def test_availability_endpoints_report_active_accounts(self):
        self.create_active_user()

        email_check = self.client.get(
            "/api/v1/auth/check-email",
            {"email": self.email.upper()},
        )
        self.assertEqual(email_check.status_code, status.HTTP_200_OK)
        self.assertTrue(email_check.data["registered"])
        self.assertFalse(email_check.data["available"])

        phone_check = self.client.get(
            "/api/v1/auth/check-phone",
            {"phone": "+213555000001"},
        )
        self.assertEqual(phone_check.status_code, status.HTTP_200_OK)
        self.assertTrue(phone_check.data["registered"])
        self.assertFalse(phone_check.data["available"])

        username_check = self.client.get(
            "/api/v1/auth/check-username",
            {"username": "CUSTOMER"},
        )
        self.assertEqual(username_check.status_code, status.HTTP_200_OK)
        self.assertFalse(username_check.data["available"])
        self.assertTrue(username_check.data["registered"])
