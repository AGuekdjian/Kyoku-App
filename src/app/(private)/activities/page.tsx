import { ResourceForm } from "@/components/resource-form";
import { PaginationNav } from "@/components/pagination-nav";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { Activity } from "@/models/Activity";
import { Student } from "@/models/Student";
import { ActivityParticipants } from "./activity-participants";

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
  const [items, total, students] = await Promise.all([
    Activity.find(filter)
      .select(
        "name type startDate endDate location organizer description notes participants",
      )
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Activity.countDocuments(filter),
    Student.find({ active: true, deletedAt: null })
      .select("firstName lastName")
      .sort({ lastName: 1, firstName: 1 })
      .lean(),
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
            { name: "endDate", label: "Fecha final", type: "date" },
            { name: "location", label: "Lugar" },
            { name: "organizer", label: "Organizador" },
            { name: "description", label: "Descripción" },
            { name: "notes", label: "Observaciones" },
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
              <ActivityParticipants
                activityId={String(item._id)}
                students={students.map((student) => ({
                  id: String(student._id),
                  name: `${String(student.lastName)}, ${String(student.firstName)}`,
                }))}
                initialIds={(item.participants ?? []).map(String)}
              />
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
