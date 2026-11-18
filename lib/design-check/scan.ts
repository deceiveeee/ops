/**
 * The source half of the design check: style choices that make a page look
 * assembled from a template rather than designed for OPS.
 *
 * See docs/design/anti-template-restructure-plan-2026-11-04.md, section 4. The
 * copy rules (slogans, banned words) are checked on the rendered page instead,
 * in e2e/design-check.spec.ts, because only the rendered text is what a visitor
 * reads.
 *
 * A line can opt out of one rule with a comment naming the rule and a reason,
 * on that line or the line above it:
 *
 *     /* design-check-allow: gradient - the fill encodes the bond's yield *\/
 *
 * The reason is required, so an exception says why it is not decoration.
 */

export type DesignRule = "capitals" | "gradient" | "raw-colour";

export type DesignFinding = {
  rule: DesignRule;
  /** 1-based line number in the file. */
  line: number;
  /** The offending line, trimmed, for the report. */
  text: string;
};

const ALLOW = /design-check-allow:\s*(capitals|gradient|raw-colour)\s*[-–—:]\s*\S/;

/** Text in capitals is a CSS choice here, never typed capitals, so only the transform is checked. */
const CAPITALS_TSX = /(?:className|class)=[^>]*?\buppercase\b|textTransform:\s*["']uppercase["']/;
const CAPITALS_CSS = /text-transform\s*:\s*uppercase/;

const GRADIENT = /\b(?:repeating-)?(?:linear|radial|conic)-gradient\(|<(?:linear|radial)Gradient\b/;

/** A colour typed into the file instead of read from a named site colour. */
const RAW_COLOUR_CSS = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;
/** In components, a quoted hex value: an inline style, a fill or a stroke. */
const RAW_COLOUR_TSX = /["'`]#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?["'`]|\b(?:rgba?|hsla?)\(/;

/** Comments describe code, and a comment quoting a banned pattern is not a use of it. */
function blankComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (match, lead: string) => lead + " ".repeat(match.length - lead.length));
}

export function scanSource(file: string, source: string): DesignFinding[] {
  const isCss = /\.css$/.test(file);
  const original = source.split(/\r?\n/);
  const code = blankComments(source).split(/\r?\n/);
  const checks: [DesignRule, RegExp][] = isCss
    ? [["capitals", CAPITALS_CSS], ["gradient", GRADIENT], ["raw-colour", RAW_COLOUR_CSS]]
    : [["capitals", CAPITALS_TSX], ["gradient", GRADIENT], ["raw-colour", RAW_COLOUR_TSX]];

  const findings: DesignFinding[] = [];
  code.forEach((line, index) => {
    for (const [rule, pattern] of checks) {
      if (!pattern.test(line)) continue;
      const allowed = [original[index], original[index - 1] ?? ""].some((candidate) => {
        const match = candidate.match(ALLOW);
        return match?.[1] === rule;
      });
      if (!allowed) findings.push({ rule, line: index + 1, text: original[index].trim().slice(0, 160) });
    }
  });
  return findings;
}
