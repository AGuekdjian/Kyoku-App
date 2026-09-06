"use client";

import { useEffect } from "react";
import { APP_NAME } from "@/lib/brand";

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
      <body className="m-0 bg-blue-50 text-[#172033]">
        <title>Error | {APP_NAME}</title>
        <main className="grid min-h-dvh place-items-center p-4 sm:p-6">
          <section
            className="w-full max-w-xl rounded-3xl border border-blue-200 bg-white p-6 shadow-xl shadow-blue-950/10 sm:p-9"
            role="alert"
          >
            <p className="font-bold text-blue-700">{APP_NAME}</p>
            <h1 className="my-3 text-3xl font-bold tracking-tight sm:text-4xl">
              La aplicación encontró un problema
            </h1>
            <p className="text-slate-600">
              Reintentá la carga. Tus datos no se muestran en esta pantalla.
            </p>
            {error.digest ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm">
                Referencia: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              className="mt-4 min-h-11 rounded-xl bg-blue-700 px-5 py-2.5 font-bold text-white hover:bg-blue-800"
              onClick={retry}
            >
              Reintentar
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
