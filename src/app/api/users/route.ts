import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { authorize } from "@/lib/auth/permissions";
import { User } from "@/models/User";
import { userInputSchema } from "@/features/users/schema";
export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    authorize(s.role, "users:manage");
    await connectDb();
    const input = userInputSchema.parse(await req.json());
    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
    });
    return NextResponse.json(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
