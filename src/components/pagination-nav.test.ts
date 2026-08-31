import { describe, expect, it } from "vitest";
import { pageUrl } from "./pagination-nav";

describe("pageUrl", () => {
  it("preserves filters while replacing the current page", () => {
    expect(
      pageUrl("/students", 3, { page: "8", q: "ana", grade: ["kyu", "dan"] }),
    ).toBe("/students?q=ana&grade=kyu&grade=dan&page=3");
  });

  it("omits undefined parameters", () => {
    expect(pageUrl("/activities", 2, { q: undefined })).toBe(
      "/activities?page=2",
    );
  });
});
