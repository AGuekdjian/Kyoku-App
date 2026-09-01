import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm } from "@/components/resource-form";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { Exam } from "@/models/Exam";
import { Grade } from "@/models/Grade";
import { Student } from "@/models/Student";
import { ExamManager } from "./exam-manager";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function Exams({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDb();
  const params = await searchParams;
  const { page, skip } = paginationInput(params.page, PAGE_SIZE);
  const filter = { deletedAt: null };
  const [items, total, students, grades] = await Promise.all([
    Exam.find(filter)
      .select("name date status registrations")
      .populate("registrations.studentId", "firstName lastName")
      .populate("registrations.currentGradeId", "name")
      .populate("registrations.targetGradeId", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Exam.countDocuments(filter),
    Student.find({ active: true, deletedAt: null })
      .select("firstName lastName currentGradeId")
      .sort({ lastName: 1, firstName: 1 })
      .limit(500)
      .lean(),
    Grade.find({ active: true, deletedAt: null })
      .select("name order")
      .sort({ order: 1 })
      .lean(),
  ]);
  const gradeById = new Map(grades.map((grade) => [String(grade._id), grade]));
  const pages = totalPages(total, PAGE_SIZE);
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
              <details className="tournament-card" key={String(item._id)}>
                <summary>
                  <div>
                    <strong>{String(item.name)}</strong>
                    <small>
                      {new Date(item.date as Date).toLocaleDateString("es-UY")}{" "}
                      · {String(item.status)}
                    </small>
                  </div>
                  <span className="badge">
                    {registrations.length} inscriptos · {pending} pendientes
                  </span>
                </summary>
                <ExamManager
                  examId={String(item._id)}
                  candidates={students.flatMap((student) => {
                    const current = gradeById.get(
                      String(student.currentGradeId),
                    );
                    const target = grades.find(
                      (grade) => current && grade.order > current.order,
                    );
                    return current && target
                      ? [
                          {
                            id: String(student._id),
                            name: `${String(student.lastName)}, ${String(student.firstName)}`,
                            currentGrade: String(current.name),
                            targetGradeId: String(target._id),
                            targetGrade: String(target.name),
                          },
                        ]
                      : [];
                  })}
                  registrations={item.registrations.map((registration) => {
                    const student = registration.studentId as unknown as {
                      _id?: unknown;
                      firstName?: unknown;
                      lastName?: unknown;
                    };
                    const current = registration.currentGradeId as unknown as {
                      name?: unknown;
                    };
                    const target = registration.targetGradeId as unknown as {
                      name?: unknown;
                    };
                    return {
                      id: String(registration._id),
                      studentId: String(student?._id ?? registration.studentId),
                      name: `${String(student?.lastName ?? "")}, ${String(student?.firstName ?? "Alumno")}`,
                      currentGrade: String(current?.name ?? "—"),
                      targetGrade: String(target?.name ?? "—"),
                      result: registration.result,
                      observations: registration.observations.map(
                        (observation) => ({
                          id: String(observation._id),
                          category: observation.category,
                          description: observation.description,
                          status: observation.status,
                        }),
                      ),
                    };
                  })}
                />
              </details>
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
