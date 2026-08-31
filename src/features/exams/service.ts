import mongoose from "mongoose";
import { AppError } from "@/lib/app-error";
import {
  decideExamResult,
  type ExamResult,
  type ObservationInput,
} from "./domain/result";
import { Exam } from "@/models/Exam";
import { Student } from "@/models/Student";
import { GradeHistory } from "@/models/GradeHistory";
import { AuditLog } from "@/models/AuditLog";
export async function recordExamResult(input: {
  examId: string;
  registrationId: string;
  result: ExamResult;
  observations: ObservationInput[];
  actorId: string;
}) {
  const decision = decideExamResult(input.result, input.observations);
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const exam = await Exam.findOne({
        _id: input.examId,
        "registrations._id": input.registrationId,
      }).session(session);
      if (!exam) throw new AppError("NOT_FOUND");
      const registration = exam.registrations.id(input.registrationId);
      if (!registration) throw new AppError("NOT_FOUND");
      if (registration.result !== "PENDING")
        throw new AppError("RESULT_ALREADY_RECORDED");
      registration.result = input.result;
      registration.set("observations", decision.observations);
      if (decision.promote) {
        const student = await Student.findOne({
          _id: registration.studentId,
          deletedAt: null,
        }).session(session);
        if (!student) throw new AppError("NOT_FOUND");
        if (
          String(student.currentGradeId) !== String(registration.currentGradeId)
        )
          throw new AppError("STALE_GRADE");
        await GradeHistory.create(
          [
            {
              studentId: student._id,
              previousGradeId: student.currentGradeId,
              newGradeId: registration.targetGradeId,
              date: exam.date,
              examId: exam._id,
              result: input.result,
            },
          ],
          { session },
        );
        student.currentGradeId = registration.targetGradeId;
        await student.save({ session });
      }
      await exam.save({ session });
      await AuditLog.create(
        [
          {
            actorId: new mongoose.Types.ObjectId(input.actorId),
            action: "exam.result",
            entity: "Exam",
            entityId: exam._id,
            metadata: {
              registrationId: input.registrationId,
              result: input.result,
              observationCount: input.observations.length,
            },
          },
        ],
        { session },
      );
      return registration.toObject();
    });
  } finally {
    await session.endSession();
  }
}
export async function resolveExamObservation(input: {
  examId: string;
  observationId: string;
  actorId: string;
  notes?: string;
}) {
  const exam = await Exam.findOne({
    _id: input.examId,
    "registrations.observations._id": input.observationId,
  });
  if (!exam) throw new AppError("NOT_FOUND");
  let found = false;
  for (const reg of exam.registrations) {
    const obs = reg.observations.id(input.observationId);
    if (obs) {
      if (obs.status === "RESOLVED")
        throw new AppError("OBSERVATION_ALREADY_RESOLVED");
      obs.status = "RESOLVED";
      obs.resolvedAt = new Date();
      obs.instructorId = new mongoose.Types.ObjectId(input.actorId);
      obs.resolutionNotes = input.notes;
      found = true;
      break;
    }
  }
  if (!found) throw new AppError("NOT_FOUND");
  await exam.save();
  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(input.actorId),
    action: "exam.observation.resolve",
    entity: "Exam",
    entityId: exam._id,
    metadata: { observationId: input.observationId },
  });
  return exam;
}
