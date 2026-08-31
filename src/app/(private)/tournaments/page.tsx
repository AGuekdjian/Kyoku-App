import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm } from "@/components/resource-form";
import { connectDb } from "@/lib/db";
import { Tournament } from "@/models/Tournament";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function Tournaments({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDb();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const filter = { deletedAt: null };
  const [items, total] = await Promise.all([
    Tournament.find(filter)
      .select("name date registrations._id")
      .sort({ date: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Tournament.countDocuments(filter),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Competencia</p>
          <h1>Torneos</h1>
          <p>Inscripción masiva, resultados y exportación.</p>
        </div>
      </header>
      <details className="panel">
        <summary>Crear torneo</summary>
        <ResourceForm
          endpoint="/api/tournaments"
          fields={[
            { name: "name", label: "Nombre", required: true },
            { name: "date", label: "Fecha", type: "date", required: true },
            { name: "location", label: "Lugar" },
            { name: "organizer", label: "Organizador" },
            {
              name: "status",
              label: "Estado",
              options: [
                { value: "DRAFT", label: "Borrador" },
                { value: "OPEN", label: "Abierto" },
              ],
            },
          ]}
        />
      </details>
      <section className="panel">
        {items.length ? (
          items.map((item) => (
            <div className="list-row" key={String(item._id)}>
              <div>
                <strong>{String(item.name)}</strong>
                <small>
                  {new Date(item.date as Date).toLocaleDateString("es-UY")} ·{" "}
                  {(item.registrations as unknown[]).length} inscriptos
                </small>
              </div>
              <a href={`/api/tournaments/${String(item._id)}/export`}>
                Exportar Excel
              </a>
            </div>
          ))
        ) : (
          <p className="empty">No hay torneos registrados.</p>
        )}
        <PaginationNav
          path="/tournaments"
          page={page}
          pages={pages}
          total={total}
          searchParams={params}
        />
      </section>
    </>
  );
}
