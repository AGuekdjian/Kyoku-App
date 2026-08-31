import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError, pagination } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { Activity } from "@/models/Activity";
import { activityInputSchema } from "@/features/activities/schema";
export async function GET(req: NextRequest) {
  try {
    await requireSession();
    await connectDb();
    const { page, limit, skip } = pagination(req.nextUrl.searchParams);
    const [items, total] = await Promise.all([
      Activity.find({ deletedAt: null })
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments({ deletedAt: null }),
    ]);
    return NextResponse.json({ items, total, page });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    await requireSession();
    await connectDb();
    return NextResponse.json(
      await Activity.create(activityInputSchema.parse(await req.json())),
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
