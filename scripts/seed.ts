import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { MIN_PASSWORD_LENGTH } from "../src/features/auth/password";
import { connectDb } from "../src/lib/db";
import { Activity } from "../src/models/Activity";
import { Exam } from "../src/models/Exam";
import { Grade } from "../src/models/Grade";
import { Settings } from "../src/models/Settings";
import { Student } from "../src/models/Student";
import { Tournament } from "../src/models/Tournament";
import { User } from "../src/models/User";

async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Seed is forbidden in production");
  const uri = process.env.MONGODB_URI;
  if (!uri || !new URL(uri).pathname.includes("kyoku_dev"))
    throw new Error("Seed only accepts a kyoku_dev database");
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < MIN_PASSWORD_LENGTH)
    throw new Error(
      `Set SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least ${MIN_PASSWORD_LENGTH} characters`,
    );

  await connectDb();
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      name: "Administrador DojoNexo",
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
      active: true,
    },
    { upsert: true, returnDocument: "after" },
  );
  await User.findOneAndUpdate(
    { email: "instructor@kyoku.local" },
    {
      name: "Instructor Demo",
      email: "instructor@kyoku.local",
      passwordHash,
      role: "INSTRUCTOR",
      active: true,
    },
    { upsert: true },
  );

  const gradeData = [
    ["10.º Kyu", 1, "KYU", "#ffffff"],
    ["9.º Kyu", 2, "KYU", "#f4c542"],
    ["8.º Kyu", 3, "KYU", "#f28c28"],
    ["7.º Kyu", 4, "KYU", "#3b82f6"],
    ["6.º Kyu", 5, "KYU", "#22c55e"],
    ["5.º Kyu", 6, "KYU", "#7c3aed"],
    ["1.º Dan", 20, "DAN", "#111111"],
  ] as const;
  for (const [name, order, type, beltColor] of gradeData) {
    await Grade.findOneAndUpdate(
      { order },
      { name, order, type, beltColor, active: true },
      { upsert: true },
    );
  }

  const grade = await Grade.findOne({ order: 1 });
  const targetGrade = await Grade.findOne({ order: 2 });
  if (!grade || !targetGrade) throw new Error("Grade seed failed");
  const student = await Student.findOneAndUpdate(
    { document: "DEMO-001" },
    {
      firstName: "Akira",
      lastName: "Sato",
      birthDate: new Date("2012-04-10"),
      gender: "UNSPECIFIED",
      document: "DEMO-001",
      phone: "099000001",
      emergencyContact: "Contacto Demo 099000002",
      joinedAt: new Date("2024-03-01"),
      active: true,
      weight: 48,
      weightUpdatedAt: new Date(),
      height: 158,
      currentGradeId: grade._id,
    },
    { upsert: true, returnDocument: "after" },
  );

  await Settings.findOneAndUpdate(
    { key: "dojo" },
    { dojoName: "Mi dojo", weightStaleDays: 90 },
    { upsert: true },
  );
  await Tournament.findOneAndUpdate(
    { name: "Torneo de desarrollo" },
    {
      name: "Torneo de desarrollo",
      date: new Date("2026-11-15"),
      location: "Montevideo",
      status: "OPEN",
    },
    { upsert: true },
  );
  await Exam.findOneAndUpdate(
    { name: "Examen de fin de año" },
    {
      name: "Examen de fin de año",
      date: new Date("2026-12-15"),
      status: "SCHEDULED",
      registrations: [
        {
          studentId: student._id,
          currentGradeId: grade._id,
          targetGradeId: targetGrade._id,
          result: "PASSED_WITH_OBSERVATION",
          observations: [
            {
              category: "Kata",
              description: "Repetir secuencia final",
              status: "PENDING",
            },
          ],
        },
      ],
    },
    { upsert: true },
  );
  await Activity.findOneAndUpdate(
    { name: "Seminario técnico" },
    {
      name: "Seminario técnico",
      type: "SEMINAR",
      startDate: new Date("2026-10-10"),
      participants: [student._id],
    },
    { upsert: true },
  );
  console.log(`Seed completed for ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
