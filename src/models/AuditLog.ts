import { Schema, model, models } from "mongoose";
const auditSchema = new Schema({ actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, action: { type: String, required: true, index: true }, entity: { type: String, required: true, index: true }, entityId: { type: Schema.Types.ObjectId, required: true }, metadata: { type: Schema.Types.Mixed }, correlationId: String }, { timestamps: { createdAt: "timestamp", updatedAt: false } });
auditSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
export const AuditLog = models.AuditLog ?? model("AuditLog", auditSchema);
