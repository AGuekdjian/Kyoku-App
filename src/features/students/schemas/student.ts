import { z } from "zod";

const optionalText = z.string().trim().max(200).optional().or(z.literal(""));

export const studentSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  birthDate: z.coerce
    .date()
    .max(new Date(), "La fecha no puede estar en el futuro"),
  gender: z
    .enum(["FEMALE", "MALE", "OTHER", "UNSPECIFIED"])
    .default("UNSPECIFIED"),
  document: optionalText,
  phone: z.string().trim().min(6).max(30),
  email: z.string().email().optional().or(z.literal("")),
  address: optionalText,
  medicalProvider: optionalText,
  guardianName: optionalText,
  guardianPhone: optionalText,
  emergencyContact: z.string().trim().min(3).max(200),
  joinedAt: z.coerce.date(),
  active: z.boolean().default(true),
  weight: z.number().positive().max(500).optional(),
  height: z.number().positive().max(300).optional(),
  currentGradeId: z.string().min(1),
  notes: z.string().trim().max(3000).optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;
