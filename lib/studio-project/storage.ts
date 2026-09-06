import { readStudioRecord } from "./migrate";
import type { StudioMode } from "./schema";

export const STUDIO_PROJECT_DATABASE = "ops-studio-projects";
const DATABASE_VERSION = 1;
const PROJECTS = "projects";
const RECOVERY = "recovery";

export type StorageFailure = {
  ok: false;
  code: "invalid" | "blocked" | "conflict" | "unavailable" | "quota" | "closed";
  error: string;
};
export type StorageResult<T> = { ok: true; value: T } | StorageFailure;
export interface StoredProject { mode: StudioMode; revision: string; raw: string }
export interface RecoveryRecord extends StoredProject { id: string; reason: "import" | "reset"; archivedAt: string }
export interface ProjectChange { mode: StudioMode; revision: string }
export interface ProjectStorage {
  read(mode: StudioMode): Promise<StorageResult<StoredProject | null>>;
  /** Comparison and write MUST happen in one transaction, including import/reset. */
  write(mode: StudioMode, raw: string, expectedRevision: string | null, archive?: "import" | "reset"): Promise<StorageResult<StoredProject>>;
  recovery(mode: StudioMode): Promise<StorageResult<RecoveryRecord[]>>;
  subscribe(listener: (change: ProjectChange) => void): () => void;
  close(): void;
}

export function storageFailure(error: unknown): StorageFailure {
  const name = error && typeof error === "object" && "name" in error ? error.name : "";
  return name === "QuotaExceededError"
    ? { ok: false, code: "quota", error: "This browser has no room to save the project. Your last saved version is unchanged; download a backup of your unsaved work." }
    : { ok: false, code: "unavailable", error: "Browser storage could not complete this operation. Your work has not been reported as saved. Retry or download a backup." };
}

const modeValid = (mode: unknown): mode is StudioMode => mode === "practice" || mode === "personal";
const envelope = (value: unknown, mode: StudioMode): value is StoredProject => {
  if (!value || typeof value !== "object") return false;
  const row = value as StoredProject;
  return row.mode === mode && typeof row.revision === "string" && row.revision.length > 0 && typeof row.raw === "string";
};
const blocked = (): StorageFailure => ({ ok: false, code: "blocked", error: "The saved project cannot be read by this version. It has been left untouched." });
const closed = (): StorageFailure => ({ ok: false, code: "closed", error: "This project storage connection is closed. Reopen the project before saving." });

/** Native IndexedDB, with no memory fallback masquerading as a durable save. */
export function createIndexedDbProjectStorage(options: {
  databaseName?: string;
  factory?: IDBFactory;
  /** Notifications are advisory; the transactional revision check is authoritative. */
  notifications?: boolean;
  openTimeoutMs?: number;
} = {}): ProjectStorage {
  const databaseName = options.databaseName ?? STUDIO_PROJECT_DATABASE;
  let database: IDBDatabase | null = null;
  let opening: Promise<StorageResult<IDBDatabase>> | null = null;
  let isClosed = false;
  const listeners = new Set<(change: ProjectChange) => void>();
  let channel: BroadcastChannel | null = null;
  try {
    if (options.notifications !== false && typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(`${databaseName}:changes`);
      channel.onmessage = (event: MessageEvent<unknown>) => {
        const change = event.data as ProjectChange | null;
        if (!change || !modeValid(change.mode) || typeof change.revision !== "string") return;
        listeners.forEach((listener) => { try { listener(change); } catch { /* Observers cannot invalidate a committed write. */ } });
      };
    }
  } catch { /* Revision checks still prevent lost updates when channels are unavailable. */ }

  function open(): Promise<StorageResult<IDBDatabase>> {
    if (isClosed) return Promise.resolve(closed());
    if (database) return Promise.resolve({ ok: true, value: database });
    if (opening) return opening;
    const pending = new Promise<StorageResult<IDBDatabase>>((resolve) => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const finish = (result: StorageResult<IDBDatabase>) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(result);
      };
      try {
        const factory = options.factory ?? globalThis.indexedDB;
        if (!factory) { finish(storageFailure(null)); return; }
        const request = factory.open(databaseName, DATABASE_VERSION);
        timeout = setTimeout(() => finish({ ok: false, code: "unavailable", error: "Opening project storage took too long. Close older Studio tabs and retry; existing data has not been replaced." }), options.openTimeoutMs ?? 5000);
        request.onupgradeneeded = () => {
          // An open request cannot be cancelled. Abort a late upgrade after a timeout/close.
          if (settled || isClosed) { request.transaction?.abort(); return; }
          if (!request.result.objectStoreNames.contains(PROJECTS)) request.result.createObjectStore(PROJECTS, { keyPath: "mode" });
          if (!request.result.objectStoreNames.contains(RECOVERY)) request.result.createObjectStore(RECOVERY, { keyPath: "id" });
        };
        request.onblocked = () => finish({ ok: false, code: "unavailable", error: "An older Studio tab is blocking project storage. Close it and retry. No saved project was changed." });
        request.onerror = () => finish(storageFailure(request.error));
        request.onsuccess = () => {
          const connection = request.result;
          if (settled || isClosed) { connection.close(); finish(closed()); return; }
          if (!connection.objectStoreNames.contains(PROJECTS) || !connection.objectStoreNames.contains(RECOVERY)) {
            connection.close(); finish(blocked()); return;
          }
          database = connection;
          connection.onversionchange = () => { connection.close(); if (database === connection) database = null; };
          connection.onclose = () => { if (database === connection) database = null; };
          finish({ ok: true, value: connection });
        };
      } catch (error) { finish(storageFailure(error)); }
    });
    opening = pending;
    void pending.then(() => { if (opening === pending) opening = null; });
    return pending;
  }

  async function read(mode: StudioMode): Promise<StorageResult<StoredProject | null>> {
    if (!modeValid(mode)) return { ok: false, code: "invalid", error: "Choose a practice or personal project." };
    const opened = await open();
    if (!opened.ok) return opened;
    return new Promise((resolve) => {
      try {
        const transaction = opened.value.transaction(PROJECTS, "readonly");
        let result: StorageResult<StoredProject | null> = blocked();
        const request = transaction.objectStore(PROJECTS).get(mode);
        request.onsuccess = () => {
          result = request.result === undefined ? { ok: true, value: null }
            : envelope(request.result, mode) ? { ok: true, value: request.result } : blocked();
        };
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () => resolve(storageFailure(transaction.error));
      } catch (error) { resolve(storageFailure(error)); }
    });
  }

  async function write(mode: StudioMode, raw: string, expectedRevision: string | null, archive?: "import" | "reset"): Promise<StorageResult<StoredProject>> {
    if (isClosed) return closed();
    if (!modeValid(mode) || !(expectedRevision === null || typeof expectedRevision === "string")) return { ok: false, code: "invalid", error: "The project mode or saved revision is invalid." };
    const parsed = readStudioRecord(raw);
    if (!parsed.ok) return { ok: false, code: "invalid", error: parsed.error };
    if (parsed.migrated || parsed.project.mode !== mode) return { ok: false, code: "invalid", error: "Save a validated v2 project in its own practice or personal slot." };
    const opened = await open();
    if (!opened.ok) return opened;
    const result = await new Promise<StorageResult<StoredProject>>((resolve) => {
      try {
        const transaction = opened.value.transaction([PROJECTS, RECOVERY], "readwrite");
        const store = transaction.objectStore(PROJECTS);
        let outcome: StorageResult<StoredProject> = blocked();
        const request = store.get(mode);
        request.onsuccess = () => {
          try {
            const existing: unknown = request.result;
            if (existing !== undefined && !envelope(existing, mode)) { outcome = blocked(); return; }
            const current = existing as StoredProject | undefined;
            if ((current?.revision ?? null) !== expectedRevision) {
              outcome = { ok: false, code: "conflict", error: "Another tab changed this project. Your edit is still available as an unsaved backup. Reload the saved version before making another change." };
              return;
            }
            // Even an explicit import/reset must not downgrade an unreadable or future record.
            if (current) {
              const currentRead = readStudioRecord(current.raw);
              if (!currentRead.ok || currentRead.migrated || currentRead.project.mode !== mode) { outcome = blocked(); return; }
            }
            const next = { mode, raw, revision: crypto.randomUUID() };
            if (archive && current) {
              transaction.objectStore(RECOVERY).add({ ...current, id: crypto.randomUUID(), reason: archive, archivedAt: new Date().toISOString() } satisfies RecoveryRecord);
            }
            store.put(next);
            outcome = { ok: true, value: next };
          } catch (error) { outcome = storageFailure(error); transaction.abort(); }
        };
        // A successful put request is not a successful save: a later abort rolls it back.
        transaction.oncomplete = () => resolve(outcome);
        transaction.onabort = () => resolve(outcome.ok || outcome.code === "blocked" ? storageFailure(transaction.error) : outcome);
      } catch (error) { resolve(storageFailure(error)); }
    });
    if (result.ok) {
      try { channel?.postMessage({ mode, revision: result.value.revision } satisfies ProjectChange); } catch { /* Commit already succeeded. */ }
    }
    return result;
  }

  async function recovery(mode: StudioMode): Promise<StorageResult<RecoveryRecord[]>> {
    if (!modeValid(mode)) return { ok: false, code: "invalid", error: "Choose a practice or personal project." };
    const opened = await open();
    if (!opened.ok) return opened;
    return new Promise((resolve) => {
      try {
        const transaction = opened.value.transaction(RECOVERY, "readonly");
        const request = transaction.objectStore(RECOVERY).getAll();
        transaction.oncomplete = () => {
          const rows: unknown[] = request.result;
          if (rows.some((row) => !row || typeof row !== "object" || !("mode" in row) || !modeValid(row.mode))) { resolve(blocked()); return; }
          const matching = rows.filter((row) => (row as RecoveryRecord).mode === mode);
          if (matching.some((row) => !envelope(row, mode) || typeof (row as RecoveryRecord).id !== "string" || !["import", "reset"].includes((row as RecoveryRecord).reason) || !Number.isFinite(Date.parse((row as RecoveryRecord).archivedAt)))) { resolve(blocked()); return; }
          resolve({ ok: true, value: matching as RecoveryRecord[] });
        };
        transaction.onabort = () => resolve(storageFailure(transaction.error));
      } catch (error) { resolve(storageFailure(error)); }
    });
  }

  return {
    read, write, recovery,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    close() { isClosed = true; listeners.clear(); channel?.close(); channel = null; database?.close(); database = null; },
  };
}
