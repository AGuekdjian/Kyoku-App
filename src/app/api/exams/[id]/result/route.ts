import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { recordExamResult } from "@/features/exams/service";
import { examResultInputSchema } from "@/features/exams/schema";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    await connectDb();
    const body = examResultInputSchema.parse(await req.json());
    return NextResponse.json(
      await recordExamResult({
        examId: (await params).id,
        actorId: session.userId,
        ...body,
      }),
    );
  } catch (e) {
    return apiError(e);
  }
}
