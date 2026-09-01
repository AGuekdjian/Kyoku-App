import Link from "next/link";
import { logout } from "@/features/auth/actions";
import type { Session } from "@/features/auth/session";
import { APP_DESCRIPTION, APP_INITIALS, APP_NAME } from "@/lib/brand";

const items = [
  ["/", "Resumen"],
  ["/students", "Alumnos"],
  ["/grades", "Grados"],
  ["/exams", "Exámenes"],
  ["/activities", "Actividades"],
  ["/tournaments", "Torneos"],
  ["/documents", "Biblioteca"],
];

export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" prefetch={false}>
          <span>{APP_INITIALS}</span>
          <div>
            <strong>{APP_NAME}</strong>
            <small>{APP_DESCRIPTION}</small>
          </div>
        </Link>
        <nav aria-label="Navegación principal">
          {items.map(([href, label]) => (
            <Link href={href} key={href} prefetch={false}>
              {label}
            </Link>
          ))}
          {session.role === "ADMIN" ? (
            <>
              <Link href="/audit" prefetch={false}>
                Auditoría
              </Link>
              <Link href="/users" prefetch={false}>
                Usuarios
              </Link>
              <Link href="/settings" prefetch={false}>
                Configuración
              </Link>
              <Link href="/status" prefetch={false}>
                Estado
              </Link>
            </>
          ) : null}
        </nav>
        <form action={logout} className="profile">
          <span>{session.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{session.name}</strong>
            <small>{session.role}</small>
          </div>
          <button className="link-button">Salir</button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
