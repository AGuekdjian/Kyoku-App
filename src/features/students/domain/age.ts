export function calculateAge(birthDate: Date, at = new Date()): number {
  if (birthDate > at) throw new RangeError("Birth date cannot be in the future");
  let age = at.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayNotReached =
    at.getUTCMonth() < birthDate.getUTCMonth() ||
    (at.getUTCMonth() === birthDate.getUTCMonth() && at.getUTCDate() < birthDate.getUTCDate());
  if (birthdayNotReached) age -= 1;
  return age;
}

export function weightStatus(updatedAt: Date | undefined, staleAfterDays: number, at = new Date()): "missing" | "stale" | "current" {
  if (!updatedAt) return "missing";
  const days = Math.floor((at.getTime() - updatedAt.getTime()) / 86_400_000);
  return days >= staleAfterDays ? "stale" : "current";
}
