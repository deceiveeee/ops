import { test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

/**
 * Render a surface and write evidence an agent can actually look at.
 *
 * This exists because text-based checks kept passing on pages that were wrong.
 * The typography gate walks every stage and reports clean; a human opening the
 * page immediately saw a wall of empty textareas and a rail showing the wrong
 * module. Neither is visible in a DOM assertion. Screenshots on disk can be
 * read back by an agent, which closes that gap without needing a visible
 * browser pane.
 *
 * Not part of the normal suite — it skips unless OPS_CAPTURE_URL is set.
 *
 *   OPS_CAPTURE_URL=/lessons/if-8-1-choose-passive-or-prove-an-edge \
 *   OPS_CAPTURE_NAME=m10-licence \
 *   npx playwright test e2e/capture-ui.spec.ts --workers=1
 *
 * Optional: OPS_CAPTURE_STEPS is a JSON array of accessible button names to
 * click before capturing, so a later stage can be reached.
 */

/**
 * Accepts `lessons/x`, `/lessons/x` or a full URL.
 *
 * Git Bash rewrites a leading-slash argument into a Windows path, so
 * `/lessons/x` arrives as `C:/Program Files/Git/lessons/x`. Recovering the
 * route here is friendlier than requiring MSYS_NO_PATHCONV at every call site.
 */
function normalizeRoute(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  if (/^https?:\/\//.test(raw)) return raw;
  const mangled = raw.match(/^[a-zA-Z]:[\\/].*?[\\/](lessons|courses|plan|start)[\\/](.*)$/);
  if (mangled) return `/${mangled[1]}/${mangled[2]}`.replace(/\\/g, "/");
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const URL_UNDER_TEST = normalizeRoute(process.env.OPS_CAPTURE_URL);
const NAME = process.env.OPS_CAPTURE_NAME ?? "surface";
const OUT = ".agent-shots";

/** The widths AGENTS.md requires; a change verified at one width is not verified. */
const WIDTHS = [390, 768, 1024, 1280, 1440, 1920];

/**
 * Steps are matched across the roles a lesson control can legitimately carry.
 *
 * Answer cards are `role="radio"` inside a `radiogroup`, which is correct ARIA
 * and what the onboarding cards already use — but a button-only lookup silently
 * fails on them, so a stage walk would stop at the first question and report
 * "clean" on a surface it never reached.
 */
async function runSteps(page: Page) {
  const raw = process.env.OPS_CAPTURE_STEPS;
  if (!raw) return;
  for (const step of JSON.parse(raw) as string[]) {
    const name = new RegExp(step);
    const candidates = [
      page.getByRole("button", { name }),
      page.getByRole("radio", { name }),
      page.getByRole("link", { name }),
      page.getByRole("checkbox", { name }),
    ];
    let clicked = false;
    for (const locator of candidates) {
      if ((await locator.count()) > 0) {
        await locator.first().click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      throw new Error(
        `OPS_CAPTURE_STEPS: no button, radio, link or checkbox matched "${step}"`,
      );
    }
    await page.waitForTimeout(350);
  }
}

test.skip(!URL_UNDER_TEST, "set OPS_CAPTURE_URL to capture a surface");

test("capture surface across the required widths", async ({ page }) => {
  test.setTimeout(240_000);
  mkdirSync(OUT, { recursive: true });

  const report: string[] = [`# ${NAME} — ${URL_UNDER_TEST}`, ""];
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL_UNDER_TEST!);
    await page.waitForTimeout(900);
    await runSteps(page);
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${OUT}/${NAME}-${width}.png`, fullPage: true });

    const m = await page.evaluate(() => {
      const doc = document.documentElement;
      // Any region the learner has to scroll inside, on top of the page scroll.
      const nested = [...document.querySelectorAll("*")]
        .filter((el) => {
          const s = getComputedStyle(el);
          return (
            /auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 24
          );
        })
        .map((el) => {
          const e = el as HTMLElement;
          return `${(e.getAttribute("class") ?? e.tagName).slice(0, 34)} ${Math.round(e.clientHeight)}px window / ${Math.round(e.scrollHeight)}px content`;
        });
      return {
        screens: doc.scrollHeight / window.innerHeight,
        sideways: doc.scrollWidth > doc.clientWidth,
        nested,
      };
    });

    report.push(
      `## ${width}px`,
      `- page height: **${m.screens.toFixed(2)} screens** (limit 1.5)`,
      `- sideways scroll: ${m.sideways ? "**YES — defect**" : "no"}`,
      m.nested.length
        ? `- nested scroll regions:\n${m.nested.map((n) => `  - ${n}`).join("\n")}`
        : "- nested scroll regions: none",
      `- screenshot: \`${OUT}/${NAME}-${width}.png\``,
      "",
    );
  }

  report.push(
    "## console",
    consoleErrors.length
      ? consoleErrors.map((e) => `- **${e}**`).join("\n")
      : "- no errors",
    "",
  );

  writeFileSync(`${OUT}/${NAME}-report.md`, report.join("\n"), "utf8");
});
