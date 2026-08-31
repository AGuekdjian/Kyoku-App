import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm } from "@/components/resource-form";
import { connectDb } from "@/lib/db";
import { Exam } from "@/models/Exam";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function Exams({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDb();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const filter = { deletedAt: null };
  const [items, total] = await Promise.all([
    Exam.find(filter)
      .select(
        "name date status registrations._id registrations.observations.status",
      )
      .sort({ date: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Exam.countDocuments(filter),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Evaluaciones</p>
          <h1>Exámenes</h1>
          <p>Aprobaciones, pendientes y revisiones.</p>
        </div>
      </header>
      <details className="panel">
        <summary>Crear examen</summary>
        <ResourceForm
          endpoint="/api/exams"
          fields={[
            { name: "name", label: "Nombre", required: true },
            { name: "date", label: "Fecha", type: "date", required: true },
            { name: "location", label: "Lugar" },
            { name: "examiner", label: "Examinador" },
            {
              name: "status",
              label: "Estado",
              options: [
                { value: "DRAFT", label: "Borrador" },
                { value: "SCHEDULED", label: "Programado" },
              ],
            },
          ]}
        />
      </details>
      <section className="panel">
        {items.length ? (
          items.map((item) => {
            const registrations = item.registrations as unknown as {
              observations: { status: string }[];
            }[];
            const pending = registrations
              .flatMap((registration) => registration.observations)
              .filter((observation) => observation.status === "PENDING").length;
            return (
              <div className="list-row" key={String(item._id)}>
                <div>
                  <strong>{String(item.name)}</strong>
                  <small>
                    {new Date(item.date as Date).toLocaleDateString("es-UY")} ·{" "}
                    {String(item.status)}
                  </small>
                </div>
                <span className="badge">
                  {registrations.length} inscriptos · {pending} pendientes
                </span>
              </div>
            );
          })
        ) : (
          <p className="empty">No hay exámenes registrados.</p>
        )}
        <PaginationNav
          path="/exams"
          page={page}
          pages={pages}
          total={total}
          searchParams={params}
        />
      </section>
    </>
  );
}
