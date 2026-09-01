"use client";

import { useRef } from "react";
import { ResourceForm, type Field } from "@/components/resource-form";

export function StudentEditor({
  endpoint,
  fields,
  studentName,
}: {
  endpoint: string;
  fields: Field[];
  studentName: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className="table-action"
        onClick={() => dialog.current?.showModal()}
      >
        Editar
      </button>
      <dialog className="student-dialog" ref={dialog}>
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Ficha del alumno</p>
            <h2>Editar {studentName}</h2>
            <p>Actualizá los datos personales, médicos y deportivos.</p>
          </div>
          <button
            type="button"
            className="dialog-close"
            aria-label="Cerrar"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <ResourceForm
          endpoint={endpoint}
          method="PATCH"
          submitLabel="Guardar cambios"
          fields={fields}
          onSuccess={() => dialog.current?.close()}
        />
      </dialog>
    </>
  );
}
