import { describe, expect, it } from "vitest";
import { calculateAge, weightStatus } from "./age";
describe("student age", () => {
  it("handles a birthday not yet reached", () =>
    expect(
      calculateAge(
        new Date("2010-09-01T00:00:00Z"),
        new Date("2026-08-31T00:00:00Z"),
      ),
    ).toBe(15));
  it("handles birthday", () =>
    expect(
      calculateAge(
        new Date("2010-08-31T00:00:00Z"),
        new Date("2026-08-31T00:00:00Z"),
      ),
    ).toBe(16));
  it("rejects future dates", () =>
    expect(() =>
      calculateAge(new Date("2027-01-01"), new Date("2026-01-01")),
    ).toThrow(RangeError));
});
describe("weight freshness", () => {
  it("marks the threshold day stale", () =>
    expect(
      weightStatus(new Date("2026-06-02"), 90, new Date("2026-08-31")),
    ).toBe("stale"));
  it("marks absent measurements", () =>
    expect(weightStatus(undefined, 90)).toBe("missing"));
});
