import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm } from "@/components/resource-form";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { Tournament } from "@/models/Tournament";
import { Student } from "@/models/Student";
import { calculateAge } from "@/features/students/domain/age";
import { TournamentManager } from "./tournament-manager";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function Tournaments({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDb();
  const params = await searchParams;
  const { page, skip } = paginationInput(params.page, PAGE_SIZE);
  const filter = { deletedAt: null };
  const [items, total, students] = await Promise.all([
    Tournament.find(filter)
      .select("name date location status registrations")
      .sort({ date: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Tournament.countDocuments(filter),
    Student.find({ active: true, deletedAt: null })
      .select("firstName lastName birthDate weight height currentGradeId")
      .populate("currentGradeId", "name type order")
      .sort({ lastName: 1, firstName: 1 })
      .limit(500)
      .lean(),
  ]);
  const pages = totalPages(total, PAGE_SIZE);
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
            <details className="tournament-card" key={String(item._id)}>
              <summary>
                <div>
                  <strong>{String(item.name)}</strong>
                  <small>
                    {new Date(item.date as Date).toLocaleDateString("es-UY")} ·{" "}
                    {(item.registrations as unknown[]).length} inscriptos
                  </small>
                </div>
                <span>Abrir gestión</span>
              </summary>
              <TournamentManager
                tournamentId={String(item._id)}
                students={students.map((student) => {
                  const grade = student.currentGradeId as unknown as {
                    _id: unknown;
                    name: unknown;
                  };
                  return {
                    id: String(student._id),
                    name: `${String(student.lastName)}, ${String(student.firstName)}`,
                    age: calculateAge(student.birthDate as Date),
                    weight: student.weight as number | undefined,
                    height: student.height as number | undefined,
                    gradeId: String(grade?._id ?? ""),
                    grade: String(grade?.name ?? "Sin grado"),
                  };
                })}
                registrations={item.registrations.map((registration) => ({
                  id: String(registration._id),
                  studentId: String(registration.studentId),
                  name: String(registration.snapshot?.fullName ?? "Alumno"),
                  grade: String(
                    registration.snapshot?.gradeName ?? "Sin grado",
                  ),
                  result: registration.result ?? undefined,
                  resultNotes: registration.resultNotes ?? undefined,
                }))}
              />
              <a
                className="button export-button"
                href={`/api/tournaments/${String(item._id)}/export`}
              >
                Exportar Excel
              </a>
            </details>
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
