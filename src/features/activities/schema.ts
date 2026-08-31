import { z } from "zod";

export const activityInputSchema = z
  .object({
    name: z.string().min(2).max(150),
    type: z.enum([
      "TOURNAMENT",
      "SEMINAR",
      "CAMP",
      "SPECIAL_TRAINING",
      "EXAM",
      "EXHIBITION",
      "OTHER",
    ]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().max(200).optional(),
    organizer: z.string().max(200).optional(),
    description: z.string().max(3000).optional(),
    notes: z.string().max(3000).optional(),
    participants: z.array(z.string()).default([]),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    message: "La fecha final debe ser posterior",
  });
