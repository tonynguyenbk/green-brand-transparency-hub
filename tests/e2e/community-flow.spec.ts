import { expect, test, type Page } from "@playwright/test";

/**
 * Community flows. Need development member sign-in (DEV_AUTH_SECRET set,
 * Supabase not configured) and the ESG dataset (npm run seed:esg).
 */
const PASSWORD = process.env.DEV_ADMIN_PASSWORD ?? "";

async function signInAsMember(page: Page, company: string) {
  await page.goto(`/companies/${company}`);
  await page.getByRole("link", { name: "Đăng nhập thử để chấm" }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Tên hiển thị").fill(`E2E Tester ${Date.now()}`);
  await page.getByRole("button", { name: "Đăng nhập thử" }).click();
  await expect(page).toHaveURL(new RegExp(`/companies/${company}$`));
  await page.waitForLoadState("networkidle");
}

test("Flow F: member signs in, rates a company and votes on a source", async ({ page }) => {
  await signInAsMember(page, "fpt");

  await page.getByRole("button", { name: "Chấm điểm" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("label", { hasText: "4 sao" }).click();
  await expect(dialog.getByLabel(/^4 sao/)).toBeChecked();
  await dialog.getByLabel("Môi trường").fill("6.5");
  await dialog.getByLabel("Quản trị").fill("5");
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Gửi đánh giá" }).click();
  await expect(page.getByText("Đã lưu đánh giá của bạn")).toBeVisible();
  await expect(page.getByText("Bạn đã chấm")).toBeVisible();
  await expect(page.getByText(/4★ · E 6\.5 · S [\d.]+ · G 5\.0/)).toBeVisible();

  const firstSource = page.getByRole("group", { name: "Bài này có đáng tin không?" }).first();
  await firstSource.getByRole("button", { name: "Đáng tin" }).click();
  await expect(firstSource.getByRole("button", { name: "Đáng tin" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.reload();
  await expect(
    page
      .getByRole("group", { name: "Bài này có đáng tin không?" })
      .first()
      .getByRole("button", { name: "Đáng tin" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test.describe("@admin", () => {
  test.skip(!PASSWORD, "DEV_ADMIN_PASSWORD is not set — development admin login unavailable");

  test("Flow G: member suggests an article, admin approves it, it becomes a source", async ({
    page,
  }) => {
    await signInAsMember(page, "dell");
    const title = `E2E suggested article ${Date.now()} — Example News`;

    await page.getByRole("button", { name: "Gửi bài báo" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Đường dẫn bài báo").fill(`https://example.org/e2e/${Date.now()}`);
    await dialog.getByLabel("Tiêu đề và tên báo").fill(title);
    await dialog.getByRole("button", { name: "Môi trường" }).click();
    await dialog.getByRole("button", { name: "Tiêu cực" }).click();
    await dialog
      .getByLabel("Tóm tắt một câu")
      .fill("Báo cáo cho thấy phát thải chuỗi cung ứng tăng.");
    await dialog.getByRole("button", { name: "Gửi để duyệt" }).click();
    await expect(page.getByText("Đã gửi. Biên tập viên sẽ đọc bài này.")).toBeVisible();
    await expect(page.getByText("Đang chờ duyệt").first()).toBeVisible();

    await page.goto("/admin/login");
    await page.getByLabel("Development password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await page.goto("/admin/community");
    const row = page.getByRole("row").filter({ hasText: title });
    await row.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByRole("row").filter({ hasText: title })).toHaveCount(0);

    await page.goto("/companies/dell");
    const source = page
      .getByRole("listitem")
      .filter({ hasText: title })
      .filter({ hasText: "Do cộng đồng gửi" });
    await expect(source).toBeVisible();
    await expect(source.getByText("Do cộng đồng gửi")).toBeVisible();
    await expect(page.getByText("Đã thêm vào nguồn").first()).toBeVisible();
  });
});
