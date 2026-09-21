import { describe, expect, it } from "vitest";
import { routeTheme } from "./route-theme";

/**
 * One line decides whether a surface is readable.
 *
 * The theme is resolved from the pathname alone, and the failure it produces is
 * total rather than partial: a page built on dark literals rendered on the light
 * ground shows white text on white. Every surface now shares one light system
 * (app/refresh.css), so the rule is that moving between routes never changes the
 * theme; a route that came back dark would fail here next to the reason rather
 * than in a browser.
 */

describe("which surfaces are light", () => {
  it("covers the ones someone reads and works in", () => {
    expect(routeTheme("/courses")).toBe("light");
    expect(routeTheme("/lessons/if-1-1-how-an-investor-builds-a-philosophy")).toBe("light");
    expect(routeTheme("/studio")).toBe("light");
    expect(routeTheme("/studio/investigate")).toBe("light");
  });

  it("includes the filing reader, which Studio leads into", () => {
    // Research opens with a search that lands here, so the two are one task.
    expect(routeTheme("/studio/filings")).toBe("light");
    expect(routeTheme("/studio/filings/0000320193/0000320193-25-000079")).toBe("light");
  });

  it("does not change when someone moves from the homepage into their work", () => {
    for (const path of ["/", "/start", "/login", "/studio/research"]) expect(routeTheme(path)).toBe("light");
  });
});
