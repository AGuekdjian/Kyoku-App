import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import { LoginForm } from "./login-form";
export const metadata: Metadata = { title: "Ingresar" };
export default async function Login() {
  if (await getSession()) redirect("/");
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">極</div>
        <h1>Ingresá a Kyoku</h1>
        <p>Gestión segura del dojo.</p>
        <LoginForm />
      </section>
    </main>
  );
}
