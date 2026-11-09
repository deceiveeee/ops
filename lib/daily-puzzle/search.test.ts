import { describe, expect, it } from "vitest";
import { GUESSABLE } from "@/data/daily-puzzle/companies";
import { guessId, normalize, searchCompanies } from "./search";

const names = (query: string) => searchCompanies(query, GUESSABLE).map((company) => company.name);

describe("normalize", () => {
  it("drops case, accents and punctuation", () => {
    expect(normalize("Estée Lauder")).toBe("estee lauder");
    expect(normalize("e.l.f. Beauty")).toBe("elf beauty");
    expect(normalize("McDonald’s")).toBe("mcdonalds");
    expect(normalize("AT&T")).toBe("at and t");
  });
});

describe("searchCompanies", () => {
  it("finds a company by the name people use for it", () => {
    expect(names("google")[0]).toBe("Alphabet");
    expect(names("snapchat")[0]).toBe("Snap");
    expect(names("elf")[0]).toBe("e.l.f. Beauty");
    expect(names("mcdonalds")[0]).toBe("McDonald's");
  });

  it("finds an answer by its ticker", () => {
    expect(names("nvda")[0]).toBe("NVIDIA");
  });

  it("puts an exact match before a longer name that starts the same way", () => {
    expect(names("target")[0]).toBe("Target");
  });

  it("matches the start of any word, and returns nothing for an empty box", () => {
    expect(names("depot")).toContain("Home Depot");
    expect(searchCompanies("   ", GUESSABLE)).toEqual([]);
  });

  it("returns at most five", () => {
    expect(searchCompanies("a", GUESSABLE).length).toBeLessThanOrEqual(5);
  });
});

describe("the guessable list", () => {
  it("has no two companies a learner could not tell apart", () => {
    const ids = GUESSABLE.map(guessId);
    expect(new Set(ids).size).toBe(ids.length);
    const shown = GUESSABLE.map((company) => normalize(company.name));
    expect(new Set(shown).size).toBe(shown.length);
  });
});
