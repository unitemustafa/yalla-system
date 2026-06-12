import { expect, type Page, test } from "@playwright/test";

const demoPassword = process.env.DASHBOARD_DEMO_PASSWORD;

if (!demoPassword) {
  throw new Error(
    "DASHBOARD_DEMO_PASSWORD is required to run dashboard e2e tests.",
  );
}

async function loginViaApi(page: Page) {
  const response = await page.request.post("/api/auth/login", {
    data: {
      email: "dashboard@admin.com",
      password: demoPassword,
    },
  });

  expect(response.ok()).toBeTruthy();
}

test("redirects protected dashboard routes to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});

test("loads protected dashboard data after API login", async ({ page }) => {
  await loginViaApi(page);

  await page.goto("/items");
  await expect(page.getByRole("heading", { name: "المنتجات" })).toBeVisible();
  await expect(
    page.locator("article:visible, table:visible").getByText("BASIC PACKAGE").first(),
  ).toBeVisible();

  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "الطلبات" })).toBeVisible();
  await expect(
    page.locator("article:visible, table:visible").getByText("ORD-20260524-UEETJE").first(),
  ).toBeVisible();
});

test("desktop keeps full data tables available", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");

  await loginViaApi(page);
  await page.goto("/items");

  await expect(page.locator("table").first()).toBeVisible();
  await expect(page.locator("article").first()).toBeHidden();
});

test("mobile items page uses cards without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await loginViaApi(page);
  await page.goto("/items");

  await expect(page.locator("article").first()).toBeVisible();
  await expect(page.locator("table").first()).toBeHidden();
  await expect(
    page.locator("article").filter({ hasText: "BASIC PACKAGE" }).first(),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
  expect(hasHorizontalOverflow).toBeFalsy();
});

test("mobile orders page uses compact cards without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");

  await loginViaApi(page);
  await page.goto("/orders");

  await expect(page.locator("article").first()).toBeVisible();
  await expect(page.locator("table").first()).toBeHidden();
  await expect(
    page.locator("article").filter({ hasText: "ORD-20260524-UEETJE" }).first(),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
  expect(hasHorizontalOverflow).toBeFalsy();
});
