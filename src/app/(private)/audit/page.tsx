import { PaginationNav } from "@/components/pagination-nav";
import { requireAdminPage } from "@/features/auth/require-admin-page";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { AuditLog } from "@/models/AuditLog";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

export default async function Audit({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  await connectDb();
  const params = await searchParams;
  const { page, skip } = paginationInput(params.page, PAGE_SIZE);
  const [items, total] = await Promise.all([
    AuditLog.find()
      .select("action entity timestamp actorId")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate("actorId", "name")
      .lean(),
    AuditLog.countDocuments(),
  ]);
  const pages = totalPages(total, PAGE_SIZE);
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
