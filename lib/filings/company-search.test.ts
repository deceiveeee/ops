import { describe, expect, it } from "vitest";
import { searchCompanies } from "./company-search";

/**
 * EDGAR's ticker file in miniature, in its own order and shape: the first rows
 * of the real file on 2026-09-16, a company listed under four share classes,
 * and names that share a word.
 */
const tickers = {
  "0": { cik_str: 1045810, ticker: "NVDA", title: "NVIDIA CORP" },
  "1": { cik_str: 320193, ticker: "AAPL", title: "Apple Inc." },
  "2": { cik_str: 1652044, ticker: "GOOGL", title: "Alphabet Inc." },
  "3": { cik_str: 1652044, ticker: "GOOG", title: "Alphabet Inc." },
  "4": { cik_str: 1065280, ticker: "NFLX", title: "NETFLIX INC" },
  "5": { cik_str: 1418121, ticker: "APLE", title: "Apple Hospitality REIT, Inc." },
  "6": { cik_str: 1666138, ticker: "ATKR", title: "Atkore Inc." },
  "7": { cik_str: 21344, ticker: "KO", title: "COCA COLA CO" },
  "8": { cik_str: 1100682, ticker: "CRL", title: "Charles River Laboratories" },
  "9": { cik_str: 9999999, ticker: "PINE", title: "Pineapple Holdings" },
};

const found = (query: string) => searchCompanies(tickers, query).map((match) => match.ticker);

describe("finding a company by what a person types", () => {
  it("finds a company by its name, in any case, with its ticker and SEC number", () => {
    expect(searchCompanies(tickers, "netflix")).toEqual([{ cik: "0001065280", ticker: "NFLX", name: "NETFLIX INC" }]);
    expect(found("Coca-Cola")).toEqual(["KO"]);
  });

  it("puts an exact ticker before names that happen to contain the letters", () => {
    // "KO" is Coca-Cola's ticker, and also inside "Atkore".
    expect(found("ko")).toEqual(["KO", "ATKR"]);
  });

  it("orders names that begin a word before names that only contain the text", () => {
    expect(found("apple")).toEqual(["AAPL", "APLE", "PINE"]);
    expect(found("river")).toEqual(["CRL"]);
    expect(found("net flix")).toEqual(["NFLX"]);
  });

  it("keeps EDGAR's order within a kind of match", () => {
    expect(found("inc")).toEqual(["AAPL", "GOOGL", "NFLX", "APLE", "ATKR"]);
  });

  it("lists a company with several share classes once, under the ticker that matched", () => {
    expect(found("alphabet")).toEqual(["GOOGL"]);
    expect(found("GOOG")).toEqual(["GOOG"]);
  });

  it("finds nothing for nothing, punctuation or a list it cannot read", () => {
    expect(found("")).toEqual([]);
    expect(found("  --  ")).toEqual([]);
    expect(found("zzzz")).toEqual([]);
    expect(searchCompanies(null, "apple")).toEqual([]);
    expect(searchCompanies({ "0": { ticker: 5 } }, "apple")).toEqual([]);
  });

  it("stops at the limit", () => {
    expect(searchCompanies(tickers, "inc", 2).map((match) => match.ticker)).toEqual(["AAPL", "GOOGL"]);
  });
});
