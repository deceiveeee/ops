import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import peerSets from "./data/peer-sets.json";
import { allProblems, containsPassage, filingText, readNamedCompetitors, unaccounted, type PeerSetEntry } from "./peer-sets";

/**
 * Atkore's peer set, checked against Atkore's own annual report.
 *
 * e2e/fixtures/edgar keeps that report's Business section word for word (its
 * README says what was trimmed elsewhere), so what the set quotes from Atkore,
 * and the competitors Atkore names, are checked here without the network. The
 * other companies' passages are checked against their own filings by
 * scripts/source/fetch-peer-sets.mjs, which records any failure as a problem.
 */

const FIXTURE = "e2e/fixtures/edgar/https___www.sec.gov_Archives_edgar_data_1666138_000162828025054049_atkr-20250930.htm";
const LEAD = "The main competitors in each of these segments are listed below:";

const sets = peerSets.sets as unknown as PeerSetEntry[];
const atkore = sets.find((set) => set.id === "atkore");
if (!atkore) throw new Error("no Atkore peer set in the data");

// Relative to the repository root, where vitest runs.
const report = filingText(readFileSync(resolve(process.cwd(), FIXTURE), "utf8"));

describe("Atkore's peer set against Atkore's own annual report", () => {
  it("quotes the report the fixture is, word for word", () => {
    expect(atkore.subject.filing.accession).toBe("0001628280-25-054049");
    for (const entry of atkore.subject.makes) expect(containsPassage(report, entry.quote), entry.segment).toBe(true);
    expect(containsPassage(report, atkore.subject.competitorsQuote)).toBe(true);
    // The short list a learner reads is made only of words Atkore's own passages use.
    expect(atkore.subject.briefProducts.length).toBeGreaterThan(0);
    for (const product of atkore.subject.briefProducts) {
      expect(atkore.subject.makes.some((entry) => entry.quote.toLowerCase().includes(product.toLowerCase())), product).toBe(true);
    }
  });

  it("reads the eleven competitors Atkore names, across its two segments", () => {
    const named = readNamedCompetitors(atkore.subject.competitorsQuote, LEAD);
    expect(atkore.subject.named).toEqual(named);
    expect(named.map((group) => group.segment)).toEqual(["Electrical", "Safety & Infrastructure"]);
    expect(new Set(named.flatMap((group) => group.names)).size).toBe(11);
  });

  it("accounts for every competitor Atkore names exactly once, in the set or on the missing list", () => {
    const accountedAs = [
      ...atkore.peers.flatMap((peer) => (peer.namedAs ? [peer.namedAs] : [])),
      ...atkore.missing.map((entry) => entry.namedAs),
    ];
    expect(unaccounted(atkore.subject.named, accountedAs)).toEqual({ notAccounted: [], notNamed: [] });
    expect(new Set(accountedAs).size).toBe(accountedAs.length);
  });

  it("gives every peer a stated reason, its own words, and a filing to check them in", () => {
    expect(atkore.peers.length).toBeGreaterThan(0);
    for (const peer of atkore.peers) {
      // Named by Atkore, or found by a search: one or the other, never neither.
      expect(peer.namedAs ? peer.namedIn.length > 0 : Boolean(peer.foundBy), peer.name).toBe(true);
      expect(peer.business.quote.trim(), peer.name).not.toBe("");
      expect(peer.filing.url, peer.name).toMatch(/^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\//);
    }
  });

  it("says why each missing competitor is missing, and why each company left out is left out", () => {
    for (const entry of atkore.missing) {
      expect(entry.namedIn.length, entry.namedAs).toBeGreaterThan(0);
      expect(entry.note.trim(), entry.namedAs).not.toBe("");
    }
    for (const entry of atkore.leftOut) {
      expect([entry.why.trim(), entry.quote.trim()].every(Boolean), entry.name).toBe(true);
      // A reason resting on a count gives a passage that holds the word it counts.
      if (entry.mentions) expect(entry.mentions.quote.toLowerCase(), entry.name).toContain(entry.mentions.word.toLowerCase());
      expect(entry.filing.url, entry.name).toMatch(/^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\//);
    }
  });

  it("puts no company in two places", () => {
    const peerCiks = new Set(atkore.peers.map((peer) => peer.cik));
    expect(atkore.leftOut.filter((entry) => peerCiks.has(entry.cik))).toEqual([]);
    const missingRecords = atkore.missing.flatMap((entry) => entry.records.map((record) => record.cik));
    expect(missingRecords.filter((cik) => peerCiks.has(cik))).toEqual([]);
  });

  it("passed every check against EDGAR when the data was built", () => {
    expect(allProblems(atkore)).toEqual([]);
  });
});
