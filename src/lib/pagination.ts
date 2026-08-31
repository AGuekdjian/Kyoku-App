export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

function positiveInteger(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function paginationInput(
  pageValue?: string | number,
  limitValue?: string | number,
) {
  const page = positiveInteger(pageValue, 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    positiveInteger(limitValue, DEFAULT_PAGE_SIZE),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}
