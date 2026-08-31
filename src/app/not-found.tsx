import Link from "next/link";
export default function NotFound() {
  return (
    <main>
      <h1>Página no encontrada</h1>
      <p>La dirección solicitada no existe.</p>
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}
