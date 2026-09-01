"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type StudentOption = {
  id: string;
  name: string;
  age: number;
  weight?: number;
  height?: number;
  gradeId: string;
  grade: string;
};

type Registration = {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  result?: string;
  resultNotes?: string;
};

const resultOptions = [
  ["PARTICIPATED", "Participó"],
  ["FIRST", "1° puesto"],
  ["SECOND", "2° puesto"],
  ["THIRD", "3° puesto"],
  ["OTHER", "Otro"],
] as const;

async function getManagement(tournamentId: string, signal?: AbortSignal) {
  const response = await fetch(
    `/api/tournaments/${tournamentId}/registrations`,
    { signal },
  );
  if (!response.ok) throw new Error("load failed");
  return response.json() as Promise<{
    students: StudentOption[];
    registrations: Registration[];
  }>;
}

export function TournamentManager({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getManagement(tournamentId, controller.signal)
      .then((data) => {
        setStudents(data.students);
        setRegistrations(data.registrations);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError")
          setMessage("No se pudo cargar la gestión del torneo.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [tournamentId]);
  const registered = useMemo(
    () => new Set(registrations.map((item) => item.studentId)),
    [registrations],
  );
  const available = students.filter((student) => !registered.has(student.id));
  const grades = [...new Set(available.map((student) => student.grade))];
  const visible = available.filter(
    (student) =>
      (!query || student.name.toLowerCase().includes(query.toLowerCase())) &&
      (!grade || student.grade === grade),
  );

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function register() {
    if (!selected.size) return;
    setPending(true);
    setMessage("");
    const response = await fetch(
      `/api/tournaments/${tournamentId}/registrations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: [...selected] }),
      },
    );
    setPending(false);
    if (!response.ok) {
      setMessage("No se pudo completar la inscripción.");
      return;
    }
    setSelected(new Set());
    setMessage("Alumnos inscriptos correctamente.");
    const data = await getManagement(tournamentId);
    setStudents(data.students);
    setRegistrations(data.registrations);
    router.refresh();
  }

  async function saveResult(
    event: FormEvent<HTMLFormElement>,
    registrationId: string,
  ) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(
      `/api/tournaments/${tournamentId}/registrations`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, ...data }),
      },
    );
    setMessage(
      response.ok ? "Resultado guardado." : "No se pudo guardar el resultado.",
    );
    if (response.ok) router.refresh();
    if (response.ok) {
      const refreshed = await getManagement(tournamentId);
      setRegistrations(refreshed.registrations);
    }
  }

  return (
    <div className="tournament-manager">
      {loading ? (
        <div className="manager-skeleton" aria-label="Cargando gestión">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {!loading ? (
        <>
          <section className="registration-section">
            <h3>Inscribir alumnos</h3>
            <div className="registration-toolbar">
              <label>
                Buscar
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nombre o apellido"
                />
              </label>
              <label>
                Grado
                <select
                  value={grade}
                  onChange={(event) => setGrade(event.target.value)}
                >
                  <option value="">Todos</option>
                  {grades.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelected(new Set(visible.map((student) => student.id)))
                }
              >
                Seleccionar visibles
              </button>
            </div>
            <div
              className="student-selection"
              role="group"
              aria-label="Alumnos disponibles"
            >
              {visible.map((student) => (
                <label key={student.id} className="student-option">
                  <input
                    type="checkbox"
                    checked={selected.has(student.id)}
                    onChange={() => toggle(student.id)}
                  />
                  <span>
                    <strong>{student.name}</strong>
                    <small>
                      {student.age} años · {student.weight ?? "—"} kg ·{" "}
                      {student.height ?? "—"} cm · {student.grade}
                    </small>
                  </span>
                </label>
              ))}
              {!visible.length ? (
                <p className="empty compact">No hay alumnos disponibles.</p>
              ) : null}
            </div>
            <div className="registration-actions">
              <strong>{selected.size} seleccionados</strong>
              <button
                type="button"
                disabled={!selected.size || pending}
                onClick={register}
              >
                {pending ? "Inscribiendo…" : "Inscribir seleccionados"}
              </button>
            </div>
          </section>

          <section className="registration-section">
            <h3>Inscriptos ({registrations.length})</h3>
            {registrations.map((registration) => (
              <form
                className="result-row"
                key={registration.id}
                onSubmit={(event) => saveResult(event, registration.id)}
              >
                <span>
                  <strong>{registration.name}</strong>
                  <small>{registration.grade}</small>
                </span>
                <select
                  name="result"
                  defaultValue={registration.result ?? "PARTICIPATED"}
                >
                  {resultOptions.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  name="resultNotes"
                  defaultValue={registration.resultNotes}
                  placeholder="Detalle opcional"
                />
                <button>Guardar</button>
              </form>
            ))}
            {!registrations.length ? (
              <p className="empty compact">Todavía no hay inscriptos.</p>
            ) : null}
          </section>
          {message ? (
            <p className="form-message" role="status">
              {message}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
