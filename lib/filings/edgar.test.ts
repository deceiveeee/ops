import { describe, expect, it } from "vitest";

import {
  archivePath,
  companyName,
  filingIndexUrl,
  findTicker,
  padCik,
  parseSubmissions,
} from "./edgar";

/**
 * Shapes copied from the real endpoints, trimmed. EDGAR's ticker file keys rows
 * by an arbitrary index, and the submissions feed stores each field as a
 * parallel array rather than a list of objects, so both are parsed defensively:
 * a shape change should read as "not found" rather than throw inside a render.
 */

const tickerFile = {
  "0": { cik_str: 320193, ticker: "AAPL", title: "Apple Inc." },
  "1": { cik_str: 1065280, ticker: "NFLX", title: "NETFLIX INC" },
  "2": { cik_str: 21344, ticker: "KO", title: "COCA COLA CO" },
};

const submissions = {
  name: "NETFLIX INC",
  filings: {
    recent: {
      form: ["8-K", "10-K", "4", "10-Q", "S-8"],
      filingDate: ["2026-02-01", "2026-01-23", "2026-01-20", "2025-10-21", "2025-09-01"],
      accessionNumber: [
        "0001065280-26-000040",
        "0001065280-26-000034",
        "0001065280-26-000031",
        "0001065280-25-000180",
        "0001065280-25-000150",
      ],
      primaryDocument: ["nflx-8k.htm", "nflx-20251231.htm", "xslF345X05/doc4.xml", "nflx-20250930.htm", "s8.htm"],
      reportDate: ["2026-02-01", "2025-12-31", "", "2025-09-30", ""],
    },
  },
};

describe("EDGAR identifiers", () => {
  it("pads a CIK to the ten digits the JSON endpoints require", () => {
    expect(padCik(320193)).toBe("0000320193");
    expect(padCik("21344")).toBe("0000021344");
    expect(padCik("CIK0001065280")).toBe("0001065280");
  });

  it("builds an archive path with a bare CIK and an undashed accession", () => {
    // The two endpoints disagree: JSON wants the padded CIK, the archive wants
    // it without leading zeros and the accession without dashes.
    expect(archivePath(1065280, "0001065280-26-000034", "nflx-20251231.htm")).toBe(
      "https://www.sec.gov/Archives/edgar/data/1065280/000106528026000034/nflx-20251231.htm",
    );
  });

  it("links back to the filing's own index page at the source", () => {
    expect(filingIndexUrl("0000320193", "0000320193-25-000079")).toBe(
      "https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/0000320193-25-000079-index.htm",
    );
  });
});

describe("ticker resolution", () => {
  it("finds a company regardless of the case typed", () => {
    expect(findTicker(tickerFile, "nflx")).toEqual({
      cik: "0001065280",
      ticker: "NFLX",
      name: "NETFLIX INC",
    });
  });

  it("returns null for an unknown ticker rather than a wrong company", () => {
    expect(findTicker(tickerFile, "ZZZZ")).toBeNull();
    expect(findTicker(tickerFile, "")).toBeNull();
  });

  it("survives a shape it does not recognise", () => {
    expect(findTicker(null, "AAPL")).toBeNull();
    expect(findTicker({ "0": "not an object" }, "AAPL")).toBeNull();
    expect(findTicker({ "0": { ticker: 42 } }, "AAPL")).toBeNull();
  });
});

describe("filing list", () => {
  it("keeps the reports this reader can section, in the order filed", () => {
    const filings = parseSubmissions(submissions);

    expect(filings.map((f) => f.form)).toEqual(["10-K", "10-Q"]);
    expect(filings[0]).toMatchObject({
      form: "10-K",
      filingDate: "2026-01-23",
      accession: "0001065280-26-000034",
      primaryDocument: "nflx-20251231.htm",
      reportDate: "2025-12-31",
    });
  });

  it("drops forms whose primary document is not a readable page", () => {
    // The Form 4 in the fixture points at an XML document; opening it in a
    // section reader would show the learner nothing.
    const filings = parseSubmissions(submissions);
    expect(filings.some((f) => f.primaryDocument.endsWith(".xml"))).toBe(false);
  });

  it("respects the limit and survives a missing feed", () => {
    expect(parseSubmissions(submissions, 1)).toHaveLength(1);
    expect(parseSubmissions({}, 5)).toEqual([]);
    expect(parseSubmissions(null)).toEqual([]);
  });

  it("reads the company name when there is one", () => {
    expect(companyName(submissions)).toBe("NETFLIX INC");
    expect(companyName({})).toBe("");
    expect(companyName(null)).toBe("");
  });
});
