import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { audit } from "@/features/audit/service";
import { AppError } from "@/lib/app-error";
import { requireSession } from "@/features/auth/session";
import { studentSchema } from "@/features/students/schemas/student";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { Student } from "@/models/Student";
import { GradeHistory } from "@/models/GradeHistory";

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
    const transaction = await mongoose.startSession();
    let student;
    try {
      student = await transaction.withTransaction(async () => {
        const current = await Student.findOne({
          _id: id,
          deletedAt: null,
        }).session(transaction);
        if (!current) throw new AppError("NOT_FOUND");
        const gradeChanged =
          input.currentGradeId !== undefined &&
          String(current.currentGradeId) !== input.currentGradeId;
        const updated = await Student.findByIdAndUpdate(id, update, {
          returnDocument: "after",
          runValidators: true,
          session: transaction,
        });
        if (gradeChanged && updated) {
          await GradeHistory.create(
            [
              {
                studentId: current._id,
                previousGradeId: current.currentGradeId,
                newGradeId: updated.currentGradeId,
                date: new Date(),
                result: "MANUAL_UPDATE",
                notes: "Actualización desde la ficha del alumno",
              },
            ],
            { session: transaction },
          );
        }
        return updated;
      });
    } finally {
      await transaction.endSession();
    }
    if (!student) throw new AppError("NOT_FOUND");
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
    if (!student) throw new AppError("NOT_FOUND");
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
