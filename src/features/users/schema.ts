import { z } from "zod";

export const userInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(12).max(200),
  role: z.enum(["ADMIN", "INSTRUCTOR"]),
});
