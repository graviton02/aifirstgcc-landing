import { expect, test } from "@playwright/test";

test.describe("public smoke", () => {
  test("home page renders the primary marketplace CTA @smoke", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: /explore agent marketplace/i })
    ).toBeVisible();
  });

  test("directory page renders the marketplace heading @smoke", async ({ page }) => {
    await page.goto("/directory");

    await expect(
      page.getByRole("heading", { name: /find the right ai agent/i })
    ).toBeVisible();
    await expect(page.getByText("Agent Directory").first()).toBeVisible();
  });
});
