import { Schema, model, models } from "mongoose";
const userSchema = new Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, passwordHash: { type: String, required: true, select: false }, role: { type: String, enum: ["ADMIN", "INSTRUCTOR"], required: true }, active: { type: Boolean, default: true } }, { timestamps: true });
export const User = models.User ?? model("User", userSchema);
