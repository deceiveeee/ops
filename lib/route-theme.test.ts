import { describe, expect, it } from "vitest";
import { routeTheme } from "./route-theme";

/**
 * One line decides whether a surface is readable.
 *
 * The theme is resolved from the pathname alone, and the failure it produces is
 * total rather than partial: a page built on dark literals rendered on the light
 * ground shows white text on white. Studio's conversion is what made its own
 * line safe to add, and the filing reader's the same. These say which routes
 * have been through that, so adding a route here without converting it fails
 * next to the reason rather than in a browser.
 */

describe("which surfaces are light", () => {
  it("covers the ones someone reads and works in", () => {
    expect(routeTheme("/courses")).toBe("light");
    expect(routeTheme("/lessons/if-1-1-how-an-investor-builds-a-philosophy")).toBe("light");
    expect(routeTheme("/studio")).toBe("light");
    expect(routeTheme("/studio/investigate")).toBe("light");
  });

  it("includes the filing reader, which Studio now leads into", () => {
    // Research opens with a search that lands here, so the two are one task.
    expect(routeTheme("/filings")).toBe("light");
    expect(routeTheme("/filings/0000320193/0000320193-25-000079")).toBe("light");
  });

  it("leaves the marketing pages dark", () => {
    expect(routeTheme("/")).toBe("dark");
    expect(routeTheme("/start")).toBe("dark");
    expect(routeTheme("/login")).toBe("dark");
  });
});
