import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import { APP_INITIALS, APP_NAME } from "@/lib/brand";
import { LoginForm } from "./login-form";
export const metadata: Metadata = { title: "Ingresar" };
export default async function Login() {
  if (await getSession()) redirect("/");
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">{APP_INITIALS}</div>
        <h1>Ingresá a {APP_NAME}</h1>
        <p>Gestión segura del dojo.</p>
        <LoginForm />
      </section>
    </main>
  );
}
