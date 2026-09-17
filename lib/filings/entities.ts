/**
 * HTML character references in a filing, turned into the characters they name.
 *
 * The reader used to decode seven of them by name, so every other one reached
 * the learner as code: Apple's "iPhone &#174; is the Company's line of
 * smartphones", and a bullet on every line of a risk-factor list as "&#8226;".
 * Measured on 2026-09-16 across nine reports, NVIDIA's annual report had 111
 * paragraphs showing a code, Netflix's 68, Coca-Cola's 57.
 *
 * This decodes every numeric reference and the named ones filings use, in one
 * pass, so "&amp;#174;" stays the literal text "&#174;" rather than being
 * decoded twice. Curly quotes and dashes still become straight quotes and a
 * hyphen, as they always have here, so a learner typing "company's" or
 * "cost-of-sales" into the report's search still finds them.
 */

/** What the reader has always turned these into, which search and kept passages rely on. */
const PLAIN: Record<number, string> = {
  0x00a0: " ",
  0x2018: "'",
  0x2019: "'",
  146: "'",
  0x201c: '"',
  0x201d: '"',
  0x2013: "-",
  0x2014: "-",
};

const NAMED: Record<string, number> = {
  amp: 38, lt: 60, gt: 62, quot: 34, apos: 39, nbsp: 0xa0,
  lsquo: 0x2018, rsquo: 0x2019, ldquo: 0x201c, rdquo: 0x201d, ndash: 0x2013, mdash: 0x2014,
  reg: 0xae, trade: 0x2122, copy: 0xa9, bull: 0x2022, middot: 0xb7, hellip: 0x2026,
  sect: 0xa7, para: 0xb6, deg: 0xb0, times: 0xd7, divide: 0xf7, plusmn: 0xb1,
  frac12: 0xbd, frac14: 0xbc, frac34: 0xbe, euro: 0x20ac, pound: 0xa3, yen: 0xa5, cent: 0xa2,
  dagger: 0x2020, Dagger: 0x2021, laquo: 0xab, raquo: 0xbb, shy: 0xad, zwj: 0x200d, zwnj: 0x200c,
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,7});/gi, (whole, body: string) => {
    const code = body[0] !== "#"
      ? NAMED[body] ?? NAMED[body.toLowerCase()]
      : body[1] === "x" || body[1] === "X"
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
    if (code === undefined || !Number.isFinite(code)) return whole;
    if (PLAIN[code] !== undefined) return PLAIN[code];
    // A soft hyphen or zero-width joiner is an instruction to a printer, not a character to read.
    if (code === 0xad || code === 0x200b || code === 0x200c || code === 0x200d) return "";
    if (code < 32 || (code >= 127 && code < 160) || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return whole;
    return String.fromCodePoint(code);
  });
}
