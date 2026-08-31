import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
const observationSchema = new Schema(
  {
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "RESOLVED"], default: "PENDING" },
    resolvedAt: Date,
    instructorId: { type: Schema.Types.ObjectId, ref: "User" },
    resolutionNotes: String,
  },
  { timestamps: true },
);
const registrationSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    currentGradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    targetGradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    result: {
      type: String,
      enum: [
        "PENDING",
        "PASSED",
        "PASSED_WITH_OBSERVATION",
        "FAILED",
        "ABSENT",
      ],
      default: "PENDING",
    },
    observations: [observationSchema],
  },
  { timestamps: true },
);
const examSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    location: String,
    examiner: String,
    notes: String,
    status: {
      type: String,
      enum: ["DRAFT", "SCHEDULED", "COMPLETED", "CLOSED"],
      default: "DRAFT",
      index: true,
    },
    registrations: [registrationSchema],
    deletedAt: Date,
  },
  { timestamps: true },
);
examSchema.index({ deletedAt: 1, date: -1 });
export const Exam = models.Exam ?? model("Exam", examSchema);
