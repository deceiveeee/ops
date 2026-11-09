/** Helpers the puzzle build and finalize steps share. Node only; never imported by the site. */

type Period = { start: string | null; end: string };

/**
 * Values of one us-gaap tag for one period, read straight from a filing's own
 * XBRL instance document. Written separately from lib/filings/revenue.ts on
 * purpose: it is the second path every published number is checked by, so it
 * shares no code with the first.
 */
export function instanceValues(xml: string, concept: string, period: Period, instant: boolean): number[] {
  const contexts = new Map<string, { start: string | null; end: string | null; instant: string | null; dimensioned: boolean }>();
  const contextPattern = /<(?:[\w-]+:)?context\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?context>/g;
  for (const match of xml.matchAll(contextPattern)) {
    const body = match[2];
    const pick = (tag: string) => body.match(new RegExp(`<(?:[\\w-]+:)?${tag}>\\s*([^<\\s]+)\\s*<`))?.[1] ?? null;
    contexts.set(match[1], {
      start: pick("startDate"),
      end: pick("endDate"),
      instant: pick("instant"),
      dimensioned: /<(?:[\w-]+:)?(segment|scenario)\b/.test(body),
    });
  }
  const factPattern = new RegExp(`<us-gaap:${concept}\\b([^>]*)>([^<]*)</us-gaap:${concept}>`, "g");
  const values = new Set<number>();
  for (const match of xml.matchAll(factPattern)) {
    const ref = match[1].match(/\bcontextRef="([^"]+)"/)?.[1];
    const context = ref ? contexts.get(ref) : undefined;
    if (!context || context.dimensioned) continue;
    const fits = instant
      ? context.instant === period.end
      : context.end === period.end && (period.start === null || context.start === period.start);
    if (!fits) continue;
    const value = Number(match[2].trim());
    if (Number.isFinite(value)) values.add(value);
  }
  return [...values];
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Blanks every listed name, longest first, as the token the page draws as a black bar. */
export function redact(text: string, names: readonly string[]): { text: string; hits: number } {
  let out = text;
  let hits = 0;
  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    const pattern = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(name).replace(/'/g, "['’]")}(?:['’]s)?(?![A-Za-z0-9])`, "gi");
    out = out.replace(pattern, () => {
      hits += 1;
      return "[[name]]";
    });
  }
  // "Apple Inc." and "The Walt Disney Company" read as one blank, not a blank and a suffix.
  out = out.replace(/\[\[name\]\](?:[\s,.]*(?:Inc|Corporation|Corp|Company|Co|Ltd|plc|Holdings|Group)\b\.?)?/g, "[[name]]");
  out = out.replace(/(\[\[name\]\]\s*)+\[\[name\]\]/g, "[[name]]");
  return { text: out, hits };
}

/** Whether any listed name survives in `text` outside a blank. */
export function leaks(text: string, names: readonly string[]): string[] {
  const visible = text.replace(/\[\[name\]\]/g, " ");
  return names.filter((name) => new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(name).replace(/'/g, "['’]")}(?![A-Za-z0-9])`, "i").test(visible));
}

const fold = (character: string) =>
  character === "’" || character === "‘" ? "'" : character === "“" || character === "”" ? '"' : /\s/.test(character) ? " " : character;

/**
 * Where `needle` sits in `haystack`, ignoring curly-versus-straight quotes and
 * differences in whitespace, as offsets into the original text. Returns every
 * match, so a caller can insist on exactly one.
 */
export function findLoosely(haystack: string, needle: string): { start: number; end: number }[] {
  const map: number[] = [];
  let folded = "";
  for (let index = 0; index < haystack.length; index += 1) {
    const character = fold(haystack[index]);
    if (character === " " && folded.endsWith(" ")) continue;
    folded += character;
    map.push(index);
  }
  const target = [...needle].map(fold).join("").replace(/ +/g, " ").trim();
  const found: { start: number; end: number }[] = [];
  let from = folded.indexOf(target);
  while (from !== -1) {
    found.push({ start: map[from], end: map[from + target.length - 1] + 1 });
    from = folded.indexOf(target, from + 1);
  }
  return found;
}
