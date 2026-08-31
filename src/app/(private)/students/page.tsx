import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm } from "@/components/resource-form";
import { calculateAge } from "@/features/students/domain/age";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { Grade } from "@/models/Grade";
import { Student } from "@/models/Student";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

type SearchParams = Promise<{
  q?: string;
  active?: string;
  grade?: string;
  page?: string;
}>;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connectDb();
  const params = await searchParams;
  const { page, skip } = paginationInput(params.page, PAGE_SIZE);
  const filter: Record<string, unknown> = { deletedAt: null };
  if (params.q?.trim()) filter.$text = { $search: params.q.trim() };
  if (params.active === "true" || params.active === "false")
    filter.active = params.active === "true";
  if (params.grade) filter.currentGradeId = params.grade;

  const [students, total, grades] = await Promise.all([
    Student.find(filter)
      .select("firstName lastName birthDate phone active currentGradeId")
      .populate("currentGradeId", "name")
      .sort(
        params.q
          ? { score: { $meta: "textScore" } }
          : { lastName: 1, firstName: 1 },
      )
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Student.countDocuments(filter),
    Grade.find({ active: true, deletedAt: null })
      .select("name")
      .sort({ order: 1 })
      .lean(),
  ]);
  const pages = totalPages(total, PAGE_SIZE);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Personas</p>
          <h1>Alumnos</h1>
          <p>{total} registros encontrados</p>
        </div>
      </header>

      <section className="panel" aria-label="Filtros de alumnos">
        <form className="filter-form">
          <label>
            Buscar
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Nombre o apellido"
            />
          </label>
          <label>
            Estado
            <select name="active" defaultValue={params.active ?? ""}>
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          <label>
            Grado
            <select name="grade" defaultValue={params.grade ?? ""}>
              <option value="">Todos</option>
              {grades.map((grade) => (
                <option key={String(grade._id)} value={String(grade._id)}>
                  {String(grade.name)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Filtrar</button>
        </form>
      </section>

      <details className="panel">
        <summary>Nuevo alumno</summary>
        <ResourceForm
          endpoint="/api/students"
          fields={[
            { name: "firstName", label: "Nombre", required: true },
            { name: "lastName", label: "Apellido", required: true },
            {
              name: "birthDate",
              label: "Fecha de nacimiento",
              type: "date",
              required: true,
            },
            { name: "phone", label: "Teléfono", required: true },
            {
              name: "emergencyContact",
              label: "Contacto de emergencia",
              required: true,
            },
            {
              name: "joinedAt",
              label: "Fecha de ingreso",
              type: "date",
              required: true,
            },
            {
              name: "currentGradeId",
              label: "Grado",
              required: true,
              options: grades.map((grade) => ({
                value: String(grade._id),
                label: String(grade.name),
              })),
            },
            { name: "weight", label: "Peso (kg)", type: "number" },
            { name: "height", label: "Altura (cm)", type: "number" },
          ]}
        />
      </details>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Edad</th>
                <th>Grado</th>
                <th>Contacto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const grade = student.currentGradeId as unknown as {
                  name?: string;
                } | null;
                return (
                  <tr key={String(student._id)}>
                    <td>
                      <strong>
                        {String(student.lastName)}, {String(student.firstName)}
                      </strong>
                    </td>
                    <td>{calculateAge(student.birthDate as Date)}</td>
                    <td>{grade?.name ?? "—"}</td>
                    <td>{String(student.phone)}</td>
                    <td>
                      <span className="badge">
                        {student.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {students.length === 0 && (
          <p className="empty">No hay alumnos que coincidan con los filtros.</p>
        )}
        <PaginationNav
          path="/students"
          page={page}
          pages={pages}
          total={total}
          searchParams={params}
        />
      </section>
    </>
  );
}
