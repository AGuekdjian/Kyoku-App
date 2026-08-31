import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
const { Schema, model, models } = mongoose;
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["ADMIN", "INSTRUCTOR"], required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export type UserRecord = InferSchemaType<typeof userSchema>;
export const User =
  (models.User as Model<UserRecord> | undefined) ??
  model<UserRecord>("User", userSchema);
