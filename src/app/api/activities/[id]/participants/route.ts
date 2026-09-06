import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/features/audit/service";
import { requireSession } from "@/features/auth/session";
import { authorize } from "@/lib/auth/permissions";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { Activity } from "@/models/Activity";
import { Student } from "@/models/Student";

const inputSchema = z.object({
  studentIds: z.array(z.string()).max(500),
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    authorize(session.role, "activities:manage");
    await connectDb();
    const { id } = await context.params;
    const { studentIds } = inputSchema.parse(await request.json());
    const valid = await Student.find({
      _id: { $in: studentIds },
      active: true,
      deletedAt: null,
    }).distinct("_id");
    if (valid.length !== new Set(studentIds).size)
      return NextResponse.json({ error: "INVALID_STUDENTS" }, { status: 400 });
    const activity = await Activity.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { participants: valid },
      { new: true },
    );
    if (!activity)
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    await audit({
      actorId: session.userId,
      action: "activity.participants.update",
      entity: "Activity",
      entityId: id,
      metadata: { participantCount: valid.length },
    });
    return NextResponse.json({ participantCount: valid.length });
  } catch (error) {
    return apiError(error);
  }
}
