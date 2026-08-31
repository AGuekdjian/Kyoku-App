import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
const gradeSchema = new Schema({
  name: { type: String, required: true }, order: { type: Number, required: true, unique: true },
  type: { type: String, enum: ["KYU", "DAN"], required: true }, beltColor: String, description: String,
  active: { type: Boolean, default: true, index: true }, documentId: { type: Schema.Types.ObjectId, ref: "Document" }, deletedAt: Date,
}, { timestamps: true });
export const Grade = models.Grade ?? model("Grade", gradeSchema);
