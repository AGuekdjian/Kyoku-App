export const roles = ["ADMIN", "INSTRUCTOR"] as const;
export type Role = (typeof roles)[number];

export type Permission =
  | "students:manage"
  | "activities:manage"
  | "exams:manage"
  | "tournaments:manage"
  | "settings:manage"
  | "users:manage"
  | "audit:read";

const permissions: Record<Role, ReadonlySet<Permission>> = {
  ADMIN: new Set(["students:manage", "activities:manage", "exams:manage", "tournaments:manage", "settings:manage", "users:manage", "audit:read"]),
  INSTRUCTOR: new Set(["students:manage", "activities:manage", "exams:manage", "tournaments:manage"]),
};

export function can(role: Role, permission: Permission): boolean {
  return permissions[role].has(permission);
}

export function authorize(role: Role, permission: Permission): void {
  if (!can(role, permission)) throw new Error("FORBIDDEN");
}
