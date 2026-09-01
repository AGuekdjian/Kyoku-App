import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm } from "@/components/resource-form";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { Tournament } from "@/models/Tournament";
import { TournamentCard } from "./tournament-card";

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
  const [items, total] = await Promise.all([
    Tournament.aggregate([
      { $match: filter },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: PAGE_SIZE },
      {
        $project: {
          name: 1,
          date: 1,
          registrationCount: { $size: { $ifNull: ["$registrations", []] } },
        },
      },
    ]),
    Tournament.countDocuments(filter),
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
            <TournamentCard
              key={String(item._id)}
              id={String(item._id)}
              name={String(item.name)}
              date={new Date(item.date as Date).toLocaleDateString("es-UY")}
              registrationCount={Number(item.registrationCount)}
            />
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
