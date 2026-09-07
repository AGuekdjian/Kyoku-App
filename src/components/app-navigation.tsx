"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { href: string; label: string; icon: string };
const primary: Item[] = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/students", label: "Alumnos", icon: "♙" },
  { href: "/exams", label: "Exámenes", icon: "✓" },
  { href: "/tournaments", label: "Torneos", icon: "♜" },
];
const management: Item[] = [
  { href: "/grades", label: "Grados", icon: "◇" },
  { href: "/activities", label: "Actividades", icon: "◷" },
  { href: "/documents", label: "Biblioteca", icon: "▤" },
];
const admin: Item[] = [
  { href: "/audit", label: "Auditoría", icon: "◎" },
  { href: "/users", label: "Usuarios", icon: "♧" },
  { href: "/settings", label: "Configuración", icon: "◉" },
  { href: "/status", label: "Estado", icon: "◒" },
];

function NavLink({ item, close }: { item: Item; close?: () => void }) {
  const pathname = usePathname();
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      className={active ? "is-active" : undefined}
      aria-current={active ? "page" : undefined}
      onClick={close}
    >
      <span className="nav-icon" aria-hidden="true">
        {item.icon}
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

export function DesktopNavigation({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav aria-label="Navegación principal">
      {[...primary, ...management, ...(isAdmin ? admin : [])].map((item) => (
        <NavLink item={item} key={item.href} />
      ))}
    </nav>
  );
}

export function MobileNavigation({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const extras = [...management, ...(isAdmin ? admin : [])];
  const extraActive = extras.some((item) => pathname.startsWith(item.href));
  return (
    <>
      {open ? (
        <button
          className="mobile-nav-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <section
        className={`mobile-more-sheet ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="mobile-sheet-handle" />
        <div className="mobile-sheet-heading">
          <div>
            <small>Gestión</small>
            <strong>Más opciones</strong>
          </div>
          <button aria-label="Cerrar menú" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <nav aria-label="Más opciones">
          {extras.map((item) => (
            <NavLink item={item} key={item.href} close={() => setOpen(false)} />
          ))}
        </nav>
      </section>
      <nav className="mobile-navigation" aria-label="Navegación principal">
        {primary.map((item) => (
          <NavLink item={item} key={item.href} />
        ))}
        <button
          type="button"
          className={open || extraActive ? "is-active" : undefined}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="nav-icon" aria-hidden="true">
            •••
          </span>
          <span>Más</span>
        </button>
      </nav>
    </>
  );
}
