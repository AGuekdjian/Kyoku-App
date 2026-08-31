import { z } from "zod";

export const tournamentInputSchema = z.object({
  name: z.string().min(2),
  date: z.coerce.date(),
  location: z.string().optional(),
  organizer: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "COMPLETED", "CANCELLED"]).default("DRAFT"),
});
