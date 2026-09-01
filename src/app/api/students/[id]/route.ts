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
import { supportsMongoTransactions } from "@/lib/mongo-capabilities";

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
    const updateStudent = async (transaction?: mongoose.ClientSession) => {
      const current = await Student.findOne({
        _id: id,
        deletedAt: null,
      }).session(transaction ?? null);
      if (!current) throw new AppError("NOT_FOUND");
      const gradeChanged =
        input.currentGradeId !== undefined &&
        String(current.currentGradeId) !== input.currentGradeId;
      const updated = await Student.findByIdAndUpdate(id, update, {
        returnDocument: "after",
        runValidators: true,
        ...(transaction ? { session: transaction } : {}),
      });
      if (gradeChanged && updated) {
        const history = {
          studentId: current._id,
          previousGradeId: current.currentGradeId,
          newGradeId: updated.currentGradeId,
          date: new Date(),
          result: "MANUAL_UPDATE",
          notes: "Actualización desde la ficha del alumno",
        };
        if (transaction)
          await GradeHistory.create([history], { session: transaction });
        else await GradeHistory.create(history);
      }
      return updated;
    };
    let student;
    if (await supportsMongoTransactions()) {
      const transaction = await mongoose.startSession();
      try {
        student = await transaction.withTransaction(() =>
          updateStudent(transaction),
        );
      } finally {
        await transaction.endSession();
      }
    } else {
      student = await updateStudent();
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
