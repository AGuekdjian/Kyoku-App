import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error("Seed credentials are required for E2E");

  await page.goto("/");
  await expect(page).toHaveURL(/login/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
}

test("authenticates and renders the private dashboard", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
});

test("shows operational status without exposing secrets", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("link", { name: "Estado" }).click();

  await expect(
    page.getByRole("heading", { name: "Estado de la app" }),
  ).toBeVisible();
  await expect(page.getByText("Base de datos")).toBeVisible();
  await expect(page.getByText("Registro de errores")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("MONGODB_URI");
  await expect(page.locator("body")).not.toContainText("AUTH_SECRET");
});
