"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
};

export function formPayload(form: HTMLFormElement, fields: Field[]) {
  const formData = new FormData(form);
  const data: Record<string, unknown> = Object.fromEntries(formData);
  for (const field of fields) {
    if (data[field.name] === "" && !field.required) {
      delete data[field.name];
      continue;
    }
    if (field.type === "number") data[field.name] = Number(data[field.name]);
    if (field.type === "checkbox") data[field.name] = formData.has(field.name);
  }
  return data;
}

export function ResourceForm({
  endpoint,
  fields,
  submitLabel = "Crear",
  method = "POST",
}: {
  endpoint: string;
  fields: Field[];
  submitLabel?: string;
  method?: "POST" | "PATCH";
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload(form, fields)),
      });
      if (!response.ok) {
        setError("No se pudo guardar. Revisá los datos.");
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
      {fields.map((field) => (
        <label key={field.name}>
          {field.label}
          {field.options ? (
            <select
              name={field.name}
              required={field.required}
              defaultValue={String(field.defaultValue ?? "")}
            >
              {field.options.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              defaultValue={
                typeof field.defaultValue === "boolean"
                  ? undefined
                  : field.defaultValue
              }
              defaultChecked={
                typeof field.defaultValue === "boolean"
                  ? field.defaultValue
                  : undefined
              }
            />
          )}
        </label>
      ))}
      {error ? (
        <p role="alert" className="form-error">
          {error}
        </p>
      ) : null}
      <button disabled={pending}>{pending ? "Guardando…" : submitLabel}</button>
    </form>
  );
}
