import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/features/audit/service";
import { requireSession } from "@/features/auth/session";
import { studentSchema } from "@/features/students/schemas/student";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { Student } from "@/models/Student";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const session = await requireSession();
    await connectDb();
    const { id } = await params;
    const input = studentSchema.partial().parse(await request.json());
    const update = {
      ...input,
      ...(input.weight !== undefined ? { weightUpdatedAt: new Date() } : {}),
    };
    const student = await Student.findOneAndUpdate(
      { _id: id, deletedAt: null },
      update,
      { returnDocument: "after", runValidators: true },
    );
    if (!student) throw new Error("NOT_FOUND");
    await audit({
      actorId: session.userId,
      action: "student.update",
      entity: "Student",
      entityId: id,
    });
    return NextResponse.json(student);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: Context) {
  try {
    const session = await requireSession();
    await connectDb();
    const { id } = await params;
    const student = await Student.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date(), active: false },
    );
    if (!student) throw new Error("NOT_FOUND");
    await audit({
      actorId: session.userId,
      action: "student.delete",
      entity: "Student",
      entityId: id,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
