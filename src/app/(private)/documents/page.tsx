import { PaginationNav } from "@/components/pagination-nav";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { DojoDocument } from "@/models/Document";
import { UploadForm } from "./upload-form";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function Documents({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connectDb();
  const params = await searchParams;
  const { page, skip } = paginationInput(params.page, PAGE_SIZE);
  const filter = { deletedAt: null };
  const [items, total] = await Promise.all([
    DojoDocument.find(filter)
      .select("name category size version storageKey")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    DojoDocument.countDocuments(filter),
  ]);
  const pages = totalPages(total, PAGE_SIZE);
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Conocimiento</p>
          <h1>Biblioteca</h1>
          <p>Documentos institucionales y programas de grado.</p>
        </div>
      </header>
      <details className="panel">
        <summary>Subir PDF</summary>
        <UploadForm />
      </details>
      <section className="panel">
        {items.length ? (
          items.map((item) => (
            <div className="list-row" key={String(item._id)}>
              <div>
                <strong>{String(item.name)}</strong>
                <small>
                  {String(item.category)} ·{" "}
                  {Math.ceil(Number(item.size) / 1024)} KB
                </small>
              </div>
              <div className="row-actions">
                <span className="badge">v{String(item.version ?? "1")}</span>
                <a
                  href={`/api/documents/file?key=${encodeURIComponent(String(item.storageKey))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver PDF
                </a>
              </div>
            </div>
          ))
        ) : (
          <p className="empty">No hay documentos cargados.</p>
        )}
        <PaginationNav
          path="/documents"
          page={page}
          pages={pages}
          total={total}
          searchParams={params}
        />
      </section>
    </>
  );
}
