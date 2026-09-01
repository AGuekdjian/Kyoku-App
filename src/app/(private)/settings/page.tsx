import { requireAdminPage } from "@/features/auth/require-admin-page";
import { connectDb } from "@/lib/db";
import { Settings } from "@/models/Settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireAdminPage();
  await connectDb();
  const settings = await Settings.findOne({ key: "dojo" })
    .select("dojoName weightStaleDays")
    .lean();

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Configuración</h1>
        </div>
      </header>
      <section className="panel">
        <dl className="settings-list">
          <div>
            <dt>Nombre del dojo</dt>
            <dd>{String(settings?.dojoName ?? "Mi dojo")}</dd>
          </div>
          <div>
            <dt>Peso desactualizado</dt>
            <dd>{String(settings?.weightStaleDays ?? 90)} días</dd>
          </div>
          <div>
            <dt>Rol actual</dt>
            <dd>{session.role}</dd>
          </div>
        </dl>
        <p className="muted">
          Los cambios sensibles requieren rol ADMIN y se auditan desde el
          servidor.
        </p>
      </section>
    </>
  );
}
