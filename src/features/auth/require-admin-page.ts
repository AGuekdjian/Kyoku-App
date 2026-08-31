import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAdminPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/");
  return session;
}
