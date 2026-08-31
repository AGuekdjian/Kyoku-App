import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export function apiError(error: unknown, correlationId = crypto.randomUUID()) {
  if (error instanceof ZodError) return NextResponse.json({ error: "VALIDATION_ERROR", issues: error.issues, correlationId }, { status: 400 });
  if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED", correlationId }, { status: 401 });
  if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN", correlationId }, { status: 403 });
  if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "NOT_FOUND", correlationId }, { status: 404 });
  if (error instanceof Error && ["RESULT_ALREADY_RECORDED", "STALE_GRADE", "OBSERVATION_ALREADY_RESOLVED"].includes(error.message)) return NextResponse.json({ error: error.message, correlationId }, { status: 409 });
  logger.error({ err: error, correlationId }, "Unhandled API error");
  return NextResponse.json({ error: "INTERNAL_ERROR", correlationId }, { status: 500 });
}

export function pagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  return { page, limit, skip: (page - 1) * limit };
}
