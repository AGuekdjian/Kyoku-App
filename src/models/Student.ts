import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
const { Schema, model, models } = mongoose;

const studentSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, index: true },
    lastName: { type: String, required: true, trim: true, index: true },
    birthDate: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["FEMALE", "MALE", "OTHER", "UNSPECIFIED"],
      default: "UNSPECIFIED",
    },
    document: { type: String, trim: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
    medicalProvider: String,
    guardianName: String,
    guardianPhone: String,
    emergencyContact: { type: String, required: true },
    joinedAt: { type: Date, required: true },
    active: { type: Boolean, default: true, index: true },
    weight: Number,
    weightUpdatedAt: Date,
    height: Number,
    currentGradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
      index: true,
    },
    notes: String,
    deletedAt: { type: Date, index: true },
  },
  { timestamps: true },
);
studentSchema.index({ firstName: "text", lastName: "text" });
studentSchema.index({ deletedAt: 1, active: 1, currentGradeId: 1 });
export type StudentRecord = InferSchemaType<typeof studentSchema>;
export const Student =
  (models.Student as Model<StudentRecord> | undefined) ??
  model<StudentRecord>("Student", studentSchema);
