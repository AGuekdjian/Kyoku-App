import Link from "next/link";
import { notFound } from "next/navigation";
import { formatGradeRank } from "@/features/grades/format";
import {
  calculateAge,
  weightAgeDays,
  weightStatus,
} from "@/features/students/domain/age";
import { connectDb } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { Exam } from "@/models/Exam";
import { GradeHistory } from "@/models/GradeHistory";
import { Settings } from "@/models/Settings";
import { Student } from "@/models/Student";
import { Tournament } from "@/models/Tournament";

export const dynamic = "force-dynamic";

type TimelineItem = {
  date: Date;
  title: string;
  detail: string;
  kind: "grade" | "exam" | "observation" | "activity" | "tournament";
};

const resultLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PASSED: "Aprobado",
  PASSED_WITH_OBSERVATION: "Aprobado con observación",
  FAILED: "No aprobado",
  ABSENT: "Ausente",
  PARTICIPATED: "Participó",
  FIRST: "1° puesto",
  SECOND: "2° puesto",
  THIRD: "3° puesto",
  OTHER: "Otro",
};

export default async function StudentHistory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDb();
  const { id } = await params;
  const [student, settings, gradeChanges, exams, activities, tournaments] =
    await Promise.all([
      Student.findOne({ _id: id, deletedAt: null })
        .populate("currentGradeId", "name type order")
        .lean(),
      Settings.findOne({ key: "dojo" }).select("weightStaleDays").lean(),
      GradeHistory.find({ studentId: id })
        .populate("previousGradeId", "name type order")
        .populate("newGradeId", "name type order")
        .sort({ date: -1 })
        .lean(),
      Exam.find({ "registrations.studentId": id, deletedAt: null })
        .select("name date registrations")
        .sort({ date: -1 })
        .lean(),
      Activity.find({ participants: id, deletedAt: null })
        .select("name type startDate location")
        .sort({ startDate: -1 })
        .lean(),
      Tournament.find({ "registrations.studentId": id, deletedAt: null })
        .select("name date registrations")
        .sort({ date: -1 })
        .lean(),
    ]);
  if (!student) notFound();

  const timeline: TimelineItem[] = [];
  for (const change of gradeChanges) {
    const next = change.newGradeId as unknown as {
      name?: string;
      type?: string;
      order?: number;
    } | null;
    timeline.push({
      date: new Date(change.date),
      title: "Cambio de grado",
      detail: next
        ? `${String(next.name)} · ${formatGradeRank(String(next.type), Number(next.order), String(next.name))}${change.notes ? ` · ${String(change.notes)}` : ""}`
        : String(change.notes ?? "Grado actualizado"),
      kind: "grade",
    });
  }
  for (const exam of exams) {
    const registration = exam.registrations.find(
      (item) => String(item.studentId) === id,
    );
    if (!registration) continue;
    timeline.push({
      date: new Date(exam.date),
      title: `Examen · ${String(exam.name)}`,
      detail:
        resultLabels[String(registration.result)] ??
        String(registration.result),
      kind: "exam",
    });
    for (const observation of registration.observations) {
      timeline.push({
        date: new Date(observation.resolvedAt ?? observation.createdAt),
        title:
          observation.status === "RESOLVED"
            ? "Revisión aprobada"
            : "Observación pendiente",
        detail: `${String(observation.category)} · ${String(observation.description)}${observation.resolutionNotes ? ` · ${String(observation.resolutionNotes)}` : ""}`,
        kind: "observation",
      });
    }
  }
  for (const activity of activities)
    timeline.push({
      date: new Date(activity.startDate),
      title: `Actividad · ${String(activity.name)}`,
      detail: `${String(activity.type)}${activity.location ? ` · ${String(activity.location)}` : ""}`,
      kind: "activity",
    });
  for (const tournament of tournaments) {
    const registration = tournament.registrations.find(
      (item) => String(item.studentId) === id,
    );
    if (!registration) continue;
    timeline.push({
      date: new Date(tournament.date),
      title: `Torneo · ${String(tournament.name)}`,
      detail: `${resultLabels[String(registration.result)] ?? "Inscripto"}${registration.resultNotes ? ` · ${String(registration.resultNotes)}` : ""}`,
      kind: "tournament",
    });
  }
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

  const grade = student.currentGradeId as unknown as {
    name?: string;
    type?: string;
    order?: number;
  } | null;
  const staleDays = Number(settings?.weightStaleDays ?? 90);
  const freshness = weightStatus(
    student.weightUpdatedAt ?? undefined,
    staleDays,
  );
  const weightAge = weightAgeDays(student.weightUpdatedAt ?? undefined);
  const weightLabel =
    student.weight == null
      ? "Sin registrar"
      : `${Number(student.weight)} kg · ${weightAge == null ? "sin fecha" : `hace ${weightAge} días`}${freshness === "stale" ? " · requiere actualización" : ""}`;

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Ficha del alumno</p>
          <h1>
            {String(student.firstName)} {String(student.lastName)}
          </h1>
          <p>
            {calculateAge(student.birthDate)} años ·{" "}
            {grade?.name ?? "Sin grado"}
          </p>
        </div>
        <Link className="secondary-button" href="/students">
          Volver a alumnos
        </Link>
      </header>
      <section className="panel">
        <div className="stats-grid">
          <article>
            <p>Estado</p>
            <strong>{student.active ? "Activo" : "Inactivo"}</strong>
          </article>
          <article>
            <p>Peso</p>
            <strong>{weightLabel}</strong>
          </article>
          <article>
            <p>Altura</p>
            <strong>
              {student.height == null
                ? "Sin registrar"
                : `${Number(student.height)} cm`}
            </strong>
          </article>
          <article>
            <p>Grado</p>
            <strong>
              {grade
                ? formatGradeRank(
                    String(grade.type),
                    Number(grade.order),
                    String(grade.name),
                  )
                : "—"}
            </strong>
          </article>
        </div>
      </section>
      <section className="panel">
        <h2>Historial cronológico</h2>
        <div className="card-list">
          {timeline.map((item, index) => (
            <article
              className="list-row"
              key={`${item.kind}-${item.date.toISOString()}-${index}`}
            >
              <div>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
              </div>
              <time dateTime={item.date.toISOString()}>
                {item.date.toLocaleDateString("es-UY")}
              </time>
            </article>
          ))}
          {!timeline.length ? (
            <p className="empty">Todavía no hay eventos en el historial.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
