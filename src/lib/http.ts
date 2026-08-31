import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";
import { paginationInput } from "@/lib/pagination";
import { AppError, appErrorStatus } from "@/lib/app-error";

export function apiError(error: unknown, correlationId = crypto.randomUUID()) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: error.issues, correlationId },
      { status: 400 },
    );
  if (error instanceof AppError)
    return NextResponse.json(
      { error: error.code, correlationId },
      { status: appErrorStatus[error.code] },
    );
  logger.error({ err: error, correlationId }, "Unhandled API error");
  return NextResponse.json(
    { error: "INTERNAL_ERROR", correlationId },
    { status: 500 },
  );
}

export function pagination(searchParams: URLSearchParams) {
  return paginationInput(
    searchParams.get("page") ?? undefined,
    searchParams.get("limit") ?? undefined,
  );
}
