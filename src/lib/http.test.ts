import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppError } from "./app-error";
import { apiError } from "./http";

describe("apiError", () => {
  it.each([
    ["UNAUTHORIZED", 401],
    ["FORBIDDEN", 403],
    ["NOT_FOUND", 404],
    ["RESULT_ALREADY_RECORDED", 409],
  ] as const)("maps %s to HTTP %s", async (code, status) => {
    const response = apiError(new AppError(code), "correlation-test");
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({
      error: code,
      correlationId: "correlation-test",
    });
  });

  it("keeps validation details and the public correlation id", async () => {
    const result = z
      .object({ name: z.string().min(2) })
      .safeParse({ name: "" });
    if (result.success) throw new Error("Expected validation to fail");
    const response = apiError(result.error, "validation-test");
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe("VALIDATION_ERROR");
    expect(body.correlationId).toBe("validation-test");
    expect(body.issues).toHaveLength(1);
  });
});
