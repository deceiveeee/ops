import { readStudioRecord } from "./migrate";
import type { StudioProject } from "./schema";
import { validateStudioProject, MAX_PROJECT_BYTES } from "./validate";

export type BackupResult = { ok: true; raw: string } | { ok: false; error: string };

/** Transport only the project. Database revision tokens must never come from an imported file. */
export function exportProjectBackup(project: StudioProject): BackupResult {
  const issues = validateStudioProject(project);
  if (issues.length) return { ok: false, error: issues.join(" ") };
  const raw = JSON.stringify(project, null, 2);
  if (new TextEncoder().encode(raw).byteLength > MAX_PROJECT_BYTES) return { ok: false, error: "Studio project backups support up to 10 MiB." };
  return { ok: true, raw };
}

export const importProjectBackup = readStudioRecord;
