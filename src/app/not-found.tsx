import Link from "next/link";
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-blue-950/5 sm:p-10">
        <p className="text-xs font-bold tracking-widest text-blue-700 uppercase">
          Error 404
        </p>
        <h1 className="my-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mb-6 text-slate-500">
          La dirección solicitada no existe.
        </p>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 font-bold text-white no-underline hover:bg-blue-800"
          href="/"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
