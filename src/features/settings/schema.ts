import { z } from "zod";

export const settingsInputSchema = z.object({
  dojoName: z.string().min(2).max(120),
  weightStaleDays: z.number().int().min(1).max(730),
});
