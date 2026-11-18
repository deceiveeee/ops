import { expect, type Page } from "@playwright/test";
import { exportProjectBackup } from "../lib/studio-project/backup";
import { createStudioProject } from "../lib/studio-project/create";
import { addPosition } from "../lib/studio-project/operations";
import type { StudioProject } from "../lib/studio-project/schema";

/**
 * A practice portfolio with weights typed by hand, as Studio kept them before
 * the nine steps: each weight a share of the money after the cash kept aside.
 * Steps 7 to 9 read such a portfolio exactly as they read one that was built.
 */
export function typedProject(weights: [string, number][], patch: Partial<StudioProject["goal"]> = {}, now = "2026-11-17T12:00:00.000Z"): StudioProject {
  let project = createStudioProject("practice", now);
  for (const [id] of weights) project = addPosition(project, id, undefined, now);
  return {
    ...project,
    goal: { ...project.goal, ...patch },
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative,
      positions: alternative.positions.map((position) => ({ ...position, targetWeightPct: weights.find(([id]) => id === position.instrumentId)![1] })),
    })),
  };
}

/** The save status Studio shows once a write has landed. */
export const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^Saved in this browser$/ })).toBeVisible({ timeout: 20_000 });

/**
 * Open Studio with a practice project already saved, as a learner returning to
 * earlier work would. The project goes through the same backup validation the
 * app uses, so a fixture Studio would refuse fails here, not as a blank page.
 */
export async function seedProject(page: Page, project: StudioProject, path: string) {
  const backup = exportProjectBackup(project);
  if (!backup.ok) throw new Error(backup.error);
  await page.goto(path);
  await saved(page);
  await page.evaluate(async (raw) => {
    window.localStorage.setItem("ops-studio-mode", "practice");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("ops-studio-projects");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("projects", "readwrite");
      transaction.objectStore("projects").put({ mode: "practice", revision: `seed-${Date.now()}`, raw });
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
  }, backup.raw);
  await page.reload();
  await saved(page);
}
