import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Runs the daily puzzle's build script, and only that.
 *
 * The script fetches from the SEC, so it must never run as part of the normal
 * unit suite. Its file ends in `.puzzle.ts`, which the default test pattern
 * does not match; this config is the one way to run it:
 *
 *     npx vitest run -c scripts/daily-puzzle/vitest.config.ts
 *
 * It is a plain Node run: none of the unit suite's browser setup applies.
 */
export default defineConfig({
  test: {
    include: ["scripts/daily-puzzle/**/*.puzzle.ts"],
    environment: "node",
    testTimeout: 1_800_000,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "../..") } },
});
