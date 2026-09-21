import { describe, expect, it } from "vitest";
import { createStudioProject } from "./create";
import { exportProjectBackup, importProjectBackup } from "./backup";
import {
  addEvidence,
  addPosition,
  removeEvidence,
  removePosition,
  setCandidateStatus,
  updateCandidate,
} from "./operations";
import { findCandidate, type StudioProject } from "./schema";
import { validateStudioProject } from "./validate";

/**
 * The research record: what a learner worked out, kept whether they buy or not.
 *
 * Deciding against an investment is a result, and the reason is the part worth
 * keeping. Every assertion here about what survives — a rejection outliving the
 * position, evidence outliving a backup and restore — is checking the one
 * property the record exists for. A store that quietly dropped any of it would
 * look identical while the learner was still on the page.
 */

const NOW = "2026-09-11T00:00:00.000Z";
const LATER = "2026-09-12T00:00:00.000Z";

const project = (): StudioProject => createStudioProject("practice", NOW);

const evidenceOn = (state: StudioProject, instrumentId: string) =>
  findCandidate(state, instrumentId)?.evidence ?? [];

describe("keeping what you read", () => {
  it("saves a piece of evidence with the source it came from and which way it argues", () => {
    const state = addEvidence(
      project(),
      "vti",
      {
        sourceId: "0001193125-26-077488",
        locator: "Principal investment strategies",
        note: "Tracks the whole US market, so no manager picks the winners",
        role: "supports",
      },
      LATER,
    );

    const [saved] = evidenceOn(state, "vti");
    expect(saved.sourceId).toBe("0001193125-26-077488");
    expect(saved.locator).toBe("Principal investment strategies");
    expect(saved.note).toBe("Tracks the whole US market, so no manager picks the winners");
    expect(saved.role).toBe("supports");
    expect(saved.savedAt).toBe(LATER);
    expect(validateStudioProject(state)).toEqual([]);
  });

  it("starts an investigation for something never held, because reading comes first", () => {
    // Nothing has been added to any portfolio, so there is no candidate to
    // attach to. Dropping the write would lose the learner's work silently.
    const state = addEvidence(project(), "tsm", { sourceId: "0001628280-26-025362", locator: "", note: "Foundry for other designers", role: "context" }, LATER);
    expect(findCandidate(state, "tsm")?.status).toBe("researching");
    expect(evidenceOn(state, "tsm")).toHaveLength(1);
  });

  it("keeps evidence on both sides without balancing them", () => {
    let state = addEvidence(project(), "vti", { sourceId: "a", locator: "", note: "Cheap", role: "supports" }, LATER);
    state = addEvidence(state, "vti", { sourceId: "b", locator: "", note: "Falls with the whole market", role: "challenges" }, LATER);
    state = addEvidence(state, "vti", { sourceId: "c", locator: "", note: "Holds 3,600 companies", role: "context" }, LATER);

    // Order is the order they were saved, and no side is counted or ranked.
    expect(evidenceOn(state, "vti").map((entry) => entry.role)).toEqual(["supports", "challenges", "context"]);
  });

  it("removes one piece and leaves the rest, and ignores an id it does not hold", () => {
    let state = addEvidence(project(), "vti", { sourceId: "a", locator: "", note: "One", role: "supports" }, LATER);
    state = addEvidence(state, "vti", { sourceId: "b", locator: "", note: "Two", role: "challenges" }, LATER);
    const [first] = evidenceOn(state, "vti");

    state = removeEvidence(state, "vti", first.id, LATER);
    expect(evidenceOn(state, "vti").map((entry) => entry.note)).toEqual(["Two"]);

    const unchanged = removeEvidence(state, "vti", "ev-nothing", LATER);
    expect(unchanged).toBe(state);
  });

  it("gives every piece of evidence an id of its own", () => {
    let state = project();
    for (let index = 0; index < 5; index++) {
      state = addEvidence(state, "vti", { sourceId: "a", locator: "", note: `Note ${index}`, role: "supports" }, LATER);
    }
    const ids = evidenceOn(state, "vti").map((entry) => entry.id);
    expect(new Set(ids).size).toBe(5);
    // The validator rejects a repeated id anywhere in the project, so this is
    // not merely tidy: a collision would make the project unsaveable.
    expect(validateStudioProject(state)).toEqual([]);
  });
});

describe("deciding against something", () => {
  it("writes on an investigation that does not exist yet", () => {
    // Until the record shipped, a note could only be written for an investment
    // already in a portfolio. A learner rejecting something never holds it.
    const state = updateCandidate(project(), "aapl", { why: "One company, and one I already own through VTI" }, LATER);
    expect(findCandidate(state, "aapl")?.why).toBe("One company, and one I already own through VTI");
  });

  it("keeps the rejection and its reason after the position is removed", () => {
    let state = addPosition(project(), "aapl", undefined, NOW);
    state = updateCandidate(state, "aapl", { why: "Wanted a single share to follow" }, LATER);
    state = setCandidateStatus(state, "aapl", "rejected", "Already 6% of VTI, so buying it doubles up", LATER);
    state = addEvidence(state, "aapl", { sourceId: "0000320193-25-000079", locator: "Item 1A", note: "Concentration in one product line", role: "challenges" }, LATER);

    state = removePosition(state, "aapl", undefined, LATER);

    // The position is gone; the reasoning that produced the decision is not.
    expect(state.alternatives[0].positions.map((position) => position.instrumentId)).not.toContain("aapl");
    const candidate = findCandidate(state, "aapl");
    expect(candidate?.status).toBe("rejected");
    expect(candidate?.rejectedBecause).toBe("Already 6% of VTI, so buying it doubles up");
    expect(candidate?.why).toBe("Wanted a single share to follow");
    expect(candidate?.evidence).toHaveLength(1);
  });

  it("clears nothing when the standing moves off rejected, so a mistake is recoverable", () => {
    let state = setCandidateStatus(project(), "vti", "rejected", "Too broad for what I want", LATER);
    state = setCandidateStatus(state, "vti", "shortlisted", undefined, LATER);

    // The status is what changed. Wiping the reason would punish a misclick by
    // destroying the sentence the learner actually thought about.
    expect(findCandidate(state, "vti")?.status).toBe("shortlisted");
    expect(findCandidate(state, "vti")?.rejectedBecause).toBe("Too broad for what I want");
  });
});

describe("surviving a backup and restore", () => {
  it("brings back every record, its standing, its reason and its evidence", () => {
    let state = addPosition(project(), "vti", undefined, NOW);
    state = updateCandidate(state, "vti", { why: "The whole US market at low cost", mainRisk: "Falls with the market" }, LATER);
    state = addEvidence(state, "vti", { sourceId: "0001193125-26-077488", locator: "Fees and expenses", note: "0.03% a year", role: "supports" }, LATER);
    state = setCandidateStatus(state, "aapl", "rejected", "Already inside VTI", LATER);
    state = addEvidence(state, "aapl", { sourceId: "0000320193-25-000079", locator: "", note: "VTI's second largest holding", role: "challenges" }, LATER);

    const backup = exportProjectBackup(state);
    expect(backup.ok).toBe(true);
    if (!backup.ok) return;

    const restored = importProjectBackup(backup.raw);
    expect(restored.ok).toBe(true);
    if (!restored.ok) return;

    const vti = findCandidate(restored.project, "vti");
    expect(vti?.why).toBe("The whole US market at low cost");
    expect(vti?.evidence.map((entry) => [entry.role, entry.note])).toEqual([["supports", "0.03% a year"]]);

    const aapl = findCandidate(restored.project, "aapl");
    expect(aapl?.status).toBe("rejected");
    expect(aapl?.rejectedBecause).toBe("Already inside VTI");
    expect(aapl?.evidence.map((entry) => entry.locator)).toEqual([""]);
  });

  it("refuses a backup whose evidence has been tampered with", () => {
    // The page shows a source note beside a learner's own words. A hand-edited
    // file must not be able to attach a real filing to something never read.
    const state = addEvidence(project(), "vti", { sourceId: "a", locator: "", note: "Note", role: "supports" }, LATER);
    const broken = JSON.parse(JSON.stringify(state));
    broken.candidates[0].evidence[0].role = "proves";

    expect(validateStudioProject(broken)).toContain(
      "An evidence reference contains missing, repeated, or invalid fields.",
    );
    expect(importProjectBackup(JSON.stringify(broken)).ok).toBe(false);
  });
});
