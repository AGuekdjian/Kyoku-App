export const examResults = ["PENDING", "PASSED", "PASSED_WITH_OBSERVATION", "FAILED", "ABSENT"] as const;
export type ExamResult = (typeof examResults)[number];
export type ObservationInput = { category: string; description: string };

export type ExamDecision = {
  promote: boolean;
  createGradeHistory: boolean;
  observations: Array<ObservationInput & { status: "PENDING" }>;
};

export function decideExamResult(result: ExamResult, observations: readonly ObservationInput[] = []): ExamDecision {
  if (result === "PASSED_WITH_OBSERVATION" && observations.length === 0) {
    throw new Error("OBSERVATION_REQUIRED");
  }
  if (result !== "PASSED_WITH_OBSERVATION" && observations.length > 0) {
    throw new Error("OBSERVATIONS_NOT_ALLOWED");
  }
  const promote = result === "PASSED" || result === "PASSED_WITH_OBSERVATION";
  return {
    promote,
    createGradeHistory: promote,
    observations: observations.map((item) => ({ ...item, status: "PENDING" })),
  };
}

export function resolveObservation(status: "PENDING" | "RESOLVED", resolvedAt = new Date()): { status: "RESOLVED"; resolvedAt: Date } {
  if (status === "RESOLVED") throw new Error("OBSERVATION_ALREADY_RESOLVED");
  return { status: "RESOLVED", resolvedAt };
}
