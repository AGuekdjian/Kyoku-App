import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/auth/permissions";
import { AppError } from "@/lib/app-error";

const COOKIE = "kyoku_session";
export type Session = { userId: string; name: string; role: Role };
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32)
    throw new Error("AUTH_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(value);
}
export async function createSession(payload: Session) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 28_800,
  });
}
export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: String(payload.userId),
      name: String(payload.name),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new AppError("UNAUTHORIZED");
  return session;
}
