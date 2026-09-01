import { describe, expect, it } from "vitest";
import { formatGradeRank } from "./format";

describe("formatGradeRank", () => {
  it("formats configurable Kyu and Dan grades for people", () => {
    expect(formatGradeRank("KYU", 10)).toBe("10° Kyu");
    expect(formatGradeRank("DAN", 1)).toBe("1° Dan");
    expect(formatGradeRank("KYU", 1, "10.º Kyu")).toBe("10° Kyu");
  });
});
