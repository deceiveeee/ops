import { defineConfig, devices } from "@playwright/test";

/** Native browser storage tests use an intercepted local origin, without starting or disturbing Next. */
export default defineConfig({
  testDir: "./e2e", testMatch: "studio-storage.spec.ts", fullyParallel: true, workers: 2,
  use: { ...devices["Desktop Chrome"], trace: "on-first-retry" },
});
