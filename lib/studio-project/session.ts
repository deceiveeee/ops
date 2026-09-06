import { STUDIO_STORAGE_KEY } from "@/lib/studio";
import { exportProjectBackup, importProjectBackup, type BackupResult } from "./backup";
import { createStudioProject } from "./create";
import type { StudioMode, StudioProject } from "./schema";
import { type ProjectStorage, type StorageFailure, type StorageResult, type StoredProject } from "./storage";

export interface ProjectSessionState {
  status: "loading" | "ready" | "saving" | "unsaved" | "conflict" | "blocked" | "unavailable" | "closed";
  /** Includes unsaved edits; the status must travel with it in the UI. */
  project: StudioProject | null;
  savedProject: StudioProject | null;
  revision: string | null;
  dirty: boolean;
  externalChange: boolean;
  error: string | null;
  /** Unreadable legacy/future content remains available verbatim for recovery. */
  recoveryRaw: string | null;
}
export type SessionResult = { ok: true } | StorageFailure;
const rejected = (error: string, code: StorageFailure["code"] = "invalid"): StorageFailure => ({ ok: false, code, error });
const clone = (project: StudioProject): StudioProject => JSON.parse(JSON.stringify(project));

/**
 * Framework-independent session for the future workspace. Writes are serialized
 * within a tab, and storage compares revisions atomically across tabs. Neither
 * a failed save nor a notification is allowed to replace the user's draft.
 */
export function createProjectSession(storage: ProjectStorage, mode: StudioMode, options: {
  readLegacy?: () => string | null;
} = {}) {
  let state: ProjectSessionState = { status: "loading", project: null, savedProject: null, revision: null, dirty: false, externalChange: false, error: null, recoveryRaw: null };
  const listeners = new Set<() => void>();
  let ended = false;
  let pendingArchive: "import" | "reset" | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  const publish = (patch: Partial<ProjectSessionState>) => {
    if (ended) return;
    state = { ...state, ...patch };
    listeners.forEach((listener) => { try { listener(); } catch { /* A view cannot undo a save. */ } });
  };
  const enqueue = <T extends SessionResult>(task: () => Promise<T>): Promise<T | StorageFailure> => {
    const next = queue.then(async () => {
      if (ended) return rejected("This project session is closed.", "closed");
      try { return await task(); }
      catch { return fail(rejected("The storage operation could not finish. The existing draft is still available.", "unavailable")); }
    });
    queue = next.catch(() => undefined);
    return next;
  };
  const fail = (result: StorageFailure, recoveryRaw = state.recoveryRaw): StorageFailure => {
    publish({ status: result.code === "conflict" ? "conflict" : result.code === "blocked" ? "blocked" : state.dirty ? "unsaved" : "unavailable", error: result.error, recoveryRaw });
    return result;
  };
  const accept = (record: StoredProject): SessionResult => {
    const parsed = importProjectBackup(record.raw);
    if (!parsed.ok || parsed.migrated || parsed.project.mode !== mode) return fail(rejected(parsed.ok ? "The saved project has an unexpected version or mode." : parsed.error, "blocked"), record.raw);
    pendingArchive = undefined;
    publish({ status: "ready", project: parsed.project, savedProject: clone(parsed.project), revision: record.revision, dirty: false, externalChange: false, error: null, recoveryRaw: null });
    return { ok: true };
  };
  async function persist(project: StudioProject, archive?: "import" | "reset"): Promise<SessionResult> {
    const backup = exportProjectBackup(project);
    if (!backup.ok) return rejected(backup.error);
    pendingArchive = archive ?? pendingArchive;
    publish({ project, dirty: true, status: "saving", error: null });
    let result: StorageResult<StoredProject>;
    try { result = await storage.write(mode, backup.raw, state.revision, pendingArchive); }
    catch { return fail(rejected("Browser storage could not save this edit. Download the unsaved backup or retry.", "unavailable")); }
    if (!result.ok) return fail(result);
    return accept(result.value);
  }
  async function load(): Promise<SessionResult> {
    publish({ status: "loading", error: null });
    let result: StorageResult<StoredProject | null>;
    try { result = await storage.read(mode); } catch { return fail(rejected("Browser storage could not read the project.", "unavailable")); }
    if (!result.ok) return fail(result);
    if (result.value) return accept(result.value);
    let legacy: string | null;
    try {
      legacy = options.readLegacy ? options.readLegacy() : typeof window === "undefined" ? null : window.localStorage.getItem(STUDIO_STORAGE_KEY);
    } catch { return fail(rejected("The older saved portfolio could not be checked. Enable access to browser storage and retry; it has not been replaced.", "unavailable")); }
    let project = createStudioProject(mode);
    if (legacy !== null) {
      const parsed = importProjectBackup(legacy);
      if (!parsed.ok) return fail(rejected(parsed.error, "blocked"), legacy);
      if (parsed.project.mode === mode) project = parsed.project;
    }
    publish({ revision: null, savedProject: null, recoveryRaw: null });
    const saved = await persist(project);
    // Two tabs may initialize at once. Neither has accepted learner input yet;
    // load the winner rather than overwriting it with a second empty/migrated record.
    if (!saved.ok && saved.code === "conflict") {
      const winner = await storage.read(mode);
      if (winner.ok && winner.value) return accept(winner.value);
    }
    return saved;
  }

  const unsubscribe = storage.subscribe((change) => {
    if (change.mode === mode && change.revision !== state.revision) publish({ externalChange: true });
  });
  const editable = (): StorageFailure | null => !state.project || state.status === "loading" || state.status === "blocked"
    ? rejected("Open a readable project before changing it.", "blocked") : null;

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    /** Reload is explicit; a notification never discards a dirty draft. */
    reload: (discardDraft = false) => enqueue(async () => {
      if (state.dirty && !discardDraft) return rejected("There is unsaved work. Download its backup or explicitly discard the draft before reloading.", "conflict");
      return load();
    }),
    update: (change: (project: StudioProject) => StudioProject) => enqueue(async () => {
      const error = editable();
      if (error) return error;
      let project: StudioProject;
      try { project = change(clone(state.project!)); } catch { return rejected("The edit could not be applied. The existing draft is unchanged."); }
      if (!project || project.id !== state.project!.id || project.mode !== mode) return rejected("An edit cannot change the project's identity or practice/personal mode.");
      return persist({ ...project, updatedAt: new Date().toISOString() });
    }),
    retry: () => enqueue(async () => {
      const error = editable();
      if (error) return error;
      return persist(clone(state.project!));
    }),
    importBackup: (raw: string) => enqueue(async () => {
      const error = editable();
      if (error) return error;
      if (state.dirty) return rejected("Save or download your unsaved work and reload before replacing the project.", "conflict");
      const parsed = importProjectBackup(raw);
      if (!parsed.ok) return rejected(parsed.error);
      if (parsed.project.mode !== mode) return rejected(`This backup belongs to ${parsed.project.mode} mode. Open that mode to import it.`);
      return persist(parsed.project, "import");
    }),
    reset: () => enqueue(async () => {
      const error = editable();
      if (error) return error;
      if (state.dirty) return rejected("Save or download your unsaved work and reload before starting over.", "conflict");
      return persist(createStudioProject(mode), "reset");
    }),
    exportBackup(): BackupResult & { saved?: boolean } {
      if (!state.project) return { ok: false, error: "There is no readable project to export. The original may be available as recoveryRaw." };
      return { ...exportProjectBackup(state.project), saved: !state.dirty };
    },
    recovery: () => storage.recovery(mode),
    /** Focus/visibility fallback for browsers without BroadcastChannel. */
    checkForUpdates: () => enqueue(async () => {
      const result = await storage.read(mode);
      if (!result.ok) return result;
      if ((result.value?.revision ?? null) !== state.revision) publish({ externalChange: true });
      return { ok: true };
    }),
    close() { ended = true; unsubscribe(); storage.close(); state = { ...state, status: "closed" }; listeners.clear(); },
  };
}

export type ProjectSession = ReturnType<typeof createProjectSession>;
