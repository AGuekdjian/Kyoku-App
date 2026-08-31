import { expect, test } from "@playwright/test";
test("renders the private dashboard shell", async ({ page }) => { await page.goto("/"); await expect(page.getByRole("heading", { name: "Buenas tardes" })).toBeVisible(); await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible(); });
