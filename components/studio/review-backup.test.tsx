import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { addStudioHolding, calculateStudio, createStudioPlan, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { ReviewStage, type StageActions, type StageProps, type StageResult } from "./stages";

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
 * In the workspace every download is one of the project's own actions
 * (`WorkspaceStage` builds them from the session's record), so the Review page
 * has to hand each button to them and never write a file of its own.
 */

const PLAN: StudioPlan = addStudioHolding(createStudioPlan("practice"), "aapl");

function renderReview(actions: StageActions) {
  const props: StageProps = {
    plan: PLAN,
    calculation: calculateStudio(PLAN, STUDIO_CATALOG),
    update: () => Promise.resolve<StageResult>({ ok: true }),
    importBackup: () => Promise.resolve<StageResult>({ ok: true }),
    reset: () => Promise.resolve<StageResult>({ ok: true }),
    actions,
  };
  render(<ReviewStage {...props} />);
}

const noAction = () => {};

describe("downloading from Review", () => {
  it("takes the backup from the project, not from the plan on screen", () => {
    // jsdom has no object URLs; a file the page wrote itself would pass through here.
    const createObjectURL = vi.fn((_file: Blob) => "blob:test");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

    const downloadBackup = vi.fn();
    renderReview({ downloadBackup, downloadText: noAction, downloadCsv: noAction, restore: noAction, startAgain: noAction });

    fireEvent.click(screen.getByRole("button", { name: "Download a backup" }));

    expect(downloadBackup).toHaveBeenCalledOnce();
    // The plan's own JSON is what a rejected candidate cannot survive, so the
    // page writing any file here would be the backup that loses it.
    expect(createObjectURL).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("writes the readable copy from the project too", () => {
    const createObjectURL = vi.fn((_file: Blob) => "blob:test");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });

    const downloadText = vi.fn();
    renderReview({ downloadBackup: noAction, downloadText, downloadCsv: noAction, restore: noAction, startAgain: noAction });

    fireEvent.click(screen.getByRole("button", { name: "Download the readable plan" }));

    expect(downloadText).toHaveBeenCalledOnce();
    expect(createObjectURL).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
