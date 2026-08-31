import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { environment: process.env.NODE_ENV ?? "development" },
  redact: {
    paths: ["password", "token", "cookie", "authorization", "MONGODB_URI", "req.headers.cookie", "req.headers.authorization"],
    censor: "[REDACTED]",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
