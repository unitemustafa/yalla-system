import { expect, type Page, test } from "@playwright/test";

const apiBase = "http://127.0.0.1:8000/api";
const adminUser = {
  id: "admin-1",
  first_name: "Yalla",
  last_name: "Admin",
  email: "admin@example.com",
  phone: "+218900000000",
  role: "admin",
};

function jwt(expiresInSeconds: number, marker = "token") {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    marker,
  })}.signature`;
}

async function mockLogin(
  page: Page,
  options: {
    role?: string;
    status?: number;
    body?: unknown;
    accessToken?: string;
    refreshToken?: string;
  } = {},
) {
  await page.route(`${apiBase}/auth/login/`, async (route) => {
    const status = options.status ?? 200;
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        options.body ?? {
          accessToken: options.accessToken ?? jwt(300, "login-access"),
          refreshToken: options.refreshToken ?? "login-refresh",
          user: { ...adminUser, role: options.role ?? "admin" },
        },
      ),
    });
  });
}

async function submitLogin(page: Page, remember = false) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill("admin@example.com");
  await page.getByLabel("كلمة المرور").fill("ValidPassword1!");
  if (remember) {
    await page.getByLabel("تذكّر تسجيل الدخول على هذا الجهاز").check();
  }
  await page.getByRole("button", { name: "دخول" }).click();
}

test("redirects protected routes to login with a safe next path", async ({
  page,
}) => {
  await page.goto("/orders?status=pending");
  await expect(page).toHaveURL(
    /\/login\?next=%2Forders%3Fstatus%3Dpending$/,
  );
});

test("logs in an admin, stores cookies, and follows a safe next path", async ({
  page,
  context,
}) => {
  await mockLogin(page);
  await page.goto("/login?next=%2Fitems");
  await page.getByLabel("البريد الإلكتروني").fill("admin@example.com");
  await page.getByLabel("كلمة المرور").fill("ValidPassword1!");
  await page.getByLabel("تذكّر تسجيل الدخول على هذا الجهاز").check();
  await page.getByRole("button", { name: "دخول" }).click();

  await expect(page).toHaveURL(/\/items$/);
  await expect(page.getByRole("heading", { name: "المنتجات" })).toBeVisible();

  const stored = new Map(
    (await context.cookies()).map((cookie) => [cookie.name, cookie]),
  );
  expect(stored.get("yalla_access_token")?.value).toBeTruthy();
  expect(stored.get("yalla_refresh_token")?.value).toBe("login-refresh");
  expect(stored.get("yalla_auth_user")?.value).toContain("admin");
  expect(stored.get("yalla_remember")?.value).toBe("true");
  expect(stored.get("yalla_refresh_token")?.expires).toBeGreaterThan(
    Date.now() / 1000,
  );
});

test("shows Django login errors and rejects non-admin users", async ({
  page,
  context,
}) => {
  await mockLogin(page, {
    status: 401,
    body: { detail: "Invalid email or password." },
  });
  await submitLogin(page);
  await expect(page.getByRole("alert")).toHaveText(
    "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  );

  await page.unroute(`${apiBase}/auth/login/`);
  await mockLogin(page, { role: "client" });
  await submitLogin(page);
  await expect(page.getByRole("alert")).toHaveText(
    "هذا الحساب لا يملك صلاحية دخول لوحة الإدارة.",
  );
  expect(
    (await context.cookies()).filter((cookie) =>
      cookie.name.startsWith("yalla_"),
    ),
  ).toHaveLength(0);
});

test("ignores an unsafe next redirect", async ({ page }) => {
  await mockLogin(page);
  await page.goto("/login?next=%2F%2Fevil.example");
  await page.getByLabel("البريد الإلكتروني").fill("admin@example.com");
  await page.getByLabel("كلمة المرور").fill("ValidPassword1!");
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("refreshes an expired session on reload and persists token rotation", async ({
  page,
  context,
}) => {
  let refreshCalls = 0;
  const rotatedAccessToken = jwt(300, "rotated-access");
  await page.route(`${apiBase}/auth/refresh/`, async (route) => {
    refreshCalls += 1;
    const request = route.request();
    expect(request.postDataJSON()).toEqual({ refreshToken: "old-refresh" });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: rotatedAccessToken,
        refreshToken: "rotated-refresh",
      }),
    });
  });
  await context.addCookies([
    {
      name: "yalla_access_token",
      value: jwt(-10, "expired"),
      url: "http://localhost:3000",
    },
    {
      name: "yalla_refresh_token",
      value: "old-refresh",
      url: "http://localhost:3000",
    },
    {
      name: "yalla_auth_user",
      value: JSON.stringify(adminUser),
      url: "http://localhost:3000",
    },
    {
      name: "yalla_remember",
      value: "false",
      url: "http://localhost:3000",
    },
  ]);

  await page.goto("/dashboard");
  await expect(page.getByText("جارٍ التحقق من الجلسة...")).toBeHidden();
  await expect.poll(() => refreshCalls).toBe(1);

  const stored = new Map(
    (await context.cookies()).map((cookie) => [cookie.name, cookie.value]),
  );
  expect(stored.get("yalla_access_token")).toBe(rotatedAccessToken);
  expect(stored.get("yalla_refresh_token")).toBe("rotated-refresh");
});

test("proactively refreshes before expiry and keeps refresh single-flight", async ({
  page,
}) => {
  let refreshCalls = 0;
  await mockLogin(page, {
    accessToken: jwt(30, "nearly-expired"),
    refreshToken: "refresh-before-expiry",
  });
  await page.route(`${apiBase}/auth/refresh/`, async (route) => {
    refreshCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: jwt(300, "proactive"),
        refreshToken: "proactive-refresh",
      }),
    });
  });

  await submitLogin(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect.poll(() => refreshCalls).toBe(1);
});

test("failed refresh clears the session and returns to login", async ({
  page,
  context,
}) => {
  await page.route(`${apiBase}/auth/refresh/`, (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Token is invalid or expired" }),
    }),
  );
  await context.addCookies([
    {
      name: "yalla_refresh_token",
      value: "invalid-refresh",
      url: "http://localhost:3000",
    },
    {
      name: "yalla_auth_user",
      value: JSON.stringify(adminUser),
      url: "http://localhost:3000",
    },
  ]);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  expect(
    (await context.cookies()).filter((cookie) =>
      cookie.name.startsWith("yalla_"),
    ),
  ).toHaveLength(0);
});

test("logout clears cookies even when the backend is unavailable", async ({
  page,
  context,
}) => {
  await mockLogin(page);
  await page.route(`${apiBase}/auth/logout/`, (route) =>
    route.abort("connectionrefused"),
  );
  await submitLogin(page);
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("button", { name: /Yalla Admin|Mohamed|الملف/i }).click();
  await page.getByText("تسجيل الخروج", { exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (await context.cookies()).filter((cookie) =>
      cookie.name.startsWith("yalla_"),
    ),
  ).toHaveLength(0);
});
