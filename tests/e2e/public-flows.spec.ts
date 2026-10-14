import { expect, test } from "@playwright/test";

test("Flow A: Greenlens home → search company → company page with score and sources", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("27");
  await page.waitForLoadState("networkidle");

  await page.getByRole("combobox", { name: /Tìm một công ty|Find a company/ }).fill("H&M");
  await page.getByRole("option", { name: /H&M/ }).click();
  await expect(page).toHaveURL(/\/companies\/hm$/);

  await expect(page.getByRole("heading", { level: 1, name: "H&M" })).toBeVisible();
  await expect(page.getByText("6.5").first()).toBeVisible();
  await expect(page.getByText("7.5 × 0.4 + 6.0 × 0.35 + 5.5 × 0.25")).toBeVisible();
  await expect(page.getByRole("link", { name: /Forbes/ })).toHaveAttribute("href", /forbes\.com/);
});

test("rankings filter, language switch and theme switch", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const table = page.locator("#rankings table");
  await page
    .locator("#rankings")
    .getByRole("button", { name: /Công nghệ/ })
    .click();
  await expect(table.getByRole("link", { name: "Apple" })).toBeVisible();
  await expect(table.getByRole("link", { name: "Nike" })).toHaveCount(0);

  await page
    .getByRole("button", { name: "EN", exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "ESG scores for 27 major brands",
  );

  await page.getByRole("button", { name: "Dark" }).filter({ visible: true }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("Flow B: compare → choose two brands → see comparison", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByText("Select at least two brands to compare.")).toBeVisible();

  await page.getByLabel(/Verdant Wear/).check();
  await page.getByLabel(/NovaTech Labs/).check();
  await page.getByRole("button", { name: "Compare brands" }).click();

  await expect(page).toHaveURL(/brands=verdant-wear,novatech-labs/);
  const table = page.getByTestId("comparison-table");
  await expect(table).toBeVisible();
  await expect(table.getByRole("link", { name: "Verdant Wear" })).toBeVisible();
  await expect(table.getByRole("link", { name: "NovaTech Labs" })).toBeVisible();
  await expect(table.getByText("Average claim risk")).toBeVisible();
  await expect(page.getByText(/according to this methodology/).first()).toBeVisible();
  await expect(page.getByText(/greener/i)).toHaveCount(1); // only the explanatory "not greener" sentence in the header
});

test("Flow C: claim checker → paste claim → receive analysis", async ({ page }) => {
  await page.goto("/claim-checker");
  await page.getByLabel("Sustainability claim").fill("Our packaging is 100% eco-friendly.");
  await page.getByRole("button", { name: "Analyse claim" }).click();

  const result = page.getByTestId("claim-check-result");
  await expect(result).toBeVisible();
  await expect(result.getByText(/High/).first()).toBeVisible();
  await expect(
    result.getByText('"Eco-friendly" is a broad environmental statement.'),
  ).toBeVisible();
  await expect(result.getByText("Suggested stronger wording pattern")).toBeVisible();
  await expect(result.getByText("Material composition")).toBeVisible();
});

test("brand directory filters keep missing scores distinct from zero", async ({ page }) => {
  await page.goto("/brands?risk=HIGH");
  await expect(page.getByRole("link", { name: "PureForm Beauty" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Verdant Wear" })).toHaveCount(0);
});
