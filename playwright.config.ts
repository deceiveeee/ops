import { defineConfig, devices } from "@playwright/test";

/**
 * The dev server port is configurable so two checkouts of this repository can
 * run a dev server and an e2e suite at the same time.
 *
 * `reuseExistingServer` is on outside CI, which is what makes a second working
 * tree dangerous with a hardcoded port: the suite silently attaches to whichever
 * server happens to be listening on 3000 and reports a pass or a failure against
 * code that is not the code under test. Setting PORT gives a tree its own
 * server; leaving it unset keeps the previous behaviour exactly.
 */
const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  globalSetup: "./e2e/global-setup",
  testDir: "./e2e",
  fullyParallel: true,
  /*
   * Capped, because the suite runs against `next dev` and the bottleneck is the
   * single dev server, not the machine's cores. Playwright's default is half the
   * logical cores -- seven here -- and at seven the server starts aborting
   * navigations outright: a full run on 2026-09-06 failed ten tests, every one
   * of them `page.goto: net::ERR_ABORTED` or a timeout rather than a failed
   * assertion, and the same commit passed 32/32 in isolation and 66/66 at four.
   *
   * Four is also faster in wall-clock -- 2.6 minutes against 4.1 -- so this
   * costs nothing. Raise it only against a prebuilt server, where there is no
   * on-demand compilation to serialise behind.
   */
  workers: process.env.CI ? undefined : 4,
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
