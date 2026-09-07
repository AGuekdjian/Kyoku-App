import Link from "next/link";
import { logout } from "@/features/auth/actions";
import type { Session } from "@/features/auth/session";
import { APP_DESCRIPTION, APP_INITIALS, APP_NAME } from "@/lib/brand";
import { DesktopNavigation, MobileNavigation } from "./app-navigation";

export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <div className="mobile-header">
        <Link href="/" className="brand" prefetch={false}>
          <span>{APP_INITIALS}</span>
          <div>
            <strong>{APP_NAME}</strong>
            <small>{APP_DESCRIPTION}</small>
          </div>
        </Link>
        <form action={logout} className="mobile-profile">
          <span>{session.name.slice(0, 2).toUpperCase()}</span>
          <button className="link-button" aria-label="Cerrar sesión">
            Salir
          </button>
        </form>
      </div>
      <aside className="sidebar">
        <Link href="/" className="brand" prefetch={false}>
          <span>{APP_INITIALS}</span>
          <div>
            <strong>{APP_NAME}</strong>
            <small>{APP_DESCRIPTION}</small>
          </div>
        </Link>
        <DesktopNavigation isAdmin={session.role === "ADMIN"} />
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
      <MobileNavigation isAdmin={session.role === "ADMIN"} />
    </div>
  );
}
