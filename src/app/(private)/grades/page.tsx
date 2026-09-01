import { connectDb } from "@/lib/db";
import { Grade } from "@/models/Grade";
import { ResourceForm } from "@/components/resource-form";
import { formatGradeRank } from "@/features/grades/format";
export const dynamic = "force-dynamic";
export default async function Grades() {
  await connectDb();
  const items = await Grade.find({ deletedAt: null }).sort({ order: 1 }).lean();
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Progresión</p>
          <h1>Grados</h1>
        </div>
      </header>
      <details className="panel">
        <summary>Nuevo grado</summary>
        <ResourceForm
          endpoint="/api/grades"
          fields={[
            { name: "name", label: "Nombre", required: true },
            { name: "order", label: "Orden", type: "number", required: true },
            {
              name: "type",
              label: "Tipo",
              options: [
                { value: "KYU", label: "Kyu" },
                { value: "DAN", label: "Dan" },
              ],
              required: true,
            },
            { name: "beltColor", label: "Color de cinturón" },
          ]}
        />
      </details>
      <section className="panel">
        <div className="card-list">
          {items.map((g) => (
            <article className="list-row" key={String(g._id)}>
              <span
                className="belt"
                style={{ background: String(g.beltColor ?? "#ddd") }}
              />
              <div>
                <strong>{String(g.name)}</strong>
                <small>
                  {formatGradeRank(
                    String(g.type),
                    Number(g.order),
                    String(g.name),
                  )}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
