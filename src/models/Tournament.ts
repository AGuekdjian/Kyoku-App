import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
const { Schema, model, models } = mongoose;
const registrationSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    snapshot: {
      fullName: { type: String, required: true },
      birthDate: { type: Date, required: true },
      age: { type: Number, required: true },
      weight: Number,
      height: Number,
      gradeId: { type: Schema.Types.ObjectId, required: true },
      gradeName: { type: String, required: true },
    },
    result: {
      type: String,
      enum: ["PARTICIPATED", "FIRST", "SECOND", "THIRD", "OTHER"],
    },
    resultNotes: String,
  },
  { timestamps: true },
);
const tournamentSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    location: String,
    organizer: String,
    description: String,
    notes: String,
    status: {
      type: String,
      enum: ["DRAFT", "OPEN", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },
    registrations: [registrationSchema],
    deletedAt: Date,
  },
  { timestamps: true },
);
tournamentSchema.index({ deletedAt: 1, date: -1 });
export type TournamentRecord = InferSchemaType<typeof tournamentSchema>;
export const Tournament =
  (models.Tournament as Model<TournamentRecord> | undefined) ??
  model<TournamentRecord>("Tournament", tournamentSchema);
