import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { pagination, apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { studentSchema } from "@/features/students/schemas/student";
import { Student } from "@/models/Student";
import { audit } from "@/features/audit/service";
export async function GET(req: NextRequest) {
  try {
    await requireSession();
    await connectDb();
    const { page, limit, skip } = pagination(req.nextUrl.searchParams);
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const active = req.nextUrl.searchParams.get("active");
    const filter: Record<string, unknown> = { deletedAt: null };
    if (q) filter.$text = { $search: q };
    if (active) filter.active = active === "true";
    const [items, total] = await Promise.all([
      Student.find(filter)
        .select(
          "firstName lastName birthDate phone active weight weightUpdatedAt height currentGradeId",
        )
        .populate("currentGradeId", "name beltColor")
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);
    return NextResponse.json({
      items,
      page,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectDb();
    const input = studentSchema.parse(await req.json());
    const student = await Student.create({
      ...input,
      weightUpdatedAt: input.weight ? new Date() : undefined,
    });
    await audit({
      actorId: session.userId,
      action: "student.create",
      entity: "Student",
      entityId: String(student._id),
    });
    return NextResponse.json(student, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
