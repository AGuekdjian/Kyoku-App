import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { apiError } from "@/lib/http";
import { requireSession } from "@/features/auth/session";
import { createTournamentSnapshot } from "@/features/tournaments/domain/snapshot";
import { Tournament } from "@/models/Tournament";
import { Student } from "@/models/Student";
import { Grade } from "@/models/Grade";
import { audit } from "@/features/audit/service";
import { AppError } from "@/lib/app-error";
import { calculateAge } from "@/features/students/domain/age";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    await connectDb();
    const { id } = await params;
    const [tournament, students] = await Promise.all([
      Tournament.findOne({ _id: id, deletedAt: null })
        .select("date registrations")
        .lean(),
      Student.find({ active: true, deletedAt: null })
        .select("firstName lastName birthDate weight height currentGradeId")
        .sort({ lastName: 1, firstName: 1 })
        .limit(500)
        .lean(),
    ]);
    if (!tournament) throw new AppError("NOT_FOUND");
    const grades = await Grade.find({
      _id: { $in: students.map((student) => student.currentGradeId) },
    })
      .select("name")
      .lean();
    const gradeNames = new Map(
      grades.map((grade) => [String(grade._id), String(grade.name)]),
    );
    return NextResponse.json({
      students: students.map((student) => ({
        id: String(student._id),
        name: `${String(student.lastName)}, ${String(student.firstName)}`,
        age: calculateAge(student.birthDate as Date),
        weight: student.weight,
        height: student.height,
        gradeId: String(student.currentGradeId),
        grade: gradeNames.get(String(student.currentGradeId)) ?? "Sin grado",
      })),
      registrations: tournament.registrations.map((registration) => ({
        id: String(registration._id),
        studentId: String(registration.studentId),
        name: String(registration.snapshot?.fullName ?? "Alumno"),
        grade: String(registration.snapshot?.gradeName ?? "Sin grado"),
        result: registration.result,
        resultNotes: registration.resultNotes,
      })),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    await connectDb();
    const { id } = await params;
    const { studentIds } = z
      .object({ studentIds: z.array(z.string()).min(1).max(500) })
      .parse(await req.json());
    const tournament = await Tournament.findOne({ _id: id, deletedAt: null });
    if (!tournament) throw new AppError("NOT_FOUND");
    const students = await Student.find({
      _id: { $in: studentIds },
      active: true,
      deletedAt: null,
    }).lean();
    const grades = await Grade.find({
      _id: { $in: students.map((s) => s.currentGradeId) },
    }).lean();
    const names = new Map(grades.map((g) => [String(g._id), String(g.name)]));
    const existing = new Set(
      tournament.registrations.map((r: { studentId: unknown }) =>
        String(r.studentId),
      ),
    );
    for (const student of students) {
      if (!existing.has(String(student._id)))
        tournament.registrations.push({
          studentId: student._id,
          snapshot: createTournamentSnapshot(
            {
              firstName: String(student.firstName),
              lastName: String(student.lastName),
              birthDate: student.birthDate as Date,
              weight: student.weight as number | undefined,
              height: student.height as number | undefined,
              currentGradeId: String(student.currentGradeId),
            },
            names.get(String(student.currentGradeId)) ?? "Sin grado",
            new Date(tournament.date),
          ),
        });
    }
    await tournament.save();
    await audit({
      actorId: session.userId,
      action: "tournament.bulk_register",
      entity: "Tournament",
      entityId: id,
      metadata: { count: students.length },
    });
    return NextResponse.json(tournament);
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    await connectDb();
    const { id } = await params;
    const body = z
      .object({
        registrationId: z.string(),
        result: z.enum(["PARTICIPATED", "FIRST", "SECOND", "THIRD", "OTHER"]),
        resultNotes: z.string().max(1000).optional(),
      })
      .parse(await req.json());
    const tournament = await Tournament.findOne({
      _id: id,
      "registrations._id": body.registrationId,
      deletedAt: null,
    });
    if (!tournament) throw new AppError("NOT_FOUND");
    const registration = tournament.registrations.id(body.registrationId);
    if (!registration) throw new AppError("NOT_FOUND");
    registration.result = body.result;
    registration.resultNotes = body.resultNotes;
    await tournament.save();
    await audit({
      actorId: session.userId,
      action: "tournament.result",
      entity: "Tournament",
      entityId: id,
      metadata: { registrationId: body.registrationId, result: body.result },
    });
    return NextResponse.json(registration);
  } catch (e) {
    return apiError(e);
  }
}
