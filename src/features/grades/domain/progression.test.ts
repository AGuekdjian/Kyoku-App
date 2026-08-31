import { describe, expect, it } from "vitest";
import { assertGradeProgression, nextGrade } from "./progression";
describe("grade progression", () => {
  const grades = [
    { id: "10", order: 1, active: true },
    { id: "9", order: 2, active: false },
    { id: "8", order: 3, active: true },
  ];
  it("skips inactive grades", () =>
    expect(nextGrade("10", grades)?.id).toBe("8"));
  it("rejects a regression", () =>
    expect(() => assertGradeProgression(grades[2], grades[0])).toThrow(
      "INVALID_GRADE_PROGRESSION",
    ));
});
