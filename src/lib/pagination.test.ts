import { describe, expect, it } from "vitest";
import { paginationInput, totalPages } from "./pagination";

describe("pagination", () => {
  it("normalizes invalid values and calculates the offset", () => {
    expect(paginationInput("3", "25")).toEqual({
      page: 3,
      limit: 25,
      skip: 50,
    });
    expect(paginationInput("-1", "nope")).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
  });

  it("caps page size and always returns at least one page", () => {
    expect(paginationInput(2, 500)).toEqual({ page: 2, limit: 100, skip: 100 });
    expect(totalPages(0, 20)).toBe(1);
    expect(totalPages(41, 20)).toBe(3);
  });
});
