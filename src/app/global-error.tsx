"use client";

import { useEffect } from "react";

const styles = {
  body: {
    margin: 0,
    background: "#eff6ff",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
  },
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
  },
  card: {
    width: "min(560px, 100%)",
    padding: "32px",
    border: "1px solid #bfdbfe",
    borderRadius: "18px",
    background: "white",
    boxShadow: "0 18px 50px rgba(30, 64, 175, 0.12)",
  },
  button: {
    padding: "11px 18px",
    border: 0,
    borderRadius: "10px",
    background: "#1d4ed8",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
} as const;

export default function GlobalError({
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
    <html lang="es">
      <body style={styles.body}>
        <title>Error | Kyoku</title>
        <main style={styles.main}>
          <section style={styles.card} role="alert">
            <p style={{ color: "#1d4ed8", fontWeight: 700 }}>KYOKU</p>
            <h1>La aplicación encontró un problema</h1>
            <p>
              Reintentá la carga. Tus datos no se muestran en esta pantalla.
            </p>
            {error.digest ? <p>Referencia: {error.digest}</p> : null}
            <button type="button" style={styles.button} onClick={retry}>
              Reintentar
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
