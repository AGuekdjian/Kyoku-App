import { z } from "zod";
import { examResults } from "./domain/result";

export const examInputSchema = z.object({
  name: z.string().min(2),
  date: z.coerce.date(),
  location: z.string().optional(),
  examiner: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(["DRAFT", "SCHEDULED", "COMPLETED", "CLOSED"])
    .default("DRAFT"),
  registrations: z
    .array(
      z.object({
        studentId: z.string(),
        currentGradeId: z.string(),
        targetGradeId: z.string(),
      }),
    )
    .default([]),
});

export const examResultInputSchema = z.object({
  registrationId: z.string(),
  result: z.enum(examResults),
  observations: z
    .array(
      z.object({ category: z.string().min(1), description: z.string().min(1) }),
    )
    .default([]),
});
