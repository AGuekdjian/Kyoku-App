import { describe, expect, it } from "vitest";
import { Activity } from "./Activity";
import { AuditLog } from "./AuditLog";
import { DojoDocument } from "./Document";
import { Exam } from "./Exam";
import { Tournament } from "./Tournament";

function hasIndex(
  model: { schema: { indexes(): [unknown, unknown][] } },
  expected: Record<string, number>,
) {
  return model.schema
    .indexes()
    .some(([fields]) => JSON.stringify(fields) === JSON.stringify(expected));
}

describe("query indexes", () => {
  it("covers the primary sorted list queries", () => {
    expect(hasIndex(Exam, { deletedAt: 1, date: -1 })).toBe(true);
    expect(hasIndex(Tournament, { deletedAt: 1, date: -1 })).toBe(true);
    expect(hasIndex(Activity, { deletedAt: 1, startDate: -1 })).toBe(true);
    expect(hasIndex(DojoDocument, { deletedAt: 1, createdAt: -1 })).toBe(true);
    expect(hasIndex(AuditLog, { timestamp: -1 })).toBe(true);
  });
});
