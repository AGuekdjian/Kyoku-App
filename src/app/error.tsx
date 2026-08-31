"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="error-page">
      <section className="error-card" role="alert">
        <p className="eyebrow">Error de la aplicación</p>
        <h1>No pudimos completar la operación</h1>
        <p>
          Podés reintentar ahora. Si el problema continúa, compartí la
          referencia con un administrador.
        </p>
        {error.digest ? (
          <p className="error-reference">
            Referencia: <code>{error.digest}</code>
          </p>
        ) : null}
        {process.env.NODE_ENV === "development" ? (
          <details>
            <summary>Detalle para desarrollo</summary>
            <pre>{error.message}</pre>
          </details>
        ) : null}
        <div className="error-actions">
          <button type="button" onClick={retry}>
            Reintentar
          </button>
          <Link href="/">Volver al inicio</Link>
        </div>
      </section>
    </main>
  );
}
