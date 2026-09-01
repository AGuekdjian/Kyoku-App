import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/features/audit/service";
import { assertGradeProgression } from "@/features/grades/domain/progression";
import { requireSession } from "@/features/auth/session";
import { AppError } from "@/lib/app-error";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { Exam } from "@/models/Exam";
import { Grade } from "@/models/Grade";
import { Student } from "@/models/Student";

const inputSchema = z.object({
  registrations: z
    .array(z.object({ studentId: z.string(), targetGradeId: z.string() }))
    .min(1)
    .max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    await connectDb();
    const { id } = await params;
    const input = inputSchema.parse(await request.json());
    const exam = await Exam.findOne({ _id: id, deletedAt: null });
    if (!exam) throw new AppError("NOT_FOUND");

    const students = await Student.find({
      _id: { $in: input.registrations.map((item) => item.studentId) },
      active: true,
      deletedAt: null,
    }).lean();
    const grades = await Grade.find({ active: true, deletedAt: null }).lean();
    const gradeById = new Map(
      grades.map((grade) => [String(grade._id), grade]),
    );
    const studentById = new Map(
      students.map((student) => [String(student._id), student]),
    );
    const existing = new Set(
      exam.registrations.map((registration) => String(registration.studentId)),
    );
    let added = 0;

    for (const item of input.registrations) {
      if (existing.has(item.studentId)) continue;
      const student = studentById.get(item.studentId);
      const current = student && gradeById.get(String(student.currentGradeId));
      const target = gradeById.get(item.targetGradeId);
      if (!student || !current || !target) throw new AppError("NOT_FOUND");
      assertGradeProgression(
        {
          id: String(current._id),
          order: current.order,
          active: current.active,
        },
        { id: String(target._id), order: target.order, active: target.active },
      );
      exam.registrations.push({
        studentId: student._id,
        currentGradeId: current._id,
        targetGradeId: target._id,
        result: "PENDING",
        observations: [],
      });
      added += 1;
    }

    await exam.save();
    await audit({
      actorId: session.userId,
      action: "exam.bulk_register",
      entity: "Exam",
      entityId: id,
      metadata: { count: added },
    });
    return NextResponse.json({ added });
  } catch (error) {
    return apiError(error);
  }
}
