import type { GuessableCompany } from "./types";

/** Lower case, accents and punctuation dropped: "Estée Lauder" and "e.l.f." become "estee lauder" and "elf". */
export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** The identifier a guess is recorded and compared by: the ticker where there is one. */
export const guessId = (company: GuessableCompany): string => company.ticker ?? company.name;

/**
 * Companies matching what has been typed, best first: an exact name or
 * ticker, then a name that starts with it, then one with a word that does.
 */
export function searchCompanies(query: string, companies: readonly GuessableCompany[], limit = 5): GuessableCompany[] {
  const typed = normalize(query);
  if (!typed) return [];
  const scored: { company: GuessableCompany; score: number; index: number }[] = [];
  companies.forEach((company, index) => {
    const names = [company.name, ...(company.aliases ?? [])].map(normalize);
    const ticker = company.ticker ? normalize(company.ticker) : null;
    let score = 0;
    if (names.includes(typed) || ticker === typed) score = 3;
    else if (names.some((name) => name.startsWith(typed))) score = 2;
    else if (names.some((name) => name.split(" ").some((word) => word.startsWith(typed)))) score = 1;
    if (score) scored.push({ company, score, index });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.company.name.localeCompare(b.company.name) || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.company);
}
