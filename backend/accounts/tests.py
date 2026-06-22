from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import CourierProfile, OneTimePassword

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

    def test_forgot_password_does_not_reveal_unknown_email(self):
        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "unknown@example.com"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
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


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    AUTH_OTP_INCLUDE_IN_RESPONSE=True,
)
class V1AuthenticationAPITests(APITestCase):
    password = "StrongPassword123!"

    def create_user(self, role, **overrides):
        defaults = {
            "username": f"{role}_user",
            "email": f"{role}@example.com",
            "phone": f"+20100000000{len(role)}",
            "password": self.password,
            "role": role,
            "is_active": True,
        }
        defaults.update(overrides)
        return User.objects.create_user(**defaults)

    def bearer(self, user):
        refresh = RefreshToken.for_user(user)
        return {"HTTP_AUTHORIZATION": f"Bearer {refresh.access_token}"}

    def assert_v1_auth_payload(self, data):
        self.assertIn("user", data)
        self.assertIn("accessToken", data)
        self.assertIn("refreshToken", data)
        self.assertIn("expiresAt", data)
        self.assertNotIn("access", data)
        self.assertNotIn("refresh", data)
        self.assertIn("firstName", data["user"])
        self.assertIn("lastName", data["user"])
        self.assertIn("avatarUrl", data["user"])
        self.assertIn("birthDate", data["user"])
        self.assertIn("usernameChangedAt", data["user"])
        self.assertIn("hasPassword", data["user"])

    def test_market_signup_accepts_flutter_payload_and_verifies_with_code(self):
        signup_response = self.client.post(
            "/api/v1/auth/signup",
            {
                "firstName": "Mustafa",
                "lastName": "Ali",
                "username": "mustafa_ali",
                "email": "mustafa@example.com",
                "password": self.password,
                "phone": "+201001234567",
            },
            format="json",
        )

        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(signup_response.data["email"], "mustafa@example.com")
        self.assertEqual(len(signup_response.data["dev_otp"]), 6)

        user = User.objects.get(email="mustafa@example.com")
        self.assertEqual(user.role, User.Role.CLIENT)
        self.assertFalse(user.is_active)
        self.assertTrue(user.terms_accepted)

        verify_response = self.client.post(
            "/api/v1/auth/verify-email",
            {
                "email": "mustafa@example.com",
                "code": signup_response.data["dev_otp"],
            },
            format="json",
        )

        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertEqual(verify_response.data["user"]["firstName"], "Mustafa")
        self.assertEqual(verify_response.data["user"]["role"], "CUSTOMER")
        self.assert_v1_auth_payload(verify_response.data)

    def test_market_signup_requires_username(self):
        response = self.client.post(
            "/api/v1/auth/signup",
            {
                "firstName": "Mustafa",
                "lastName": "Ali",
                "email": "missing.username@example.com",
                "password": self.password,
                "phone": "+201001234568",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_resend_verification_endpoint_regenerates_registration_otp(self):
        signup_response = self.client.post(
            "/api/v1/auth/signup",
            {
                "firstName": "Resend",
                "lastName": "User",
                "username": "resend_user",
                "email": "resend@example.com",
                "password": self.password,
                "phone": "+201001234569",
            },
            format="json",
        )
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)

        response = self.client.post(
            "/api/v1/auth/resend-verification",
            {"email": "resend@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "A new verification code has been sent.")
        self.assertEqual(len(response.data["dev_otp"]), 6)
        active_otps = OneTimePassword.objects.filter(
            user__email="resend@example.com",
            purpose=OneTimePassword.Purpose.REGISTRATION,
            used_at__isnull=True,
        )
        self.assertEqual(active_otps.count(), 1)

    def test_market_availability_and_me_endpoints_use_customer_role(self):
        user = self.create_user(
            User.Role.CLIENT,
            username="customer",
            email="customer@example.com",
            phone="+201001111111",
        )

        username_response = self.client.get(
            "/api/v1/auth/check-username",
            {"username": "new_customer"},
        )
        email_response = self.client.get(
            "/api/v1/auth/check-email",
            {"email": "customer@example.com"},
        )

        self.assertEqual(username_response.status_code, status.HTTP_200_OK)
        self.assertTrue(username_response.data["available"])
        self.assertTrue(email_response.data["registered"])

        me_response = self.client.get("/api/v1/auth/me", **self.bearer(user))
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "customer@example.com")

        patch_response = self.client.patch(
            "/api/v1/auth/me",
            {
                "firstName": "Updated",
                "username": "updated_customer",
                "gender": "male",
                "birthDate": "1995-06-01",
            },
            format="json",
            **self.bearer(user),
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data["firstName"], "Updated")
        self.assertEqual(patch_response.data["username"], "updated_customer")
        self.assertEqual(patch_response.data["gender"], "male")
        self.assertEqual(patch_response.data["birthDate"], "1995-06-01")
        self.assertIsNotNone(patch_response.data["usernameChangedAt"])
        user.refresh_from_db()
        self.assertEqual(user.gender, "male")
        self.assertEqual(user.birth_date.isoformat(), "1995-06-01")
        self.assertIsNotNone(user.username_changed_at)

    def test_customer_me_delete_deactivates_account_with_password(self):
        user = self.create_user(
            User.Role.CLIENT,
            username="delete_customer",
            email="delete.customer@example.com",
            phone="+201001111112",
        )

        response = self.client.delete(
            "/api/v1/auth/me",
            {"password": self.password},
            format="json",
            **self.bearer(user),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Account deactivated.")
        user.refresh_from_db()
        self.assertFalse(user.is_active)

    def test_customer_login_refresh_and_logout_use_v1_shape(self):
        user = self.create_user(
            User.Role.CLIENT,
            username="login_customer",
            email="login.customer@example.com",
            phone="+201001111113",
            first_name="Login",
            last_name="Customer",
        )

        login_response = self.client.post(
            "/api/v1/auth/login",
            {"email": user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data["user"]["role"], "CUSTOMER")
        self.assert_v1_auth_payload(login_response.data)

        refresh_response = self.client.post(
            "/api/v1/auth/refresh",
            {"refreshToken": login_response.data["refreshToken"]},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertEqual(refresh_response.data["user"]["role"], "CUSTOMER")
        self.assert_v1_auth_payload(refresh_response.data)

        logout_refresh_token = refresh_response.data["refreshToken"]
        refresh_jti = RefreshToken(logout_refresh_token)["jti"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['accessToken']}"
        )
        logout_response = self.client.post(
            "/api/v1/auth/logout",
            {"refreshToken": logout_refresh_token},
            format="json",
        )
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertEqual(logout_response.data["message"], "Logout successful.")
        self.assertTrue(
            BlacklistedToken.objects.filter(
                token__jti=refresh_jti
            ).exists()
        )

    def test_v1_logout_accepts_missing_refresh_token(self):
        user = self.create_user(
            User.Role.CLIENT,
            username="logout_customer",
            email="logout.customer@example.com",
            phone="+201001111114",
        )

        response = self.client.post(
            "/api/v1/auth/logout",
            {},
            format="json",
            **self.bearer(user),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Logout successful.")

    def test_v1_logout_returns_useful_error_for_invalid_refresh_token(self):
        user = self.create_user(
            User.Role.CLIENT,
            username="bad_logout_customer",
            email="bad.logout.customer@example.com",
            phone="+201001111115",
        )

        response = self.client.post(
            "/api/v1/auth/logout",
            {"refreshToken": "invalid-token"},
            format="json",
            **self.bearer(user),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Invalid or expired refresh token.")

    def test_customer_login_rejects_dashboard_and_courier_accounts(self):
        admin = self.create_user(
            User.Role.ADMIN,
            username="admin_user",
            email="admin@example.com",
            phone="+201002222222",
            is_staff=True,
        )
        courier = self.create_user(
            User.Role.REPRESENTATIVE,
            username="courier_user",
            email="courier@example.com",
            phone="+201003333333",
        )

        for email in (admin.email, courier.email):
            response = self.client.post(
                "/api/v1/auth/login",
                {"email": email, "password": self.password},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_creates_courier_account_that_can_login_to_courier_app(self):
        admin = self.create_user(
            User.Role.ADMIN,
            username="dashboard_admin",
            email="dashboard@example.com",
            phone="+201004444444",
            is_staff=True,
        )

        dashboard_login = self.client.post(
            "/api/v1/dashboard/auth/login",
            {"email": admin.email, "password": self.password},
            format="json",
        )
        self.assertEqual(dashboard_login.status_code, status.HTTP_200_OK)
        self.assertEqual(dashboard_login.data["user"]["role"], "ADMIN")
        self.assert_v1_auth_payload(dashboard_login.data)

        create_response = self.client.post(
            "/api/v1/dashboard/couriers",
            {
                "name": "Captain Ali",
                "email": "captain.ali@example.com",
                "phone": "+201005555555",
                "password": "CourierPass123!",
                "vehicle": "Motorbike",
                "plateNumber": "ABC-123",
                "zone": "Cairo",
                "maxActiveOrders": 4,
            },
            format="json",
            **self.bearer(admin),
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data["name"], "Captain Ali")
        self.assertEqual(create_response.data["zone"], "Cairo")

        courier_user = User.objects.get(email="captain.ali@example.com")
        self.assertEqual(courier_user.role, User.Role.REPRESENTATIVE)
        self.assertTrue(CourierProfile.objects.filter(user=courier_user).exists())

        courier_login = self.client.post(
            "/api/v1/courier/auth/login",
            {"identifier": "+201005555555", "password": "CourierPass123!"},
            format="json",
        )
        self.assertEqual(courier_login.status_code, status.HTTP_200_OK)
        self.assertEqual(courier_login.data["user"]["role"], "REPRESENTATIVE")
        self.assert_v1_auth_payload(courier_login.data)
        self.assertEqual(courier_login.data["courier"]["vehicle"], "Motorbike")

    def test_role_isolation_for_dashboard_and_courier_me(self):
        customer = self.create_user(
            User.Role.CLIENT,
            username="role_customer",
            email="role.customer@example.com",
            phone="+201006666666",
        )
        courier = self.create_user(
            User.Role.REPRESENTATIVE,
            username="role_courier",
            email="role.courier@example.com",
            phone="+201007777777",
        )
        CourierProfile.objects.create(user=courier, zone="Cairo")

        dashboard_me = self.client.get(
            "/api/v1/dashboard/auth/me",
            **self.bearer(customer),
        )
        courier_me = self.client.get(
            "/api/v1/courier/auth/me",
            **self.bearer(courier),
        )
        customer_on_courier = self.client.get(
            "/api/v1/courier/auth/me",
            **self.bearer(customer),
        )

        self.assertEqual(dashboard_me.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(courier_me.status_code, status.HTTP_200_OK)
        self.assertEqual(courier_me.data["courier"]["zone"], "Cairo")
        self.assertEqual(customer_on_courier.status_code, status.HTTP_403_FORBIDDEN)
