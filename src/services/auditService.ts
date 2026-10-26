import { AuditLogEntry, UserRole } from '../types/insurance';

const AUDIT_STORAGE_KEY = 'edushield_audit_logs';

export class AuditService {
  public static logAction(params: {
    actorId: string;
    actorName: string;
    actorRole: UserRole;
    action: string;
    entityType: AuditLogEntry['entityType'];
    entityId: string;
    previousState?: any;
    newState?: any;
    notes?: string;
  }): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      previousState: params.previousState,
      newState: params.newState,
      timestamp: new Date().toISOString(),
      notes: params.notes,
    };

    try {
      const existing = this.getLogs();
      const updated = [entry, ...existing].slice(0, 500); // keep last 500
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist audit log to localStorage:', e);
    }

    return entry;
  }

  public static getLogs(): AuditLogEntry[] {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static getLogsForEntity(entityType: string, entityId: string): AuditLogEntry[] {
    return this.getLogs().filter(l => l.entityType === entityType && l.entityId === entityId);
  }
}
