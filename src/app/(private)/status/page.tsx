import packageJson from "../../../../package.json";
import { requireAdminPage } from "@/features/auth/require-admin-page";
import { connectDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function databaseStatus() {
  const startedAt = Date.now();
  try {
    const db = await connectDb();
    await db.connection.db?.admin().ping();
    return { state: "Operativa", ok: true, latencyMs: Date.now() - startedAt };
  } catch {
    return {
      state: "No disponible",
      ok: false,
      latencyMs: Date.now() - startedAt,
    };
  }
}

export default async function StatusPage() {
  await requireAdminPage();
  const database = await databaseStatus();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const storageProvider = process.env.STORAGE_PROVIDER ?? "local";
  const storageIsPersistent = !(
    process.env.VERCEL && storageProvider === "local"
  );
  const appIsHealthy = database.ok && storageIsPersistent;
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Observabilidad</p>
          <h1>Estado de la app</h1>
          <p>
            Diagnóstico seguro del servicio, sin credenciales ni datos
            sensibles.
          </p>
        </div>
        <span
          className={`status-pill ${appIsHealthy ? "is-healthy" : "is-degraded"}`}
        >
          {appIsHealthy ? "Operativa" : "Degradada"}
        </span>
      </header>
      <section className="status-grid" aria-label="Estado de los componentes">
        <article className="panel status-card">
          <span
            className={`status-dot ${database.ok ? "is-healthy" : "is-degraded"}`}
          />
          <div>
            <p className="muted">Base de datos</p>
            <h2>{database.state}</h2>
            <small>{database.latencyMs} ms al verificar</small>
          </div>
        </article>
        <article className="panel status-card">
          <span
            className={`status-dot ${storageIsPersistent ? "is-healthy" : "is-degraded"}`}
          />
          <div>
            <p className="muted">Aplicación</p>
            <h2>Kyoku {packageJson.version}</h2>
            <small>Next.js {packageJson.dependencies.next}</small>
          </div>
        </article>
        <article className="panel status-card">
          <span className="status-dot is-healthy" />
          <div>
            <p className="muted">Archivos</p>
            <h2>{storageIsPersistent ? storageProvider : "No persistente"}</h2>
            <small>
              {storageIsPersistent
                ? "Proveedor configurado"
                : "El almacenamiento local se pierde en Vercel"}
            </small>
          </div>
        </article>
      </section>
      <section className="panel">
        <dl className="settings-list">
          <div>
            <dt>Entorno</dt>
            <dd>
              {process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "desconocido"}
            </dd>
          </div>
          <div>
            <dt>Commit desplegado</dt>
            <dd>{commit ?? "No disponible en entorno local"}</dd>
          </div>
          <div>
            <dt>Registro de errores</dt>
            <dd>Activo, con referencia técnica y datos sensibles ocultos</dd>
          </div>
          <div>
            <dt>Última comprobación</dt>
            <dd>{new Date().toLocaleString("es-UY")}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
