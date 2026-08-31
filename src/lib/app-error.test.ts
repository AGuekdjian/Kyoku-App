import { describe, expect, it } from "vitest";
import { AppError, appErrorStatus } from "./app-error";

describe("AppError", () => {
  it("keeps the public code as its message and maps every status", () => {
    const error = new AppError("STALE_GRADE");
    expect(error.message).toBe("STALE_GRADE");
    expect(appErrorStatus[error.code]).toBe(409);
    expect(Object.keys(appErrorStatus)).toHaveLength(6);
  });
});
