/**
 * A problem report: what a visitor typed into "Report a problem", plus the
 * page they were on, their screen size and their browser, so the problem can
 * be found again. Nothing else is kept: no name, no email, no account, no IP
 * address. `/privacy` describes exactly these four things; if a field is added
 * here, that page stops being true and must change first.
 */

export const MESSAGE_MAX = 2000;
const PAGE_MAX = 300;
const BROWSER_MAX = 300;
const VIEWPORT = /^\d{2,5}x\d{2,5}$/;

export type ProblemReport = {
  message: string;
  /** The path only, such as `/lessons/what-is-finance`. Never the query string. */
  page: string;
  /** Width x height in CSS pixels, such as `390x844`. */
  viewport: string | null;
  browser: string | null;
};

export type ParsedReport =
  | { ok: true; report: ProblemReport }
  | { ok: false; error: string };

export const EMPTY_MESSAGE = "Write what went wrong before sending.";
export const LONG_MESSAGE = `That is longer than ${MESSAGE_MAX.toLocaleString("en-US")} characters. Shorten it and send it again.`;

/** Control characters other than tab and line breaks; they display as nothing and only hide content. */
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function parseProblemReport(body: unknown, userAgent: string | null): ParsedReport {
  if (typeof body !== "object" || body === null) return { ok: false, error: EMPTY_MESSAGE };
  const fields = body as Record<string, unknown>;

  const message = typeof fields.message === "string" ? fields.message.replace(CONTROL, "").trim() : "";
  if (!message) return { ok: false, error: EMPTY_MESSAGE };
  if (message.length > MESSAGE_MAX) return { ok: false, error: LONG_MESSAGE };

  return {
    ok: true,
    report: {
      message,
      page: pagePath(fields.page),
      viewport: typeof fields.viewport === "string" && VIEWPORT.test(fields.viewport) ? fields.viewport : null,
      browser: userAgent ? userAgent.replace(CONTROL, "").slice(0, BROWSER_MAX) || null : null,
    },
  };
}

/**
 * Keep the path and drop everything after it. A query string can carry a
 * company or a case name today and something personal tomorrow, and the path
 * alone is enough to find the page.
 */
function pagePath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "unknown";
  try {
    const path = new URL(value, "https://report.invalid").pathname;
    return path.replace(CONTROL, "").slice(0, PAGE_MAX) || "/";
  } catch {
    return "unknown";
  }
}
