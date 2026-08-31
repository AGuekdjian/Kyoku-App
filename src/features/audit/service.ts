import { AuditLog } from "@/models/AuditLog";
export async function audit(input: { actorId: string; action: string; entity: string; entityId: string; metadata?: Record<string, unknown>; correlationId?: string }) { await AuditLog.create(input); }
