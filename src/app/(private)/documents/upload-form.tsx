"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: new FormData(form),
      });
      if (!response.ok) {
        setError("Seleccioná un PDF de hasta 10 MB.");
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intentá nuevamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="resource-form" onSubmit={submit}>
      <label>
        Nombre
        <input name="name" required />
      </label>
      <label>
        Categoría
        <select name="category">
          <option>programas de grado</option>
          <option>reglamentos</option>
          <option>katas</option>
          <option>kihon</option>
          <option>otro</option>
        </select>
      </label>
      <label>
        Versión
        <input name="version" />
      </label>
      <label>
        Archivo PDF
        <input name="file" type="file" accept="application/pdf" required />
      </label>
      {error ? (
        <p role="alert" className="form-error">
          {error}
        </p>
      ) : null}
      <button disabled={pending}>
        {pending ? "Subiendo…" : "Subir documento"}
      </button>
    </form>
  );
}
