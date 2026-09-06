import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError, pagination } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { Activity } from "@/models/Activity";
import { activityInputSchema } from "@/features/activities/schema";
import { authorize } from "@/lib/auth/permissions";
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
    const session = await requireSession();
    authorize(session.role, "activities:manage");
    await connectDb();
    const activity = await Activity.create(
      activityInputSchema.parse(await req.json()),
    );
    const { audit } = await import("@/features/audit/service");
    await audit({
      actorId: session.userId,
      action: "activity.create",
      entity: "Activity",
      entityId: String(activity._id),
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
