import { z } from "zod";

export const gradeInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  order: z.number().int().min(0),
  type: z.enum(["KYU", "DAN"]),
  beltColor: z.string().max(40).optional(),
  description: z.string().max(1000).optional(),
  active: z.boolean().default(true),
  documentId: z.string().optional(),
});
