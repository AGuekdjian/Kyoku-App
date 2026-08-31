import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Activity } from "@/models/Activity";
import { Exam } from "@/models/Exam";
import { Settings } from "@/models/Settings";
import { Student } from "@/models/Student";
import { Tournament } from "@/models/Tournament";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await connectDb();
  const now = new Date();
  const settings = await Settings.findOne({ key: "dojo" })
    .select("weightStaleDays")
    .lean();
  const staleDate = new Date(
    now.getTime() - Number(settings?.weightStaleDays ?? 90) * 86_400_000,
  );
  const [
    students,
    staleWeights,
    observationRows,
    exams,
    tournaments,
    activities,
  ] = await Promise.all([
    Student.countDocuments({ active: true, deletedAt: null }),
    Student.countDocuments({
      active: true,
      deletedAt: null,
      $or: [{ weightUpdatedAt: { $lt: staleDate } }, { weightUpdatedAt: null }],
    }),
    Exam.aggregate<{ total: number }>([
      { $match: { deletedAt: null } },
      { $unwind: "$registrations" },
      { $unwind: "$registrations.observations" },
      { $match: { "registrations.observations.status": "PENDING" } },
      { $count: "total" },
    ]),
    Exam.find({ date: { $gte: now }, deletedAt: null })
      .select("name date")
      .sort({ date: 1 })
      .limit(3)
      .lean(),
    Tournament.find({ date: { $gte: now }, deletedAt: null })
      .select("name date")
      .sort({ date: 1 })
      .limit(3)
      .lean(),
    Activity.find({ deletedAt: null })
      .select("name type startDate")
      .sort({ startDate: -1 })
      .limit(4)
      .lean(),
  ]);
  const observations = observationRows[0]?.total ?? 0;
  const upcoming = [...exams, ...tournaments]
    .sort(
      (a, b) =>
        new Date(a.date as Date).getTime() - new Date(b.date as Date).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Panel del dojo</p>
          <h1>Resumen</h1>
          <p>Lo importante del dojo, en un solo lugar.</p>
        </div>
        <Link className="button" href="/students">
          Gestionar alumnos
        </Link>
      </header>
      <section aria-labelledby="current-status">
        <h2 id="current-status">Estado actual</h2>
        <div className="metrics">
          <article>
            <p>Alumnos activos</p>
            <strong>{students}</strong>
            <small>Plantel actual</small>
          </article>
          <article>
            <p>Observaciones pendientes</p>
            <strong>{observations}</strong>
            <small>Ítems por revisar</small>
          </article>
          <article>
            <p>Pesos a actualizar</p>
            <strong>{staleWeights}</strong>
            <small>Sin dato o fuera de vigencia</small>
          </article>
        </div>
      </section>
      <div className="columns">
        <section>
          <h2>Próximamente</h2>
          {upcoming.length === 0 ? (
            <p className="empty">No hay eventos programados.</p>
          ) : (
            upcoming.map((item) => (
              <div className="list-row" key={String(item._id)}>
                <strong>{String(item.name)}</strong>
                <time>
                  {new Date(item.date as Date).toLocaleDateString("es-UY")}
                </time>
              </div>
            ))
          )}
        </section>
        <section>
          <h2>Actividad reciente</h2>
          {activities.length === 0 ? (
            <p className="empty">Aún no hay actividad.</p>
          ) : (
            activities.map((item) => (
              <div className="list-row" key={String(item._id)}>
                <strong>{String(item.name)}</strong>
                <small>{String(item.type)}</small>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
