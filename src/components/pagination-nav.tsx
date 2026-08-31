import Link from "next/link";

type SearchValue = string | string[] | undefined;

export function pageUrl(
  path: string,
  page: number,
  searchParams: Record<string, SearchValue>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else params.set(key, value);
  }
  params.set("page", String(page));
  return `${path}?${params.toString()}`;
}

export function PaginationNav({
  path,
  page,
  pages,
  total,
  searchParams = {},
}: {
  path: string;
  page: number;
  pages: number;
  total: number;
  searchParams?: Record<string, SearchValue>;
}) {
  if (pages <= 1)
    return total > 0 ? (
      <p className="pagination-summary">{total} registros</p>
    ) : null;
  return (
    <nav className="pagination" aria-label="Paginación">
      <p>
        Página {page} de {pages} · {total} registros
      </p>
      <div>
        {page > 1 ? (
          <Link
            className="button secondary"
            href={pageUrl(path, page - 1, searchParams)}
          >
            Anterior
          </Link>
        ) : (
          <span />
        )}
        {page < pages ? (
          <Link
            className="button secondary"
            href={pageUrl(path, page + 1, searchParams)}
          >
            Siguiente
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
