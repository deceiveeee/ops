import { defineConfig, devices } from "@playwright/test";

/**
 * The suite runs against a production build, not `next dev`.
 *
 * `next dev` compiles each route on first request, and every worker queues
 * behind the one server doing it. At Playwright's default worker count (half
 * the logical cores — seven on the machine this was measured on) that server
 * stopped answering: a full run on 2026-09-06 failed ten tests, every one of
 * them `page.goto: net::ERR_ABORTED` or a timeout rather than a failed
 * assertion. The same commit passed 32/32 in isolation and 66/66 at four
 * workers. Capping workers worked, but it treats the symptom — a prebuilt
 * server has nothing left to compile, so the contention does not exist.
 *
 * It is also the more faithful gate. These tests are the last thing standing
 * between a change and production, and `next dev` differs from what ships in
 * ways that matter to them: no minification, no route prerendering, different
 * hydration timing.
 *
 * The cost is the build, which the webServer timeout below has to accommodate.
 * In practice it is small: webpack's cache survives between runs, so only the
 * first build is slow and the suite came in at 2.8-2.9 minutes end to end,
 * which is no worse than the capped dev path it replaces.
 *
 * For a fast edit-run loop — HMR, and no rebuild between runs — set
 * `E2E_DEV_SERVER=1` to get the dev server back. It stays capped at four
 * workers, because that path still has the problem.
 *
 *     $env:E2E_DEV_SERVER=1; npm run test:e2e     # PowerShell
 *     E2E_DEV_SERVER=1 npm run test:e2e           # bash
 */
const useDevServer = process.env.E2E_DEV_SERVER === "1";

/**
 * The port is configurable so two checkouts can run a server and a suite at the
 * same time.
 *
 * That matters most on the dev path, where `reuseExistingServer` is on: the
 * suite would otherwise attach to whichever server happens to hold 3000 and
 * report a pass or a failure against code that is not the code under test.
 * Setting PORT gives a tree its own server.
 */
const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  globalSetup: "./e2e/global-setup",
  testDir: "./e2e",
  fullyParallel: true,
  // Only the dev path needs a cap; see the note above.
  workers: !useDevServer || process.env.CI ? undefined : 4,
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: useDevServer ? "npm run dev" : "npm run build && npm run start",
    url: baseURL,
    /*
     * Never reused on the production path. Reuse is what makes a stale server
     * dangerous, and here it would be worse than stale: a `next dev` process
     * left on this port would be silently accepted, and the run would quietly
     * go back to testing the thing this config exists to stop testing. Refusing
     * to start is the honest outcome.
     */
    reuseExistingServer: !process.env.CI && useDevServer,
    // The default is 60s and the build alone takes longer than that.
    timeout: useDevServer ? 120_000 : 300_000,
  },
});
