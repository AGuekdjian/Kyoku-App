import { ResourceForm } from "@/components/resource-form";
import { PaginationNav } from "@/components/pagination-nav";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { Activity } from "@/models/Activity";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function Activities({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDb();
  const params = await searchParams;
  const { page, skip } = paginationInput(params.page, PAGE_SIZE);
  const filter = { deletedAt: null };
  const [items, total] = await Promise.all([
    Activity.find(filter)
      .select("name type startDate location")
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Activity.countDocuments(filter),
  ]);
  const pages = totalPages(total, PAGE_SIZE);
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Agenda</p>
          <h1>Actividades</h1>
        </div>
      </header>
      <details className="panel">
        <summary>Nueva actividad</summary>
        <ResourceForm
          endpoint="/api/activities"
          fields={[
            { name: "name", label: "Nombre", required: true },
            {
              name: "type",
              label: "Tipo",
              required: true,
              options: [
                { value: "SEMINAR", label: "Seminario" },
                { value: "CAMP", label: "Campamento" },
                { value: "SPECIAL_TRAINING", label: "Entrenamiento especial" },
                { value: "EXHIBITION", label: "Exhibición" },
                { value: "OTHER", label: "Otro" },
              ],
            },
            { name: "startDate", label: "Fecha", type: "date", required: true },
            { name: "location", label: "Lugar" },
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
                  {String(item.type)} ·{" "}
                  {new Date(item.startDate as Date).toLocaleDateString("es-UY")}
                </small>
              </div>
              <span>{String(item.location ?? "")}</span>
            </div>
          ))
        ) : (
          <p className="empty">No hay actividades registradas.</p>
        )}
        <PaginationNav
          path="/activities"
          page={page}
          pages={pages}
          total={total}
          searchParams={params}
        />
      </section>
    </>
  );
}
