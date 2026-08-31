import mongoose from "mongoose";
import type { Model, Types } from "mongoose";
const { Schema, model, models } = mongoose;
export interface AuditLogRecord {
  actorId: Types.ObjectId;
  action: string;
  entity: string;
  entityId: Types.ObjectId;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  timestamp: Date;
}

const auditSchema = new Schema<AuditLogRecord>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed },
    correlationId: String,
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } },
);
auditSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
auditSchema.index({ timestamp: -1 });
export const AuditLog =
  (models.AuditLog as Model<AuditLogRecord> | undefined) ??
  model<AuditLogRecord>("AuditLog", auditSchema);
