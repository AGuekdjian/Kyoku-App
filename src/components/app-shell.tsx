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
        <Link href="/" className="brand">
          <span>{APP_INITIALS}</span>
          <div>
            <strong>{APP_NAME}</strong>
            <small>{APP_DESCRIPTION}</small>
          </div>
        </Link>
        <nav aria-label="Navegación principal">
          {items.map(([href, label]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
          {session.role === "ADMIN" ? (
            <>
              <Link href="/audit">Auditoría</Link>
              <Link href="/users">Usuarios</Link>
              <Link href="/settings">Configuración</Link>
              <Link href="/status">Estado</Link>
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
