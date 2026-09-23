import { validateStudioPlan } from "@/lib/studio";
import { FIGURES } from "./investigate";
import { FORCE_BY_KEY, type ForceKey } from "./five-forces";
import { LEVER_BY_ID } from "./value-stick";
import { RELATIONSHIP_BY_KEY, ZONE_BY_KEY } from "./industry-map";

/** The seven figures Studio asks for. Anything else in a stored record is junk. */
const FIGURE_KEYS = new Set<string>(FIGURES.map((figure) => figure.key));

/** Limits apply to user projects, not to the separately stored source library. */
export const MAX_PROJECT_BYTES = 10 * 1024 * 1024;
type RecordValue = Record<string, unknown>;
const object = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 20_000): value is string => typeof value === "string" && value.length <= max;
const id = (value: unknown): value is string => text(value, 200) && value.trim().length > 0;
const keys = (value: RecordValue, allowed: string[]) => Object.keys(value).every((key) => allowed.includes(key));
const choice = (value: unknown, allowed: string[]) => typeof value === "string" && allowed.includes(value);
const timestamp = (value: unknown) => {
  if (!text(value, 40) || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10);
};
const dated = (value: RecordValue) => timestamp(value.createdAt) && timestamp(value.updatedAt);
const list = (value: unknown, max: number): value is unknown[] => Array.isArray(value) && value.length <= max;
const emptyResearch = { why: "", mainRisk: "", whatWouldChangeMyMind: "", reviewedSources: false };

/** Validate before storage or import. Unfinished work is valid; missing fields and coercions are not. */
export function validateStudioProject(value: unknown): string[] {
  if (!object(value) || value.schemaVersion !== 2) return ["This is not a supported Studio project."];
  const issues: string[] = [];
  if (!keys(value, ["schemaVersion", "id", "createdAt", "updatedAt", "mode", "name", "goal", "candidates", "instruments", "investigations", "alternatives", "selectedAlternativeId", "rules", "stress", "decisions", "migratedFrom"])) {
    issues.push("This project contains fields this version does not understand. Keep the original backup.");
  }
  // Goal/rule/position units are unchanged from v1. Reuse that validator rather
  // than introducing a second definition of a valid dollar amount or quote.
  const common = {
    schemaVersion: 1, id: value.id, createdAt: value.createdAt, updatedAt: value.updatedAt,
    mode: value.mode, name: value.name, goal: value.goal, rules: value.rules, stress: value.stress,
    holdings: [], currentCash: 0, contributionAmount: 0,
  };
  issues.push(...validateStudioPlan(common));
  if (!id(value.id) || !dated(value)) issues.push("The project identity or saved dates are invalid.");

  const recordIds = new Set<string>();
  const instruments = new Set<string>();
  const uniqueId = (value: unknown) => {
    if (!id(value) || recordIds.has(value)) return false;
    recordIds.add(value);
    return true;
  };
  if (!list(value.candidates, 10_000)) issues.push("The project needs a candidate list with at most 10,000 investigations.");
  else for (const candidate of value.candidates) {
    if (!object(candidate)) { issues.push("An investigation is invalid."); continue; }
    if (!keys(candidate, ["id", "instrumentId", "status", "createdAt", "updatedAt", "why", "mainRisk", "whatWouldChangeMyMind", "openQuestions", "rejectedBecause", "evidence", "reviewedSources"])
      || !uniqueId(candidate.id) || !id(candidate.instrumentId) || instruments.has(candidate.instrumentId)
      || !dated(candidate) || !choice(candidate.status, ["researching", "shortlisted", "rejected", "selected"])
      || ![candidate.why, candidate.mainRisk, candidate.whatWouldChangeMyMind, candidate.rejectedBecause].every((item) => text(item))
      || typeof candidate.reviewedSources !== "boolean"
      || !list(candidate.openQuestions, 1000) || !candidate.openQuestions.every((item) => text(item))) {
      issues.push("An investigation contains missing, repeated, or invalid fields.");
    }
    if (id(candidate.instrumentId)) instruments.add(candidate.instrumentId);
    if (!list(candidate.evidence, 1000)) issues.push("An investigation needs an evidence list with at most 1,000 entries.");
    else for (const evidence of candidate.evidence) {
      if (!object(evidence) || !keys(evidence, ["id", "sourceId", "locator", "note", "role", "savedAt"])
        || !uniqueId(evidence.id) || !id(evidence.sourceId) || !text(evidence.locator) || !text(evidence.note)
        || !choice(evidence.role, ["supports", "challenges", "context"]) || !timestamp(evidence.savedAt)) {
        issues.push("An evidence reference contains missing, repeated, or invalid fields.");
      }
    }
  }

  /*
   * Absent on any project saved before figure investigations existed, and that
   * is not an error -- `readStudioRecord` fills the empty list. Present means it
   * must be well formed.
   */
  /*
   * Absent from records saved before a learner could add their own company, so
   * missing is valid. An id that collided with a catalogue entry would silently
   * shadow a researched investment with an empty one, so the prefix is checked
   * rather than assumed.
   */
  if (value.instruments !== undefined) {
    if (!list(value.instruments, 1000)) issues.push("The project needs an instrument list with at most 1,000 companies.");
    else for (const instrument of value.instruments) {
      if (!object(instrument) || !keys(instrument, ["id", "name", "assetClass", "investigationId", "addedAt"])
        || !id(instrument.id) || !String(instrument.id).startsWith("own-") || !uniqueId(instrument.id)
        || !text(instrument.name, 300) || !String(instrument.name).trim()
        || !choice(instrument.assetClass, ["us-equity", "international-equity"])
        || !id(instrument.investigationId) || !timestamp(instrument.addedAt)) {
        issues.push("A company you added contains missing, repeated, or invalid fields.");
      }
    }
  }

  if (value.investigations !== undefined) {
    if (!list(value.investigations, 10_000)) issues.push("The project needs an investigation list with at most 10,000 companies.");
    else for (const investigation of value.investigations) {
      if (!object(investigation)) { issues.push("A company investigation is invalid."); continue; }
      // `industry` is absent from records saved before it could be chosen, so
      // it is accepted as missing rather than required. See FigureInvestigation.
      if (!keys(investigation, ["id", "createdAt", "updatedAt", "company", "sic", "industry", "figures", "riskFreePct", "source", "passages", "inputs", "peers", "forces", "valueClaims", "mapEntries"])
        || !uniqueId(investigation.id) || !dated(investigation)
        || !text(investigation.company, 300) || !text(investigation.sic, 20)
        || !(investigation.industry === undefined || text(investigation.industry, 200))
        // null means "use the published rate", which is different from zero.
        || !(investigation.riskFreePct === null
          || (typeof investigation.riskFreePct === "number" && Number.isFinite(investigation.riskFreePct)))) {
        issues.push("A company investigation contains missing, repeated, or invalid fields.");
      }
      /*
       * Figure keys are checked against the seven Studio actually asks for. A
       * stored key it does not recognise would be silently ignored on read,
       * which is the kind of quiet data loss this schema exists to prevent.
       */
      if (!object(investigation.figures)) issues.push("A company investigation needs its figures recorded as an object.");
      else if (!Object.entries(investigation.figures).every(
        ([key, entry]) => FIGURE_KEYS.has(key) && typeof entry === "number" && Number.isFinite(entry),
      )) {
        issues.push("A company investigation contains an unrecognised or non-numeric figure.");
      }
      /*
       * Where the figures came from, when they were filled in from a filing.
       * Absent on every record saved before the SEC lookup existed, and null
       * whenever the learner typed them, so only a present object is checked.
       *
       * It is checked rather than trusted because this is what the page shows a
       * learner as the provenance of a number. A restored backup that had been
       * edited by hand could otherwise attach a real accession to figures that
       * never came from it, which is worse than having no provenance at all.
       */
      if (investigation.source !== undefined && investigation.source !== null) {
        const source = investigation.source;
        if (!object(source)
          || !keys(source, ["ticker", "cik", "entityName", "sic", "sicDescription", "periodEnd", "accession", "form", "filed", "figures"])
          || !text(source.ticker, 20) || !text(source.cik, 20) || !text(source.entityName, 300)
          || !text(source.sic, 20) || !text(source.sicDescription, 300)
          || !text(source.periodEnd, 10) || !text(source.accession, 40)
          || !text(source.form, 20) || !text(source.filed, 10)
          || !object(source.figures)
          || !Object.entries(source.figures).every(([key, entry]) =>
            FIGURE_KEYS.has(key)
            && object(entry)
            && keys(entry, ["concepts", "addedUp"])
            && list(entry.concepts, 20)
            && (entry.concepts as unknown[]).every((concept) => text(concept, 200))
            && (entry.addedUp === null || text(entry.addedUp, 300)))) {
          issues.push("A company investigation records where its figures came from in a form this version does not understand.");
        }
      }
      /*
       * Kept passages are shown beside a learner's own note as the words a
       * filing used. Checked rather than trusted, because a hand-edited backup
       * could otherwise put words in a filing's mouth, or give a passage an
       * offset that points somewhere it never was.
       */
      if (investigation.passages !== undefined) {
        if (!list(investigation.passages, 1000)) issues.push("A company investigation can keep at most 1,000 passages.");
        else for (const passage of investigation.passages) {
          if (!object(passage)
            || !keys(passage, ["id", "savedAt", "cik", "accession", "document", "form", "filed", "sectionId", "quote", "prefix", "suffix", "offset", "role", "note"])
            || !uniqueId(passage.id) || !timestamp(passage.savedAt)
            || !id(passage.cik) || !text(passage.cik, 20)
            || !id(passage.accession) || !text(passage.accession, 40)
            || !id(passage.document) || !text(passage.document, 200)
            || !text(passage.form, 20) || !text(passage.filed, 10)
            || !id(passage.sectionId) || !text(passage.sectionId, 40)
            // Not id(): that caps text at 200 characters, and a paragraph of a 10-K
            // runs past 2,000. Every whole paragraph kept was refused until 2026-09-13.
            || !text(passage.quote, 5000) || !passage.quote.trim()
            || !text(passage.prefix, 64) || !text(passage.suffix, 64)
            || !(typeof passage.offset === "number" && Number.isInteger(passage.offset) && passage.offset >= 0)
            || !choice(passage.role, ["supports", "challenges", "context"]) || !text(passage.note)) {
            issues.push("A kept passage contains missing, repeated, or invalid fields.");
          }
        }
      }
      /*
       * Linked inputs and competitors each point at a kept passage. Checked, because a link
       * to a passage that is not there would show an index or a competitor as resting on
       * words the report was never seen to use.
       */
      const keptIds = new Set(
        Array.isArray(investigation.passages)
          ? (investigation.passages as unknown[]).filter(object).map((passage) => passage.id).filter((value): value is string => typeof value === "string")
          : [],
      );
      if (investigation.inputs !== undefined) {
        if (!list(investigation.inputs, 200)) issues.push("A company investigation can link at most 200 inputs.");
        else for (const link of investigation.inputs) {
          if (!object(link)
            || !keys(link, ["id", "savedAt", "seriesId", "passageId"])
            || !uniqueId(link.id) || !timestamp(link.savedAt)
            || !id(link.seriesId) || !text(link.seriesId, 40)
            || !id(link.passageId) || !keptIds.has(link.passageId)) {
            issues.push("A linked input contains missing, repeated, or invalid fields, or rests on a passage that is not kept.");
          }
        }
      }
      if (investigation.peers !== undefined) {
        if (!list(investigation.peers, 200)) issues.push("A company investigation can list at most 200 competitors.");
        else for (const peer of investigation.peers) {
          if (!object(peer)
            || !keys(peer, ["id", "savedAt", "name", "cik", "ticker", "passageId"])
            || !uniqueId(peer.id) || !timestamp(peer.savedAt)
            || !text(peer.name, 300) || !peer.name.trim()
            || !text(peer.cik, 20) || !/^\d*$/.test(peer.cik)
            || !text(peer.ticker, 20)
            || !text(peer.passageId, 200) || (peer.passageId !== "" && !keptIds.has(peer.passageId))) {
            issues.push("A competitor contains missing, repeated, or invalid fields, or rests on a passage that is not kept.");
          }
        }
      }
      /*
       * Findings about competition. The force and the question it answers are
       * checked against the framework itself rather than accepted as text: a
       * restored backup naming a sixth force, or a question the paper does not
       * ask, would put a finding on screen under a heading Studio would then
       * have to invent. The mechanism and what would change it are the
       * learner's own words and only bounded, never inspected.
       */
      if (investigation.forces !== undefined) {
        if (!list(investigation.forces, 500)) issues.push("A company investigation can record at most 500 findings about competition.");
        else for (const finding of investigation.forces) {
          const force = object(finding) && typeof finding.force === "string" ? FORCE_BY_KEY.get(finding.force as ForceKey) : undefined;
          if (!object(finding)
            || !keys(finding, ["id", "savedAt", "force", "question", "mechanism", "effect", "standing", "passageIds", "wouldChangeIt"])
            || !uniqueId(finding.id) || !timestamp(finding.savedAt)
            || !force
            || !force.questions.some((question) => question.id === finding.question)
            || !text(finding.mechanism, 5000) || !String(finding.mechanism).trim()
            || !choice(finding.effect, ["prices", "costs", "capital", "opportunities"])
            || !choice(finding.standing, ["structural", "temporary"])
            || !text(finding.wouldChangeIt, 5000) || !String(finding.wouldChangeIt).trim()
            || !list(finding.passageIds, 1000)
            || !(finding.passageIds as unknown[]).every((passageId) => typeof passageId === "string" && keptIds.has(passageId))) {
            issues.push("A finding about competition contains missing, repeated, or invalid fields, or rests on a passage that is not kept.");
          }
        }
      }
      /*
       * Claims about the value stick. The lever is checked against Exhibit 29
       * rather than accepted as text, for the same reason a force is: a
       * hand-edited backup naming a seventh lever would put a claim on screen
       * under a heading the paper does not have.
       */
      if (investigation.valueClaims !== undefined) {
        if (!list(investigation.valueClaims, 500)) issues.push("A company investigation can record at most 500 claims about value.");
        else for (const claim of investigation.valueClaims) {
          if (!object(claim)
            || !keys(claim, ["id", "savedAt", "lever", "mechanism", "passageIds", "wouldChangeIt"])
            || !uniqueId(claim.id) || !timestamp(claim.savedAt)
            || typeof claim.lever !== "string" || !LEVER_BY_ID.has(claim.lever)
            || !text(claim.mechanism, 5000) || !String(claim.mechanism).trim()
            || !text(claim.wouldChangeIt, 5000) || !String(claim.wouldChangeIt).trim()
            || !list(claim.passageIds, 1000)
            || !(claim.passageIds as unknown[]).every((passageId) => typeof passageId === "string" && keptIds.has(passageId))) {
            issues.push("A claim about value contains missing, repeated, or invalid fields, or rests on a passage that is not kept.");
          }
        }
      }
      /*
       * The industry map. Zone and relationship are checked against the
       * framework; the name and what it affects are the learner's own words and
       * are only bounded. A relationship is allowed to be absent, because the
       * zones with no counterparty -- government, other factors -- are never
       * asked for one.
       */
      if (investigation.mapEntries !== undefined) {
        if (!list(investigation.mapEntries, 1000)) issues.push("A company investigation can map at most 1,000 entries.");
        else for (const entry of investigation.mapEntries) {
          if (!object(entry)
            || !keys(entry, ["id", "savedAt", "zone", "name", "relationship", "affects", "passageIds"])
            || !uniqueId(entry.id) || !timestamp(entry.savedAt)
            || typeof entry.zone !== "string" || !ZONE_BY_KEY.has(entry.zone as never)
            || !text(entry.name, 300) || !String(entry.name).trim()
            || !(entry.relationship === undefined || (typeof entry.relationship === "string" && RELATIONSHIP_BY_KEY.has(entry.relationship as never)))
            || !text(entry.affects, 5000) || !String(entry.affects).trim()
            || !list(entry.passageIds, 1000)
            || !(entry.passageIds as unknown[]).every((passageId) => typeof passageId === "string" && keptIds.has(passageId))) {
            issues.push("An entry on the industry map contains missing, repeated, or invalid fields, or rests on a passage that is not kept.");
          }
        }
      }
    }
  }

  const alternativeIds = new Set<string>();
  if (!list(value.alternatives, 100) || value.alternatives.length === 0) issues.push("The project needs between 1 and 100 portfolio alternatives.");
  else for (const alternative of value.alternatives) {
    if (!object(alternative)) { issues.push("A portfolio alternative is invalid."); continue; }
    if (!keys(alternative, ["id", "name", "createdAt", "updatedAt", "positions", "currentCash", "contributionAmount", "reasoning"])
      || !uniqueId(alternative.id) || !text(alternative.name, 300) || !dated(alternative) || !text(alternative.reasoning)) {
      issues.push("A portfolio alternative contains missing, repeated, or invalid fields.");
    }
    if (id(alternative.id)) alternativeIds.add(alternative.id);
    if (!list(alternative.positions, 100)) { issues.push("An alternative needs a positions list with at most 100 investments."); continue; }
    const holdings = alternative.positions.map((position) => {
      if (!object(position)) return position;
      if (!keys(position, ["instrumentId", "targetWeightPct", "currentValue", "quotePrice", "quoteAsOf", "quantityMode", "accruedInterestPer100", "tradeFee"])) {
        issues.push("A position contains unsupported fields.");
      }
      if (!id(position.instrumentId) || !instruments.has(position.instrumentId)) issues.push("A position refers to an investigation that is missing.");
      return { ...position, research: emptyResearch };
    });
    issues.push(...validateStudioPlan({ ...common, holdings, currentCash: alternative.currentCash, contributionAmount: alternative.contributionAmount }));
  }
  if (value.selectedAlternativeId !== null && (!id(value.selectedAlternativeId) || !alternativeIds.has(value.selectedAlternativeId))) {
    issues.push("The selected portfolio alternative is missing.");
  }
  if (!list(value.decisions, 10_000)) issues.push("The project needs a decision list with at most 10,000 entries.");
  else for (const decision of value.decisions) {
    if (!object(decision) || !keys(decision, ["id", "at", "summary", "reason", "affects"])
      || !uniqueId(decision.id) || !timestamp(decision.at) || !text(decision.summary) || !text(decision.reason)
      || !list(decision.affects, 10_000) || !decision.affects.every(id)) issues.push("A saved decision is invalid.");
  }
  const original = value.migratedFrom;
  if (original !== null) {
    if (!object(original) || !keys(original, ["schemaVersion", "raw", "migratedAt"])
      || original.schemaVersion !== 1 || !text(original.raw, MAX_PROJECT_BYTES) || !timestamp(original.migratedAt)) {
      issues.push("The preserved original portfolio is invalid.");
    } else {
      try {
        if (validateStudioPlan(JSON.parse(original.raw)).length) issues.push("The preserved original is not a valid v1 portfolio.");
      } catch { issues.push("The preserved original portfolio is not readable JSON."); }
    }
  }
  return [...new Set(issues)];
}
