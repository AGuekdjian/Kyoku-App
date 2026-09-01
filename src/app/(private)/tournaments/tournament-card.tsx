"use client";

import { useState } from "react";
import { TournamentManager } from "./tournament-manager";

export function TournamentCard({
  id,
  name,
  date,
  registrationCount,
}: {
  id: string;
  name: string;
  date: string;
  registrationCount: number;
}) {
  const [opened, setOpened] = useState(false);
  return (
    <details
      className="tournament-card"
      onToggle={(event) => setOpened(event.currentTarget.open)}
    >
      <summary>
        <div>
          <strong>{name}</strong>
          <small>
            {date} · {registrationCount} inscriptos
          </small>
        </div>
        <span>Abrir gestión</span>
      </summary>
      {opened ? <TournamentManager tournamentId={id} /> : null}
      <a
        className="button export-button"
        href={`/api/tournaments/${id}/export`}
      >
        Exportar Excel
      </a>
    </details>
  );
}
