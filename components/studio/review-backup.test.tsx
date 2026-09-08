import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { addStudioHolding, calculateStudio, createStudioPlan, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { ReviewStage, type StageProps, type StageResult } from "./stages";

/**
 * Where a backup comes from.
 *
 * It used to be `exportStudioJson(plan)` — a serialisation of the six steps'
 * view of the record rather than of the record. That was lossless only while
 * the two were the same thing. They are not: the stored project also holds
 * research for investments that were considered and rejected, company figures
 * looked up in the investigation view, and decisions taken. A backup built from
 * the plan would silently omit all of it, and restoring that file would then be
 * the thing that deleted it.
 *
 * So the button has to ask the session, and it has to say so when the session
 * cannot answer rather than handing over a file that looks like a backup.
 */

const PLAN: StudioPlan = addStudioHolding(createStudioPlan("practice"), "aapl");

function renderReview(overrides: Partial<StageProps> = {}) {
  const props: StageProps = {
    plan: PLAN,
    calculation: calculateStudio(PLAN, STUDIO_CATALOG),
    update: () => Promise.resolve<StageResult>({ ok: true }),
    importBackup: () => Promise.resolve<StageResult>({ ok: true }),
    reset: () => Promise.resolve<StageResult>({ ok: true }),
    exportBackup: () => ({ ok: true, raw: "{}" }),
    exportReadable: () => "",
    ...overrides,
  };
  render(<ReviewStage {...props} />);
  return props;
}

describe("downloading a backup", () => {
  it("takes its contents from the stored record, not from the plan on screen", async () => {
    // jsdom has no object URLs, so the file is intercepted on its way to one.
    // The assertion has to be on what is in it: calling the session and then
    // writing something else would otherwise look identical from outside.
    const createObjectURL = vi.fn((_file: Blob) => "blob:test");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

    const raw = '{"schemaVersion":2,"candidates":[{"status":"rejected"}]}';
    const exportBackup = vi.fn(() => ({ ok: true as const, raw }));
    renderReview({ exportBackup });

    fireEvent.click(screen.getByRole("button", { name: "Download a backup" }));

    expect(exportBackup).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledOnce();
    const written = createObjectURL.mock.calls[0][0];
    // A rejected candidate is the thing a plan cannot describe, so its survival
    // is what separates a backup of the record from a backup of this view of it.
    expect(await written.text()).toBe(raw);
    vi.unstubAllGlobals();
  });

  it("says a backup could not be written rather than handing over an empty file", () => {
    const createObjectURL = vi.fn(() => "blob:test");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

    renderReview({
      exportBackup: () => ({ ok: false, error: "Studio project backups support up to 10 MiB." }),
    });

    fireEvent.click(screen.getByRole("button", { name: "Download a backup" }));

    expect(screen.getByText("That backup could not be written")).toBeInTheDocument();
    expect(screen.getByText("Studio project backups support up to 10 MiB.")).toBeInTheDocument();
    // The failure is the point: a downloaded file here would be an empty one
    // that a learner would keep believing their work was in it.
    expect(createObjectURL).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("writes the readable copy from the record too", () => {
    const createObjectURL = vi.fn(() => "blob:test");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

    const exportReadable = vi.fn(() => "ALL RESEARCH (INCLUDING INVESTMENTS NOT HELD)");
    renderReview({ exportReadable });

    fireEvent.click(screen.getByRole("button", { name: "Download the readable plan" }));

    expect(exportReadable).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});
