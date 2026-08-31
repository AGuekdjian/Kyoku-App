"use server";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { createSession, destroySession } from "./session";

export type LoginState = { error?: string };
export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(8).max(200) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Ingresá un email y contraseña válidos." };
  await connectDb(); const user = await User.findOne({ email: parsed.data.email.toLowerCase(), active: true }).select("+passwordHash").lean();
  if (!user || !(await bcrypt.compare(parsed.data.password, String(user.passwordHash)))) return { error: "Credenciales incorrectas." };
  await createSession({ userId: String(user._id), name: String(user.name), role: user.role as "ADMIN" | "INSTRUCTOR" }); redirect("/");
}
export async function logout() { await destroySession(); redirect("/login"); }
