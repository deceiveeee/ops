import { useState } from "react";
import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { addStudioHolding, calculateStudio, createStudioPlan, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { Field } from "./shared";
import { BuildStage, type StageResult } from "./stages";

/**
 * What happens to a control while its save is still in the air.
 *
 * Studio's writes are about to stop being synchronous: the workspace moves from
 * localStorage, which acknowledges an edit before `setItem` returns, to a
 * database that answers later. A control bound straight to the saved value is
 * safe only under the first of those. Under the second it fights the person
 * typing -- the second character of "60" is entered while the write for "6" is
 * still open, and when that write lands it re-renders the input back to 6.
 *
 * These tests hold the buffer that prevents it, and they hold both halves of
 * its contract: it must not lose a keystroke, and it must not become a
 * permanent fork from the saved value either.
 */

/** A save that only completes when the test says so. */
function useDeferredSaves(queue: (() => void)[]) {
  return (apply: () => void) =>
    new Promise<void>((resolve) => {
      queue.push(() => {
        apply();
        resolve();
      });
    });
}

/** A text field whose writes land only when the test drains the queue. */
function SlowField({ queue }: { queue: (() => void)[] }) {
  const [saved, setSaved] = useState("");
  const defer = useDeferredSaves(queue);
  return (
    <>
      <Field label="What I do with new money" value={saved} onChange={(raw) => defer(() => setSaved(raw))} />
      {/* Stands in for anything that replaces the record from outside the
          control: a restored backup, a reset, another tab. */}
      <button type="button" onClick={() => setSaved("from a backup")}>
        Restore
      </button>
    </>
  );
}

/** The build table, with the plan updating only when the test lets it. */
function SlowBuild({ queue }: { queue: (() => void)[] }) {
  const [plan, setPlan] = useState<StudioPlan>(() => addStudioHolding(createStudioPlan("practice"), "aapl"));
  return (
    <BuildStage
      plan={plan}
      calculation={calculateStudio(plan, STUDIO_CATALOG)}
      /*
       * Reports success at once and applies the change later, which is the
       * shape of the hazard: nothing looks like it failed, the value simply
       * arrives after the next keystroke. Resolving the promise immediately is
       * deliberate -- it leaves the focus guard as the only thing holding the
       * keystroke, so this test cannot pass on the pending count alone.
       */
      update={(change) => {
        queue.push(() => setPlan((current) => change(current)));
        return Promise.resolve<StageResult>({ ok: true });
      }}
      importBackup={() => Promise.resolve<StageResult>({ ok: true })}
      reset={() => Promise.resolve<StageResult>({ ok: true })}
      exportBackup={() => ({ ok: true, raw: "" })}
      exportReadable={() => ""}
      decisions={{
        againstReason: () => null,
        decideAgainst: () => Promise.resolve<StageResult>({ ok: true }),
        reconsider: () => Promise.resolve<StageResult>({ ok: true }),
        decidedAgainst: () => [],
      }}
    />
  );
}

const drain = (queue: (() => void)[], index: number) =>
  act(async () => {
    queue[index]();
  });

/**
 * A keystroke, and the microtask that follows it.
 *
 * The buffer settles its pending count in a `.finally`, so a bare `fireEvent`
 * leaves a state update queued outside `act` and React says so. Awaiting the
 * act keeps the warning honest rather than ambient.
 */
const type = (element: HTMLElement, value: string) =>
  act(async () => {
    fireEvent.change(element, { target: { value } });
  });

describe("a control whose save has not landed yet", () => {
  it("keeps the second keystroke when the first save resolves after it", async () => {
    const queue: (() => void)[] = [];
    render(<SlowField queue={queue} />);
    const input = screen.getByLabelText("What I do with new money");

    fireEvent.focus(input);
    await type(input, "6");
    await type(input, "60");
    expect(queue).toHaveLength(2);

    // The write for "6" completes, so the saved value is now behind what was
    // typed. Bound straight to it, the input would go back to reading "6".
    await drain(queue, 0);
    expect(input).toHaveValue("60");

    await drain(queue, 1);
    expect(input).toHaveValue("60");
  });

  it("survives leaving the control before the save has finished", async () => {
    const queue: (() => void)[] = [];
    render(<SlowField queue={queue} />);
    const input = screen.getByLabelText("What I do with new money");

    fireEvent.focus(input);
    await type(input, "quarterly");
    // Tabbing away does not wait for the write. Nothing has been saved yet, so
    // the only correct thing to show is what was typed.
    fireEvent.blur(input);
    expect(input).toHaveValue("quarterly");

    await drain(queue, 0);
    expect(input).toHaveValue("quarterly");
  });

  it("shows a value replaced from elsewhere once nothing is outstanding", async () => {
    const queue: (() => void)[] = [];
    render(<SlowField queue={queue} />);
    const input = screen.getByLabelText("What I do with new money");

    fireEvent.focus(input);
    await type(input, "mine");
    await drain(queue, 0);
    fireEvent.blur(input);

    // The other half of the contract. A buffer that never resynchronised would
    // keep showing the learner's old text after a restored backup replaced it,
    // which is a worse failure than the one it exists to prevent.
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Restore" }));
    });
    expect(input).toHaveValue("from a backup");
  });

  it("keeps a two-digit weight when the first digit is applied late", async () => {
    const queue: (() => void)[] = [];
    render(<SlowBuild queue={queue} />);
    const weight = screen.getByLabelText("AAPL target percentage");

    fireEvent.focus(weight);
    await type(weight, "6");
    await type(weight, "60");

    // The plan now holds 6. This is the exact case that made this control worth
    // changing: a weight of 6 instead of 60 is a portfolio nobody meant to own.
    await drain(queue, 0);
    expect(weight).toHaveValue(60);

    await drain(queue, 1);
    expect(weight).toHaveValue(60);
  });
});
