import { Types } from "mongoose";
import { AuditLog } from "@/models/AuditLog";
export async function audit(input: {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}) {
  await AuditLog.create({
    ...input,
    actorId: new Types.ObjectId(input.actorId),
    entityId: new Types.ObjectId(input.entityId),
  });
}
