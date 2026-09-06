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
