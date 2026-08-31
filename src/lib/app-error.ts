export const appErrorCodes = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RESULT_ALREADY_RECORDED",
  "STALE_GRADE",
  "OBSERVATION_ALREADY_RESOLVED",
] as const;

export type AppErrorCode = (typeof appErrorCodes)[number];

export class AppError extends Error {
  constructor(readonly code: AppErrorCode) {
    super(code);
    this.name = "AppError";
  }
}

export const appErrorStatus: Record<AppErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RESULT_ALREADY_RECORDED: 409,
  STALE_GRADE: 409,
  OBSERVATION_ALREADY_RESOLVED: 409,
};
