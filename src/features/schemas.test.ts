import { describe, expect, it } from "vitest";
import { activityInputSchema } from "./activities/schema";
import { examInputSchema } from "./exams/schema";
import { gradeInputSchema } from "./grades/schema";
import { settingsInputSchema } from "./settings/schema";
import { tournamentInputSchema } from "./tournaments/schema";
import { userInputSchema } from "./users/schema";

describe("feature input contracts", () => {
  it("keeps defaults and date coercion stable", () => {
    expect(
      activityInputSchema.parse({
        name: "Seminario",
        type: "SEMINAR",
        startDate: "2026-01-01",
      }).participants,
    ).toEqual([]);
    expect(
      examInputSchema.parse({ name: "Examen", date: "2026-01-01" }).status,
    ).toBe("DRAFT");
    expect(
      tournamentInputSchema.parse({ name: "Torneo", date: "2026-01-01" })
        .status,
    ).toBe("DRAFT");
    expect(
      gradeInputSchema.parse({ name: "10º Kyu", order: 1, type: "KYU" }).active,
    ).toBe(true);
  });

  it("preserves validation boundaries", () => {
    expect(
      settingsInputSchema.safeParse({ dojoName: "K", weightStaleDays: 0 })
        .success,
    ).toBe(false);
    expect(
      userInputSchema.safeParse({
        name: "Admin",
        email: "bad",
        password: "short",
        role: "ADMIN",
      }).success,
    ).toBe(false);
    expect(
      activityInputSchema.safeParse({
        name: "Evento",
        type: "OTHER",
        startDate: "2026-02-01",
        endDate: "2026-01-01",
      }).success,
    ).toBe(false);
  });
});
