import { expect, test } from "@playwright/test";

test("Flow A: homepage → search brand → open profile → inspect claim → inspect evidence", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "How transparent is the sustainability story",
  );
  await expect(page.getByText("Development notice:").first()).toBeVisible();

  await page.getByLabel("Search brands").fill("Verdant");
  await page.getByRole("button", { name: "Search a brand" }).click();
  await expect(page).toHaveURL(/\/brands\?q=Verdant/);

  await page.getByRole("link", { name: "Verdant Wear" }).first().click();
  await expect(page).toHaveURL(/\/brands\/verdant-wear/);
  await expect(page.getByRole("heading", { level: 1, name: "Verdant Wear" })).toBeVisible();
  await expect(page.getByLabel(/Green Transparency Score \d+ out of 100/)).toBeVisible();
  await expect(page.getByText(/Confidence: (High|Medium|Low)/).first()).toBeVisible();
  await expect(page.getByText("Sources reviewed")).toBeVisible();
  await expect(page.getByText("Last reviewed").first()).toBeVisible();

  const rows = page.getByTestId("claim-row");
  await expect(rows.first()).toBeVisible();
  await rows.first().click();

  const panel = page.getByTestId("evidence-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Transparency-risk explanation")).toBeVisible();
  await expect(panel.getByRole("heading", { name: /Sources \(\d+\)/ })).toBeVisible();
  await expect(panel.getByText("Publisher").first()).toBeVisible();
  await expect(panel.getByText(/Evidence level|Level \d of 5/).first()).toBeVisible();
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
