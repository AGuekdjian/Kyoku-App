import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { authorize } from "@/lib/auth/permissions";
import { Settings } from "@/models/Settings";
import { audit } from "@/features/audit/service";
import { settingsInputSchema } from "@/features/settings/schema";
export async function PATCH(req: NextRequest) {
  try {
    const s = await requireSession();
    authorize(s.role, "settings:manage");
    await connectDb();
    const input = settingsInputSchema.parse(await req.json());
    const item = await Settings.findOneAndUpdate({ key: "dojo" }, input, {
      upsert: true,
      returnDocument: "after",
    });
    await audit({
      actorId: s.userId,
      action: "settings.update",
      entity: "Settings",
      entityId: String(item._id),
      metadata: input,
    });
    return NextResponse.json(item);
  } catch (e) {
    return apiError(e);
  }
}
