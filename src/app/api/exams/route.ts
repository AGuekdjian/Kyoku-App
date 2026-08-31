import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { Exam } from "@/models/Exam";
import { examInputSchema } from "@/features/exams/schema";
export async function GET() {
  try {
    await requireSession();
    await connectDb();
    return NextResponse.json(
      await Exam.find({ deletedAt: null })
        .populate("registrations.studentId", "firstName lastName")
        .sort({ date: -1 })
        .lean(),
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    await connectDb();
    return NextResponse.json(
      await Exam.create(examInputSchema.parse(await req.json())),
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
