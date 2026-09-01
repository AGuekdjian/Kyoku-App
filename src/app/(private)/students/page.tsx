import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm, type Field } from "@/components/resource-form";
import { formatGradeRank } from "@/features/grades/format";
import { calculateAge } from "@/features/students/domain/age";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { Grade } from "@/models/Grade";
import { Student } from "@/models/Student";
import { StudentEditor } from "./student-editor";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

type SearchParams = Promise<{
  q?: string;
  active?: string;
  grade?: string;
  page?: string;
}>;

type GradeOption = {
  _id: unknown;
  name: unknown;
  type: unknown;
  order: unknown;
};

function dateInput(value: unknown) {
  return value ? new Date(value as Date).toISOString().slice(0, 10) : "";
}

function studentFields(
  grades: GradeOption[],
  student?: Record<string, unknown>,
): Field[] {
  return [
    {
      name: "firstName",
      label: "Nombre",
      required: true,
      defaultValue: String(student?.firstName ?? ""),
    },
    {
      name: "lastName",
      label: "Apellido",
      required: true,
      defaultValue: String(student?.lastName ?? ""),
    },
    {
      name: "birthDate",
      label: "Fecha de nacimiento",
      type: "date",
      required: true,
      defaultValue: dateInput(student?.birthDate),
    },
    {
      name: "gender",
      label: "Sexo/género competitivo",
      options: [
        { value: "UNSPECIFIED", label: "Sin especificar" },
        { value: "FEMALE", label: "Femenino" },
        { value: "MALE", label: "Masculino" },
        { value: "OTHER", label: "Otro" },
      ],
      defaultValue: String(student?.gender ?? "UNSPECIFIED"),
    },
    {
      name: "document",
      label: "Documento",
      defaultValue: String(student?.document ?? ""),
    },
    {
      name: "medicalProvider",
      label: "Sociedad médica",
      defaultValue: String(student?.medicalProvider ?? ""),
    },
    {
      name: "phone",
      label: "Teléfono",
      required: true,
      defaultValue: String(student?.phone ?? ""),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      defaultValue: String(student?.email ?? ""),
    },
    {
      name: "address",
      label: "Dirección",
      defaultValue: String(student?.address ?? ""),
    },
    {
      name: "guardianName",
      label: "Responsable/tutor",
      defaultValue: String(student?.guardianName ?? ""),
    },
    {
      name: "guardianPhone",
      label: "Teléfono del responsable",
      defaultValue: String(student?.guardianPhone ?? ""),
    },
    {
      name: "emergencyContact",
      label: "Contacto de emergencia",
      required: true,
      defaultValue: String(student?.emergencyContact ?? ""),
    },
    {
      name: "joinedAt",
      label: "Fecha de ingreso",
      type: "date",
      required: true,
      defaultValue: dateInput(student?.joinedAt),
    },
    {
      name: "currentGradeId",
      label: "Grado",
      required: true,
      defaultValue: String(student?.currentGradeId ?? ""),
      options: grades.map((grade) => ({
        value: String(grade._id),
        label: `${String(grade.name)} · ${formatGradeRank(String(grade.type), Number(grade.order), String(grade.name))}`,
      })),
    },
    {
      name: "weight",
      label: "Peso (kg)",
      type: "number",
      defaultValue: student?.weight == null ? "" : Number(student.weight),
    },
    {
      name: "height",
      label: "Altura (cm)",
      type: "number",
      defaultValue: student?.height == null ? "" : Number(student.height),
    },
    {
      name: "notes",
      label: "Observaciones",
      defaultValue: String(student?.notes ?? ""),
    },
    ...(student
      ? [
          {
            name: "active",
            label: "Alumno activo",
            type: "checkbox",
            defaultValue: Boolean(student.active),
          } satisfies Field,
        ]
      : []),
  ];
}

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
      .select(
        "firstName lastName birthDate gender document medicalProvider phone email address guardianName guardianPhone emergencyContact joinedAt active weight height currentGradeId notes",
      )
      .populate("currentGradeId", "name type order")
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
      .select("name type order")
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
          fields={studentFields(grades as GradeOption[])}
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const grade = student.currentGradeId as unknown as {
                  name?: string;
                  type?: string;
                  order?: number;
                  _id?: unknown;
                } | null;
                const editable = {
                  ...(student as unknown as Record<string, unknown>),
                  currentGradeId: grade?._id,
                };
                return (
                  <tr key={String(student._id)}>
                    <td>
                      <strong>
                        {String(student.lastName)}, {String(student.firstName)}
                      </strong>
                    </td>
                    <td>{calculateAge(student.birthDate as Date)}</td>
                    <td>
                      {grade?.name ?? "—"}
                      {grade?.type && grade.order != null ? (
                        <small className="table-subtitle">
                          {formatGradeRank(grade.type, grade.order, grade.name)}
                        </small>
                      ) : null}
                    </td>
                    <td>{String(student.phone)}</td>
                    <td>
                      <span className="badge">
                        {student.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <StudentEditor
                        endpoint={`/api/students/${String(student._id)}`}
                        studentName={`${String(student.firstName)} ${String(student.lastName)}`}
                        fields={studentFields(
                          grades as GradeOption[],
                          editable,
                        )}
                      />
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
