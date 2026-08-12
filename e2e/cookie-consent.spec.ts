import { expect, test } from "@playwright/test";

const optionalRequestPattern =
  /snap\.licdn\.com|px\.ads\.linkedin\.com|\/_vercel\/insights|\/_vercel\/speed-insights/i;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
});

test("keeps optional services off until the visitor chooses", async ({ page }) => {
  const optionalRequests: string[] = [];
  page.on("request", (request) => {
    if (optionalRequestPattern.test(request.url())) {
      optionalRequests.push(request.url());
    }
  });

  await page.goto("/orbys360");

  const consentRegion = page.getByRole("region", { name: "Cookie consent" });
  await expect(consentRegion).toBeVisible();
  await expect(page.getByRole("button", { name: "Reject optional" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Manage choices" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible();
  expect(optionalRequests).toEqual([]);

  await page.getByRole("button", { name: "Reject optional" }).click();
  await expect(consentRegion).toBeHidden();
  expect(optionalRequests).toEqual([]);
});

test("supports granular preferences on a small mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/orbys360");

  await page.getByRole("button", { name: "Manage choices" }).click();
  const dialog = page.getByRole("dialog", { name: "Cookie preferences" });
  await expect(dialog).toBeVisible();
  await expect(page.getByText("Always on")).toBeVisible();

  await page.getByRole("checkbox", { name: "Analytics" }).check();
  await page.getByRole("button", { name: "Save choices" }).click();
  await expect(dialog).toBeHidden();

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("orbys360-cookie-consent") ?? "null"),
  );
  expect(stored).toMatchObject({ analytics: true, marketing: false });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
});

test("keeps the public platform gateway free of Orbys360 consent", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("region", { name: "Cookie consent" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Visit Orbys360" })).toBeVisible();
  await expect(page.getByText("Coming soon", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Visit GCCWorx360" })).toHaveCount(0);
});

test("publishes a responsive cookie policy page", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/cookie-policy");

  await expect(page.getByRole("heading", { level: 1, name: "Cookie policy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your choices" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clerk cookie documentation" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
});
