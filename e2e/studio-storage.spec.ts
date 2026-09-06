import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import type { ProjectSession } from "../lib/studio-project/session";

type Harness = typeof import("../lib/studio-project/storage")
  & typeof import("../lib/studio-project/session")
  & typeof import("../lib/studio-project/create")
  & typeof import("../lib/studio-project/backup")
  & typeof import("../lib/studio-project/operations")
  & typeof import("../lib/studio");
declare global {
  interface Window { studioStorageTest: Harness; testSession: ProjectSession }
}

const ORIGIN = "https://ops-storage.test";
const DATABASE = "studio-storage-browser-tests";

/**
 * Serve the real TS modules as browser ES modules using the existing compiler.
 * Only transport/type removal is supplied here: IndexedDB, transactions and
 * BroadcastChannel are Chromium's own implementations, never a storage mock.
 * The isolated origin does not read or change a user's local Studio database.
 */
async function boot(page: Page) {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (!pathname.startsWith("/modules/")) {
      await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Studio storage verification</title><p>Native browser storage verification</p>" });
      return;
    }
    const relative = pathname.slice("/modules/".length);
    const filename = path.resolve(process.cwd(), relative);
    if (!filename.startsWith(path.resolve(process.cwd(), "lib") + path.sep) || !filename.endsWith(".ts")) {
      await route.fulfill({ status: 404, body: "Unsupported test module" }); return;
    }
    const source = await readFile(filename, "utf8");
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }, fileName: filename }).outputText;
    const body = compiled.replace(/from\s+(["'])(@\/[^"']+|\.{1,2}\/[^"']+)\1/g, (_match, _quote, specifier: string) => {
      const target = specifier.startsWith("@/") ? specifier.slice(2) : path.posix.join(path.posix.dirname(relative), specifier);
      return `from "/modules/${target.endsWith(".ts") ? target : `${target}.ts`}"`;
    });
    await route.fulfill({ contentType: "text/javascript", body });
  });
  await page.goto(ORIGIN);
  await page.evaluate(async () => {
    const paths = ["storage", "session", "create", "backup", "operations"].map((name) => `/modules/lib/studio-project/${name}.ts`);
    paths.push("/modules/lib/studio.ts");
    window.studioStorageTest = Object.assign({}, ...await Promise.all(paths.map((modulePath) => import(modulePath))));
  });
}

async function openSession(page: Page, mode: "practice" | "personal" = "practice", notifications = true) {
  return page.evaluate(async ({ databaseName, mode, notifications }) => {
    const api = window.studioStorageTest;
    window.testSession = api.createProjectSession(api.createIndexedDbProjectStorage({ databaseName, notifications }), mode);
    return window.testSession.reload();
  }, { databaseName: DATABASE, mode, notifications });
}

test("migrates the real legacy slot, preserves its text, and reopens rejected research", async ({ page }) => {
  await boot(page);
  const original = await page.evaluate(() => {
    const api = window.studioStorageTest;
    let plan = api.addStudioHolding(api.createStudioPlan("practice", "2026-09-05T00:00:00Z"), "aapl");
    plan = api.updateStudioHolding(plan, "aapl", { research: { why: "Repeat customer evidence" } });
    const raw = `\n${JSON.stringify(plan, null, 4)}\n`;
    localStorage.setItem(api.STUDIO_STORAGE_KEY, raw);
    return raw;
  });
  expect(await openSession(page)).toEqual({ ok: true });
  await page.evaluate(async () => {
    const api = window.studioStorageTest;
    await window.testSession.update((project) => api.setCandidateStatus(api.removePosition(project, "aapl"), "aapl", "rejected", "Insufficient evidence for this price"));
    window.testSession.close();
  });
  await page.reload();
  await boot(page);
  expect(await openSession(page)).toEqual({ ok: true });
  const result = await page.evaluate(() => ({ state: window.testSession.getSnapshot(), original: localStorage.getItem(window.studioStorageTest.STUDIO_STORAGE_KEY), backup: window.testSession.exportBackup() }));
  expect(result.original).toBe(original);
  expect(result.state.project?.migratedFrom?.raw).toBe(original);
  expect(result.state.project?.candidates[0]).toMatchObject({ status: "rejected", why: "Repeat customer evidence", rejectedBecause: "Insufficient evidence for this price" });
  expect(result.state.project?.alternatives[0].positions).toEqual([]);
  expect(result.backup).toMatchObject({ ok: true, saved: true });
});

test("two independent tabs competing for one revision have exactly one winner without notifications", async ({ page, context }) => {
  await boot(page);
  expect(await openSession(page, "practice", false)).toEqual({ ok: true });
  const other = await context.newPage();
  await boot(other);
  expect(await openSession(other, "practice", false)).toEqual({ ok: true });
  const results = await Promise.all([
    page.evaluate(() => window.testSession.update((project) => ({ ...project, name: "First tab research" }))),
    other.evaluate(() => window.testSession.update((project) => ({ ...project, name: "Second tab research" }))),
  ]);
  expect(results.filter((result) => result.ok)).toHaveLength(1);
  expect(results.filter((result) => !result.ok && result.code === "conflict")).toHaveLength(1);
  const loser = results[0].ok ? other : page;
  const winner = results[0].ok ? page : other;
  const draft = await loser.evaluate(() => ({ state: window.testSession.getSnapshot(), backup: window.testSession.exportBackup() }));
  expect(draft.state.status).toBe("conflict");
  expect(draft.state.dirty).toBe(true);
  expect(draft.backup).toMatchObject({ ok: true, saved: false });
  expect(await loser.evaluate(() => window.testSession.reload())).toMatchObject({ ok: false, code: "conflict" });
  const savedName = await winner.evaluate(() => window.testSession.getSnapshot().project!.name);
  expect(await loser.evaluate(() => window.testSession.reload(true))).toEqual({ ok: true });
  expect(await loser.evaluate(() => window.testSession.getSnapshot().project!.name)).toBe(savedName);
});

test("rapid edits in one session compose rather than saving ten copies of the first state", async ({ page }) => {
  await boot(page); await openSession(page);
  const result = await page.evaluate(async () => {
    const writes = await Promise.all(Array.from({ length: 10 }, () => window.testSession.update((project) => ({ ...project, goal: { ...project.goal, monthlyContribution: project.goal.monthlyContribution + 1 } }))));
    await window.testSession.reload();
    return { writes, contribution: window.testSession.getSnapshot().project!.goal.monthlyContribution };
  });
  expect(result.writes.every((write) => write.ok)).toBe(true);
  expect(result.contribution).toBe(10);
});

test("an abort after put success rolls back both the replacement and its recovery copy", async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(async (databaseName) => {
    const api = window.studioStorageTest;
    const store = api.createIndexedDbProjectStorage({ databaseName });
    const project = api.createStudioProject("practice");
    const original = JSON.stringify(project);
    const first = await store.write("practice", original, null);
    if (!first.ok) throw new Error(first.error);
    const nativePut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<IDBObjectStore["put"]>) {
      const request = nativePut.apply(this, args);
      if (this.name === "projects") request.addEventListener("success", () => this.transaction.abort(), { once: true });
      return request;
    };
    let write;
    try { write = await store.write("practice", JSON.stringify({ ...project, name: "Aborted import" }), first.value.revision, "import"); }
    finally { IDBObjectStore.prototype.put = nativePut; }
    return { write, read: await store.read("practice"), recovery: await store.recovery("practice"), original, revision: first.value.revision };
  }, DATABASE);
  expect(result.write.ok).toBe(false);
  expect(result.read).toMatchObject({ ok: true, value: { raw: result.original, revision: result.revision } });
  expect(result.recovery).toEqual({ ok: true, value: [] });
});

test("quota failure retains an exportable draft and retry saves that draft", async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(async (databaseName) => {
    const api = window.studioStorageTest;
    const store = api.createIndexedDbProjectStorage({ databaseName });
    const session = api.createProjectSession(store, "practice");
    await session.reload();
    const previous = session.getSnapshot().savedProject;
    const realWrite = store.write;
    store.write = async () => api.storageFailure(new DOMException("Full", "QuotaExceededError"));
    const failed = await session.update((project) => ({ ...project, name: "Unsaved investigation" }));
    const draft = session.getSnapshot();
    const backup = session.exportBackup();
    store.write = realWrite;
    const retry = await session.retry();
    await session.reload();
    return { failed, draft, backup, previous, retry, final: session.getSnapshot() };
  }, DATABASE);
  expect(result.failed).toMatchObject({ ok: false, code: "quota" });
  expect(result.draft).toMatchObject({ status: "unsaved", dirty: true, project: { name: "Unsaved investigation" }, savedProject: result.previous });
  expect(result.backup).toMatchObject({ ok: true, saved: false });
  expect(result.retry).toEqual({ ok: true });
  expect(result.final).toMatchObject({ status: "ready", dirty: false, project: { name: "Unsaved investigation" } });
});

test("failed import retains its replacement semantics on retry, and reset also archives", async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(async (databaseName) => {
    const api = window.studioStorageTest;
    const store = api.createIndexedDbProjectStorage({ databaseName });
    const session = api.createProjectSession(store, "practice");
    await session.reload();
    await session.update((project) => ({ ...project, name: "Before import" }));
    const original = session.exportBackup();
    const incoming = { ...api.createStudioProject("practice"), name: "Imported research" };
    const write = store.write;
    store.write = async () => api.storageFailure(new DOMException("Full", "QuotaExceededError"));
    const failed = await session.importBackup(JSON.stringify(incoming));
    store.write = write;
    await session.retry();
    const restored = session.getSnapshot().project;
    await session.reset();
    return { failed, original, incoming, restored, recovery: await session.recovery() };
  }, DATABASE);
  expect(result.failed).toMatchObject({ ok: false, code: "quota" });
  expect(result.restored).toEqual(result.incoming);
  if (!result.recovery.ok || !result.original.ok) throw new Error("Expected recovery records and backup");
  expect(result.recovery.value).toHaveLength(2);
  expect(result.recovery.value.find((row) => row.reason === "import")?.raw).toBe(result.original.raw);
  expect(JSON.parse(result.recovery.value.find((row) => row.reason === "reset")!.raw)).toEqual(result.incoming);
});

test("invalid imports and future stored schemas cannot overwrite existing work, even through reset", async ({ page }) => {
  await boot(page); await openSession(page);
  const result = await page.evaluate(async (databaseName) => {
    const before = window.testSession.exportBackup();
    const invalid = await window.testSession.importBackup('{"schemaVersion":2}');
    const after = window.testSession.exportBackup();
    const raw = '{ "schemaVersion": 99, "futureNotes": "Keep this exactly" }';
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open(databaseName, 1);
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction("projects", "readwrite");
        tx.objectStore("projects").put({ mode: "practice", revision: "future-token", raw });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onabort = () => { db.close(); reject(tx.error); };
      };
      open.onerror = () => reject(open.error);
    });
    const reload = await window.testSession.reload();
    const state = window.testSession.getSnapshot();
    const reset = await window.testSession.reset();
    const store = window.studioStorageTest.createIndexedDbProjectStorage({ databaseName });
    const overwrite = await store.write("practice", JSON.stringify(window.studioStorageTest.createStudioProject("practice")), "future-token", "reset");
    return { before, invalid, after, raw, reload, state, reset, overwrite, stored: await store.read("practice") };
  }, DATABASE);
  expect(result.invalid.ok).toBe(false);
  expect(result.after).toEqual(result.before);
  expect(result.reload).toMatchObject({ ok: false, code: "blocked" });
  expect(result.state).toMatchObject({ status: "blocked", recoveryRaw: result.raw });
  expect(result.reset.ok).toBe(false);
  expect(result.overwrite).toMatchObject({ ok: false, code: "blocked" });
  expect(result.stored).toMatchObject({ ok: true, value: { raw: result.raw, revision: "future-token" } });
});

test("practice and personal slots stay separate and cross-mode imports are refused", async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(async (databaseName) => {
    const api = window.studioStorageTest;
    const practice = api.createProjectSession(api.createIndexedDbProjectStorage({ databaseName }), "practice");
    const personal = api.createProjectSession(api.createIndexedDbProjectStorage({ databaseName }), "personal");
    await Promise.all([practice.reload(), personal.reload()]);
    await practice.update((project) => ({ ...project, name: "Practice only" }));
    await personal.update((project) => ({ ...project, name: "Personal only" }));
    const backup = personal.exportBackup();
    if (!backup.ok) throw new Error(backup.error);
    const crossMode = await practice.importBackup(backup.raw);
    await practice.reset();
    await personal.reload();
    return { crossMode, practice: practice.getSnapshot(), personal: personal.getSnapshot(), personalRecovery: await personal.recovery() };
  }, DATABASE);
  expect(result.crossMode.ok).toBe(false);
  expect(result.practice.project?.mode).toBe("practice");
  expect(result.personal.project?.name).toBe("Personal only");
  expect(result.personalRecovery).toEqual({ ok: true, value: [] });
});

test("cross-tab notifications flag a new revision without replacing the first tab's draft", async ({ page, context }) => {
  await boot(page); await openSession(page);
  const other = await context.newPage(); await boot(other); await openSession(other);
  await other.evaluate(() => window.testSession.update((project) => ({ ...project, name: "External revision" })));
  await expect.poll(() => page.evaluate(() => window.testSession.getSnapshot().externalChange)).toBe(true);
  expect(await page.evaluate(() => window.testSession.getSnapshot().project!.name)).toBe("My practice portfolio");
  expect(await page.evaluate(() => window.testSession.update((project) => ({ ...project, name: "Keep this draft" })))).toMatchObject({ ok: false, code: "conflict" });
  expect(await page.evaluate(() => window.testSession.exportBackup())).toMatchObject({ ok: true, saved: false });
});

test("blocked storage has no false ready state, and a closed connection cannot save", async ({ page }) => {
  await boot(page);
  const result = await page.evaluate(async (databaseName) => {
    const api = window.studioStorageTest;
    const factory = { open() { throw new DOMException("Blocked", "SecurityError"); } } as unknown as IDBFactory;
    const unavailable = api.createProjectSession(api.createIndexedDbProjectStorage({ databaseName, factory }), "practice");
    const opened = await unavailable.reload();
    const state = unavailable.getSnapshot();
    const store = api.createIndexedDbProjectStorage({ databaseName });
    await store.read("practice");
    store.close();
    return { opened, state, afterClose: await store.write("practice", JSON.stringify(api.createStudioProject("practice")), null) };
  }, DATABASE);
  expect(result.opened).toMatchObject({ ok: false, code: "unavailable" });
  expect(result.state).toMatchObject({ status: "unavailable", project: null, savedProject: null });
  expect(result.afterClose).toMatchObject({ ok: false, code: "closed" });
});

test("simultaneous first opens converge on the same project without replacing the winning initialization", async ({ page, context }) => {
  await boot(page);
  const other = await context.newPage(); await boot(other);
  const opened = await Promise.all([openSession(page, "practice", false), openSession(other, "practice", false)]);
  expect(opened).toEqual([{ ok: true }, { ok: true }]);
  const first = await page.evaluate(() => window.testSession.getSnapshot());
  const second = await other.evaluate(() => window.testSession.getSnapshot());
  expect(second.project?.id).toBe(first.project?.id);
  expect(second.revision).toBe(first.revision);
  expect(second.dirty).toBe(false);
});

test("an unreadable legacy record remains recoverable and does not seed an empty replacement", async ({ page }) => {
  await boot(page);
  const raw = '{ "schemaVersion": 25, "research": "Future legacy work" }';
  await page.evaluate((raw) => localStorage.setItem(window.studioStorageTest.STUDIO_STORAGE_KEY, raw), raw);
  expect(await openSession(page)).toMatchObject({ ok: false, code: "blocked" });
  const result = await page.evaluate(async (databaseName) => ({
    state: window.testSession.getSnapshot(),
    stored: await window.studioStorageTest.createIndexedDbProjectStorage({ databaseName }).read("practice"),
    original: localStorage.getItem(window.studioStorageTest.STUDIO_STORAGE_KEY),
  }), DATABASE);
  expect(result.state).toMatchObject({ status: "blocked", project: null, recoveryRaw: raw });
  expect(result.stored).toEqual({ ok: true, value: null });
  expect(result.original).toBe(raw);
});

test("a throwing edit does not mutate the displayed or persisted research", async ({ page }) => {
  await boot(page); await openSession(page);
  const result = await page.evaluate(async () => {
    const before = window.testSession.exportBackup();
    const update = await window.testSession.update((project) => {
      project.name = "Accidental partial mutation";
      throw new Error("Edit failed midway");
    });
    const after = window.testSession.exportBackup();
    await window.testSession.reload();
    return { before, update, after, reloaded: window.testSession.exportBackup() };
  });
  expect(result.update.ok).toBe(false);
  expect(result.after).toEqual(result.before);
  expect(result.reloaded).toEqual(result.before);
});
