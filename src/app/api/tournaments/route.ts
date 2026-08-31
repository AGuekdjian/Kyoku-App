import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { Tournament } from "@/models/Tournament";
import { tournamentInputSchema } from "@/features/tournaments/schema";
export async function GET() {
  try {
    await requireSession();
    await connectDb();
    return NextResponse.json(
      await Tournament.find({ deletedAt: null }).sort({ date: -1 }).lean(),
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
      await Tournament.create(tournamentInputSchema.parse(await req.json())),
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
