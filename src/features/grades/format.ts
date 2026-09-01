export function formatGradeRank(
  type: "KYU" | "DAN" | string,
  order: number,
  name?: string,
) {
  const label = type === "DAN" ? "Dan" : type === "KYU" ? "Kyu" : type;
  const namedRank = name?.match(/\d+/)?.[0];
  return `${namedRank ?? order}° ${label}`;
}
