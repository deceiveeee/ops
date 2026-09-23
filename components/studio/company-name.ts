/**
 * SEC registrant names as a person would write them.
 *
 * They arrive shouting and with a state of incorporation stapled on — "APPLIED
 * MATERIALS INC /DE", "PFIZER INC". Names that already carry mixed case are
 * left exactly as filed, since the company chose them.
 */
export function readableName(raw: string): string {
  const trimmed = raw.replace(/\s*\/[A-Z]{2}[A-Z/]*\s*$/, "").trim();
  if (trimmed !== trimmed.toUpperCase()) return trimmed;

  // Two- and three-letter capitals are usually initials a company keeps — CSX,
  // NXP, AMD — so they stay as filed. Four letters and up get title case,
  // because ordinary words live there: BJ'S Wholesale CLUB and Dollar TREE both
  // came out shouting when the rule ran to four. The cost is that a genuine
  // four-letter acronym like FTAI reads as Ftai, which is the cheaper mistake.
  // FE is the Fe of Santa Fe, which read as initials: "Burlington Northern Santa FE".
  const ordinary = new Set(["INC", "CO", "LTD", "LLC", "LP", "THE", "AND", "NEW", "OIL", "GAS", "AIR", "OF", "FOR", "FE"]);

  return trimmed
    .split(/(\s+)/)
    .map((token) => {
      const letters = token.replace(/[^A-Z]/g, "");
      if (letters.length >= 2 && letters.length <= 3 && !ordinary.has(letters)) return token;
      return token.toLowerCase().replace(/(^|[(.,&/-])([a-z])/g, (_, before, letter) => before + letter.toUpperCase());
    })
    .join("");
}
