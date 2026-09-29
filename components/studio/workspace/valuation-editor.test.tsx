import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { newValuation, type ValuationCase } from "@/lib/studio-project/valuation-cases";
import ValuationEditor from "./ValuationEditor";

/**
 * A keystroke typed while an earlier save lands must stay on the page.
 *
 * The editor shows a draft and re-reads the saved record whenever nothing is
 * being saved, so a change from another tab or a reload shows up. Under load
 * the two met: a save for "N" finished, the page rendered "nothing pending",
 * the learner typed "e", and the re-read then put the saved "N" back over it.
 * A full browser run saved "Ne capital…" for typed "New capital…".
 *
 * The session here is a stand-in whose saves complete only when the test says,
 * and whose status the test sets, so the moment is reproduced exactly.
 */

type SessionState = { pending: boolean; dirty: boolean; status: string };
const workspace = vi.hoisted(() => ({
  state: { pending: false, dirty: false, status: "ready" } as SessionState,
  saves: [] as (() => void)[],
}));

vi.mock("./WorkspaceProvider", () => ({
  useWorkspace: () => ({
    session: {
      ...workspace.state,
      update: () => new Promise((resolve) => { workspace.saves.push(() => resolve({ ok: true })); }),
    },
    report: (result: unknown) => result,
  }),
}));

const example = newValuation(true, "2026-09-28T00:00:00.000Z");
const withReason = (reasoning: string): ValuationCase => ({ ...example, reasoning, updatedAt: new Date().toISOString() });
const editor = (record: ValuationCase) => <ValuationEditor record={record} alternatives={[record]} disabled={false} onSelect={() => undefined} onCopy={() => undefined} onChooseCompany={() => undefined} />;
const reasoning = () => screen.getByLabelText("Why these assumptions?") as HTMLTextAreaElement;

beforeEach(() => {
  workspace.state = { pending: false, dirty: false, status: "ready" };
  workspace.saves = [];
});

describe("ValuationEditor while a save is in the air", () => {
  it("keeps a keystroke typed as the previous save lands", async () => {
    const { rerender } = render(editor(example));
    fireEvent.change(reasoning(), { target: { value: "N" } });
    // The save for "N" is under way.
    workspace.state = { pending: true, dirty: true, status: "saving" };
    rerender(editor(example));
    await act(async () => { workspace.saves[0](); });

    // It lands: the page learns nothing is pending, with "N" saved, and "e" is typed in the same moment.
    act(() => {
      workspace.state = { pending: false, dirty: false, status: "ready" };
      rerender(editor(withReason("N")));
      fireEvent.change(reasoning(), { target: { value: "Ne" } });
    });
    expect(reasoning().value).toBe("Ne");

    // The next keystroke builds on what is on the page, not on the older save.
    fireEvent.change(reasoning(), { target: { value: "New" } });
    expect(reasoning().value).toBe("New");
  });

  it("still shows a change made elsewhere once its own saves have landed", async () => {
    const { rerender } = render(editor(example));
    fireEvent.change(reasoning(), { target: { value: "Mine" } });
    await act(async () => { workspace.saves[0](); });
    // Another tab's version is loaded while nothing is being saved here.
    act(() => { rerender(editor(withReason("From the other tab"))); });
    expect(reasoning().value).toBe("From the other tab");
  });
});
