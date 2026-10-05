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

test.describe("@admin corrections", () => {
  test.skip(!PASSWORD, "DEV_ADMIN_PASSWORD is not set — development admin login unavailable");

  test("public report an issue → appears in the admin review queue", async ({ page }) => {
    const marker = `E2E report ${Date.now()}`;
    await page.goto("/brands/loomwell-apparel");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Report an issue" }).first().click();

    const form = page.getByTestId("report-issue-form");
    await form.getByLabel("What kind of issue?").selectOption("UPDATED_DATA");
    await form
      .getByLabel("Details")
      .fill(`${marker}: the 2025 report adds carbon emissions data for both factories.`);
    await form.getByRole("button", { name: "Send report" }).click();
    await expect(page.getByText(/your report will be reviewed/)).toBeVisible();

    await page.goto("/admin/login");
    await page.getByLabel("Development password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.goto("/admin/corrections?status=OPEN");
    await page
      .getByRole("link")
      .filter({ hasText: /\d{4}$/ })
      .first()
      .click();
    await expect(page.getByText(marker)).toBeVisible();
  });
});

test.describe("@admin research study", () => {
  test.skip(!PASSWORD, "DEV_ADMIN_PASSWORD is not set — development admin login unavailable");

  test("admin opens study → participant completes survey → results update", async ({
    page,
    browser,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Development password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.goto("/admin/research");
    await page.getByRole("link", { name: /Green Claim Transparency and Brand Trust/ }).click();
    await expect(page.getByText(/\d+ completed \/ \d+ started/)).toBeVisible();
    await page.waitForLoadState("networkidle");
    const openButton = page.getByTestId("open-study");
    if (await openButton.isVisible()) {
      page.once("dialog", (d) => d.accept());
      await openButton.click();
      await expect(page.getByText("Study opened.")).toBeVisible();
    }
    const before = Number(
      (await page.getByText(/\d+ completed \/ \d+ started/).textContent())!.match(
        /(\d+) completed/,
      )![1],
    );

    // Participant in a separate, unauthenticated context.
    const participant = await (await browser.newContext()).newPage();
    await participant.goto("/study/transparency-trust-pilot");
    await participant.waitForLoadState("networkidle");
    await participant.getByLabel(/agree to take part/).check();
    await participant.getByRole("button", { name: "Start" }).click();
    await expect(participant.getByText("Designed with the planet in mind.")).toBeVisible();
    await participant.getByRole("button", { name: "Continue to questions" }).click();
    for (const group of await participant.locator("fieldset").all()) {
      await group.getByLabel("Agree", { exact: true }).check();
    }
    await participant.getByRole("button", { name: "Submit answers" }).click();
    await expect(participant.getByText("Thank you for taking part")).toBeVisible();

    await page.reload();
    await expect(page.getByText(`${before + 1} completed`, { exact: false })).toBeVisible();
    await expect(page.getByTestId("study-results")).toBeVisible();
  });
});
