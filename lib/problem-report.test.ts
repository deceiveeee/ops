import { describe, expect, it } from "vitest";
import { EMPTY_MESSAGE, LONG_MESSAGE, MESSAGE_MAX, parseProblemReport } from "./problem-report";

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)";

describe("parseProblemReport", () => {
  it("keeps the message, the path, the screen size and the browser", () => {
    expect(parseProblemReport({ message: "  The Next button stayed grey.  ", page: "/lessons/x", viewport: "390x844" }, UA)).toEqual({
      ok: true,
      report: { message: "The Next button stayed grey.", page: "/lessons/x", viewport: "390x844", browser: UA },
    });
  });

  it("drops the query string and the hash from the page", () => {
    const parsed = parseProblemReport({ message: "x", page: "/studio/investigate?company=abc&email=a@b.c#top" }, null);
    expect(parsed.ok && parsed.report.page).toBe("/studio/investigate");
  });

  it("refuses a missing, blank or non-text message", () => {
    for (const body of [{}, { message: "" }, { message: "   \n  " }, { message: 42 }, null, "text", []]) {
      expect(parseProblemReport(body, UA)).toEqual({ ok: false, error: EMPTY_MESSAGE });
    }
  });

  it("accepts exactly the maximum length and refuses one character more", () => {
    expect(parseProblemReport({ message: "a".repeat(MESSAGE_MAX), page: "/" }, null).ok).toBe(true);
    expect(parseProblemReport({ message: "a".repeat(MESSAGE_MAX + 1), page: "/" }, null)).toEqual({ ok: false, error: LONG_MESSAGE });
  });

  it("removes invisible control characters but keeps line breaks", () => {
    const parsed = parseProblemReport({ message: "line one\u0000\nline\u0007 two", page: "/" }, "agent\u0000");
    expect(parsed.ok && parsed.report.message).toBe("line one\nline two");
    expect(parsed.ok && parsed.report.browser).toBe("agent");
  });

  it("records an unknown page rather than another site's address", () => {
    for (const page of ["https://elsewhere.example/x", "//elsewhere.example/x", "lessons/x", 7, undefined]) {
      const parsed = parseProblemReport({ message: "x", page }, null);
      expect(parsed.ok && parsed.report.page).toBe("unknown");
    }
  });

  it("ignores a screen size that is not two numbers", () => {
    for (const viewport of ["390 x 844", "390x", "wide", "1x1", 390, "390x844; drop table"]) {
      const parsed = parseProblemReport({ message: "x", page: "/", viewport }, null);
      expect(parsed.ok && parsed.report.viewport).toBeNull();
    }
  });

  it("shortens a very long browser string and treats a missing one as unknown", () => {
    const long = parseProblemReport({ message: "x", page: "/" }, "b".repeat(1000));
    expect(long.ok && long.report.browser?.length).toBe(300);
    const none = parseProblemReport({ message: "x", page: "/" }, null);
    expect(none.ok && none.report.browser).toBeNull();
  });
});
