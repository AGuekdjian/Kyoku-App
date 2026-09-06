"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StudentOption = { id: string; name: string };

export function ActivityParticipants({
  activityId,
  students,
  initialIds,
}: {
  activityId: string;
  students: StudentOption[];
  initialIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set(initialIds));
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const visible = students.filter((student) =>
    student.name.toLowerCase().includes(query.toLowerCase()),
  );

  async function save() {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/activities/${activityId}/participants`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: [...selected] }),
    });
    setPending(false);
    setMessage(
      response.ok
        ? "Participantes actualizados."
        : "No se pudieron guardar los participantes.",
    );
    if (response.ok) router.refresh();
  }

  return (
    <details>
      <summary>Participantes ({selected.size})</summary>
      <div className="registration-section">
        <label>
          Buscar alumno
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="student-selection">
          {visible.map((student) => (
            <label className="student-option" key={student.id}>
              <input
                type="checkbox"
                checked={selected.has(student.id)}
                onChange={() =>
                  setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(student.id)) next.delete(student.id);
                    else next.add(student.id);
                    return next;
                  })
                }
              />
              <span>{student.name}</span>
            </label>
          ))}
        </div>
        <button type="button" disabled={pending} onClick={save}>
          {pending ? "Guardando…" : "Guardar participantes"}
        </button>
        {message ? (
          <p className="form-message" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </details>
  );
}
