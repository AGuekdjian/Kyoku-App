"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Candidate = {
  id: string;
  name: string;
  currentGrade: string;
  targetGradeId: string;
  targetGrade: string;
};

type Observation = {
  id: string;
  category: string;
  description: string;
  status: string;
};

type Registration = {
  id: string;
  studentId: string;
  name: string;
  currentGrade: string;
  targetGrade: string;
  result: string;
  observations: Observation[];
};

const results = [
  ["PASSED", "Aprobado"],
  ["PASSED_WITH_OBSERVATION", "Aprobado con observación"],
  ["FAILED", "No aprobado"],
  ["ABSENT", "Ausente"],
] as const;

export function ExamManager({
  examId,
  candidates,
  registrations,
}: {
  examId: string;
  candidates: Candidate[];
  registrations: Registration[];
}) {
  const router = useRouter();
  const registered = new Set(registrations.map((item) => item.studentId));
  const available = candidates.filter((item) => !registered.has(item.id));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");

  async function register() {
    const registrationsToCreate = available
      .filter((candidate) => selected.has(candidate.id))
      .map((candidate) => ({
        studentId: candidate.id,
        targetGradeId: candidate.targetGradeId,
      }));
    const response = await fetch(`/api/exams/${examId}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrations: registrationsToCreate }),
    });
    setMessage(response.ok ? "Alumnos inscriptos." : "No se pudo inscribir.");
    if (response.ok) router.refresh();
  }

  async function result(
    event: FormEvent<HTMLFormElement>,
    registrationId: string,
  ) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const observations =
      data.result === "PASSED_WITH_OBSERVATION"
        ? [{ category: data.category, description: data.description }]
        : [];
    const response = await fetch(`/api/exams/${examId}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId,
        result: data.result,
        observations,
      }),
    });
    setMessage(
      response.ok
        ? "Resultado registrado."
        : "No se pudo registrar el resultado.",
    );
    if (response.ok) router.refresh();
  }

  async function resolve(observationId: string) {
    const response = await fetch(
      `/api/exams/${examId}/observations/${observationId}/resolve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Resuelto desde la gestión del examen" }),
      },
    );
    setMessage(
      response.ok ? "Pendiente resuelto." : "No se pudo resolver el pendiente.",
    );
    if (response.ok) router.refresh();
  }

  return (
    <div className="tournament-manager">
      <section className="registration-section">
        <h3>Inscripción múltiple</h3>
        <div className="student-selection">
          {available.map((candidate) => (
            <label className="student-option" key={candidate.id}>
              <input
                type="checkbox"
                checked={selected.has(candidate.id)}
                onChange={() =>
                  setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(candidate.id)) next.delete(candidate.id);
                    else next.add(candidate.id);
                    return next;
                  })
                }
              />
              <span>
                <strong>{candidate.name}</strong>
                <small>
                  {candidate.currentGrade} → {candidate.targetGrade}
                </small>
              </span>
            </label>
          ))}
        </div>
        <div className="registration-actions">
          <strong>{selected.size} seleccionados</strong>
          <button type="button" disabled={!selected.size} onClick={register}>
            Inscribir seleccionados
          </button>
        </div>
      </section>

      <section className="registration-section">
        <h3>Evaluaciones ({registrations.length})</h3>
        {registrations.map((registration) => (
          <div className="exam-registration" key={registration.id}>
            <div>
              <strong>{registration.name}</strong>
              <small>
                {registration.currentGrade} → {registration.targetGrade}
              </small>
            </div>
            {registration.result === "PENDING" ? (
              <form onSubmit={(event) => result(event, registration.id)}>
                <select name="result" defaultValue="PASSED">
                  {results.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input name="category" placeholder="Categoría pendiente" />
                <input name="description" placeholder="Descripción pendiente" />
                <button>Registrar</button>
              </form>
            ) : (
              <span className="badge">{registration.result}</span>
            )}
            {registration.observations.map((observation) => (
              <div className="observation-row" key={observation.id}>
                <span>
                  {observation.category}: {observation.description}
                </span>
                {observation.status === "PENDING" ? (
                  <button type="button" onClick={() => resolve(observation.id)}>
                    Marcar resuelto
                  </button>
                ) : (
                  <span className="badge">Resuelto</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
      {message ? (
        <p role="status" className="form-message">
          {message}
        </p>
      ) : null}
    </div>
  );
}
