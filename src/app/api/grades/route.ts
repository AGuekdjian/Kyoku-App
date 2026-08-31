import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { authorize } from "@/lib/auth/permissions";
import { Grade } from "@/models/Grade";
import { gradeInputSchema } from "@/features/grades/schema";
export async function GET() {
  try {
    await requireSession();
    await connectDb();
    return NextResponse.json(
      await Grade.find({ deletedAt: null }).sort({ order: 1 }).lean(),
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const s = await requireSession();
    authorize(s.role, "settings:manage");
    await connectDb();
    return NextResponse.json(
      await Grade.create(gradeInputSchema.parse(await req.json())),
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
