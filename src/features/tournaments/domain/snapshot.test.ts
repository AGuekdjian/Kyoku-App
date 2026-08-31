import { describe, expect, it } from "vitest";
import { createTournamentSnapshot } from "./snapshot";
describe("tournament snapshot", () => {
  it("keeps historical values independent of later mutation", () => {
    const student = {
      firstName: "Ana",
      lastName: "Pérez",
      birthDate: new Date("2013-01-01"),
      weight: 48,
      height: 158,
      currentGradeId: "g6",
    };
    const snapshot = createTournamentSnapshot(
      student,
      "6.º Kyu",
      new Date("2026-06-01"),
    );
    student.weight = 62;
    student.currentGradeId = "g3";
    expect(snapshot).toMatchObject({
      fullName: "Ana Pérez",
      age: 13,
      weight: 48,
      height: 158,
      gradeId: "g6",
      gradeName: "6.º Kyu",
    });
  });
});
