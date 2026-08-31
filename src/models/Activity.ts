import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
const { Schema, model, models } = mongoose;
const schema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "TOURNAMENT",
        "SEMINAR",
        "CAMP",
        "SPECIAL_TRAINING",
        "EXAM",
        "EXHIBITION",
        "OTHER",
      ],
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: Date,
    location: String,
    organizer: String,
    description: String,
    notes: String,
    participants: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    deletedAt: { type: Date, index: true },
  },
  { timestamps: true },
);
schema.index({ deletedAt: 1, startDate: -1 });
export type ActivityRecord = InferSchemaType<typeof schema>;
export const Activity =
  (models.Activity as Model<ActivityRecord> | undefined) ??
  model<ActivityRecord>("Activity", schema);
