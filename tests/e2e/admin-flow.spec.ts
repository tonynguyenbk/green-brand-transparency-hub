import { expect, test } from "@playwright/test";

const PASSWORD = process.env.DEV_ADMIN_PASSWORD ?? "";

test.describe("@admin", () => {
  test.skip(!PASSWORD, "DEV_ADMIN_PASSWORD is not set — development admin login unavailable");

  test("Flow D: admin → create claim → mark verified → recalculate brand score", async ({
    page,
  }) => {
    // Unauthenticated visitors are redirected to the login page.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.getByLabel("Development password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // Create a claim (starts as candidate).
    await page.goto("/admin/claims/new");
    await page.waitForLoadState("networkidle"); // wait for hydration before filling the form
    const form = page.getByTestId("claim-form");
    await form.getByLabel("Brand", { exact: true }).selectOption({ label: "NovaTech Labs" });
    await form.getByLabel("Category").selectOption("ENERGY");
    const text = `E2E test claim: 40% of NovaTech chargers ship without plastic (${Date.now()}).`;
    await form.getByLabel("Exact claim text").fill(text);
    for (const [label, value] of [
      ["Specificity", "4"],
      ["Evidence level", "2"],
      ["Measurability", "4"],
      ["Verification", "1"],
      ["Context", "3"],
    ] as const) {
      await form.getByLabel(label, { exact: true }).selectOption(value);
    }
    await form.getByRole("button", { name: "Create claim" }).click();
    await expect(page).toHaveURL(/\/admin\/claims\/(?!new$)[a-z0-9]+$/);
    await expect(page.getByText("Not included in public scores.")).toBeVisible();

    // Verify it.
    await page.getByTestId("status-VERIFIED").click();
    await expect(page.getByText("Included in the next score recalculation.")).toBeVisible();

    // Recalculate the brand score → new snapshot.
    await page.getByRole("link", { name: "Back to brand" }).click();
    await expect(page.getByRole("heading", { name: "NovaTech Labs" })).toBeVisible();
    await page.getByTestId("recalculate-score").click();
    await expect(page.getByText(/New snapshot created/)).toBeVisible();

    // The verified claim is now public.
    await page.goto("/brands/novatech-labs");
    await expect(page.getByText(text)).toBeVisible();
  });
});
