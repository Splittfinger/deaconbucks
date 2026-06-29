import { makeId, nowIso } from './ids';

export async function logAudit(
  db: D1Database,
  actorUserId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  await db
    .prepare(
      `
        INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, details_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .bind(makeId('aud'), actorUserId, action, entityType, entityId, JSON.stringify(details), nowIso())
    .run();
}
