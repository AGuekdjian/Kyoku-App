import type { Instrumentation } from "next";
import { logger } from "@/lib/logger";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;
  logger.error(
    {
      err: error,
      digest,
      method: request.method,
      path: request.path,
      routePath: context.routePath,
      routeType: context.routeType,
      routerKind: context.routerKind,
    },
    "Unhandled Next.js request error",
  );
};
