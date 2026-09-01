import { expect, test, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error("Seed credentials are required for E2E");

  await page.goto("/");
  await expect(page).toHaveURL(/login/);
  await expect(
    page.getByRole("heading", { name: "Ingresá a DojoNexo" }),
  ).toBeVisible();
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
  await expect(page.getByRole("link", { name: /DojoNexo/ })).toBeVisible();
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

test("navigates through optimized management pages", async ({ page }) => {
  await loginAsAdmin(page);
  const routes = [
    ["Actividades", "/activities"],
    ["Exámenes", "/exams"],
    ["Torneos", "/tournaments"],
    ["Biblioteca", "/documents"],
    ["Auditoría", "/audit"],
    ["Usuarios", "/users"],
  ] as const;

  for (const [heading, route] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      "Internal Server Error",
    );
  }
});

test("creates and edits a student, then registers them in a tournament", async ({
  page,
}) => {
  await loginAsAdmin(page);
  const suffix = Date.now().toString();
  const firstName = `Alumno${suffix}`;
  const tournamentName = `Torneo ${suffix}`;

  await page.goto("/students");
  await page.getByText("Nuevo alumno").click();
  const createForm = page
    .locator("details")
    .filter({ hasText: "Nuevo alumno" });
  await createForm.getByLabel("Nombre", { exact: true }).fill(firstName);
  await createForm.getByLabel("Apellido").fill("Prueba E2E");
  await createForm.getByLabel("Fecha de nacimiento").fill("2012-05-10");
  await createForm.getByLabel("Sociedad médica").fill("Sociedad de prueba");
  await createForm.getByLabel("Teléfono", { exact: true }).fill("099123456");
  await createForm
    .getByLabel("Contacto de emergencia")
    .fill("Responsable 099654321");
  await createForm.getByLabel("Fecha de ingreso").fill("2026-09-01");
  await createForm.getByRole("button", { name: "Crear" }).click();

  await expect(
    page.getByRole("cell", { name: new RegExp(firstName) }),
  ).toBeVisible();
  const studentRow = page.getByRole("row").filter({ hasText: firstName });
  await studentRow.getByRole("button", { name: "Editar", exact: true }).click();
  const editor = page.getByRole("dialog");
  await expect(editor.getByLabel("Sociedad médica")).toHaveValue(
    "Sociedad de prueba",
  );
  await editor.getByLabel("Teléfono", { exact: true }).fill("098000000");
  await editor.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(studentRow).toContainText("098000000");

  await page.goto("/tournaments");
  await page.getByText("Crear torneo").click();
  const tournamentForm = page
    .locator("details")
    .filter({ hasText: "Crear torneo" });
  await tournamentForm.getByLabel("Nombre").fill(tournamentName);
  await tournamentForm.getByLabel("Fecha").fill("2026-12-01");
  await tournamentForm.getByLabel("Estado").selectOption("OPEN");
  await tournamentForm.getByRole("button", { name: "Crear" }).click();

  const tournament = page
    .locator("details")
    .filter({ hasText: tournamentName });
  await tournament.locator("summary").click();
  await tournament.getByLabel("Buscar").fill(firstName);
  await tournament.getByText(new RegExp(firstName)).click();
  await tournament
    .getByRole("button", { name: "Inscribir seleccionados" })
    .click();
  await expect(tournament.getByText("Inscriptos (1)")).toBeVisible();

  await page.goto("/exams");
  await page.getByText("Crear examen").click();
  const examForm = page.locator("details").filter({ hasText: "Crear examen" });
  await examForm.getByLabel("Nombre").fill(`Examen ${suffix}`);
  await examForm.getByLabel("Fecha").fill("2026-12-15");
  await examForm.getByLabel("Estado").selectOption("SCHEDULED");
  await examForm.getByRole("button", { name: "Crear" }).click();

  const exam = page.locator("details").filter({ hasText: `Examen ${suffix}` });
  await exam.locator("summary").click();
  await exam.getByText(new RegExp(firstName)).click();
  await exam.getByRole("button", { name: "Inscribir seleccionados" }).click();
  await expect(exam.getByText("Evaluaciones (1)")).toBeVisible();
  const evaluation = exam
    .locator(".exam-registration")
    .filter({ hasText: firstName });
  await evaluation.getByRole("button", { name: "Registrar" }).click();
  await expect(evaluation.getByText("PASSED")).toBeVisible();
});
