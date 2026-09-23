import { expect, type Page } from "@playwright/test";

/**
 * What the browser has actually written, and how to wait for it.
 *
 * Studio saves as the learner types, through a queue that ends in an IndexedDB
 * write. A test that edits and then calls `page.goto` starts a fresh document:
 * if the write has not landed, the reload reads a project without the edit, and
 * everything after it fails for a reason that has nothing to do with what was
 * being tested.
 *
 * That is why the suite failed one test per full run and a different one each
 * time. Alone, a write finishes in a few milliseconds and no test ever notices.
 * With the whole suite running, two browsers and one server compete for four
 * cores, the write takes longer than the navigation, and whichever test happens
 * to lose the race that run is the one that fails. Twelve places across five
 * specs navigated within three lines of an edit.
 *
 * Waiting on the page's own "Saved in this browser" is not enough: it is
 * already showing from the previous keystroke, so it passes instantly and
 * proves nothing. The store is the only thing that can answer.
 */

const DATABASE = "ops-studio-projects";

/** A saved project, as much of it as these tests read. */
export type StoredProject = {
  mode?: string;
  goal?: { purpose?: string };
  investigations?: { id: string; company: string; figures?: Record<string, number> }[];
  alternatives?: { positions?: { instrumentId: string }[] }[];
  candidates?: { instrumentId: string; status: string }[];
};

/** Every project row in this browser, parsed. Recovery rows are skipped. */
export async function storedProjects(page: Page): Promise<StoredProject[]> {
  return page.evaluate<StoredProject[], string>(async (name) => {
    const open = await new Promise<IDBDatabase | null>((resolve) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    if (!open) return [];
    if (!open.objectStoreNames.contains("projects")) {
      open.close();
      return [];
    }
    const rows = await new Promise<Record<string, string>[]>((resolve) => {
      const request = open.transaction("projects").objectStore("projects").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
    open.close();
    const parsed: unknown[] = [];
    for (const row of rows) {
      try {
        parsed.push(JSON.parse(row.raw ?? JSON.stringify(row)));
      } catch {
        // The recovery store keeps unparsed text by design.
      }
    }
    return parsed as never;
  }, DATABASE);
}

/**
 * Wait until some saved project holds what was just entered.
 *
 * `what` is named in the failure, so a test that times out here says the write
 * never landed rather than pointing at whatever was clicked next.
 */
export async function saved(
  page: Page,
  holds: (project: StoredProject) => boolean,
  what: string,
  timeout = 15_000,
): Promise<void> {
  await expect
    .poll(async () => (await storedProjects(page)).some(holds), {
      timeout,
      message: `the browser never saved ${what}`,
    })
    .toBe(true);
}

/** The instruments held in any of a project's portfolios. */
export function heldIn(project: StoredProject): string[] {
  return (project.alternatives ?? []).flatMap((alternative) =>
    (alternative.positions ?? []).map((position) => position.instrumentId),
  );
}
