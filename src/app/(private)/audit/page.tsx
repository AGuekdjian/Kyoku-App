import { redirect } from "next/navigation";
import { PaginationNav } from "@/components/pagination-nav";
import { getSession } from "@/features/auth/session";
import { connectDb } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

export default async function Audit({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if ((await getSession())?.role !== "ADMIN") redirect("/");
  await connectDb();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const [items, total] = await Promise.all([
    AuditLog.find()
      .select("action entity timestamp actorId")
      .sort({ timestamp: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("actorId", "name")
      .lean(),
    AuditLog.countDocuments(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Trazabilidad</p>
          <h1>Auditoría</h1>
        </div>
      </header>
      <section className="panel">
        {items.length ? (
          items.map((item) => (
            <div className="list-row" key={String(item._id)}>
              <div>
                <strong>{String(item.action)}</strong>
                <small>
                  {String(item.entity)} ·{" "}
                  {new Date(item.timestamp as Date).toLocaleString("es-UY")}
                </small>
              </div>
              <span>
                {String(
                  (item.actorId as unknown as { name: string })?.name ??
                    "Sistema",
                )}
              </span>
            </div>
          ))
        ) : (
          <p className="empty">Todavía no hay eventos de auditoría.</p>
        )}
        <PaginationNav
          path="/audit"
          page={page}
          pages={pages}
          total={total}
          searchParams={params}
        />
      </section>
    </>
  );
}
