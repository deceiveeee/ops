import { test, expect, type Page } from "@playwright/test";

/**
 * The rendered half of the design check: what a visitor sees that marks a page
 * as assembled from a template. The rules and their reasons are in
 * docs/design/anti-template-restructure-plan-2026-11-04.md, section 4; the
 * source half is lib/design-check/scan.ts.
 *
 * Pages already rebuilt are enforced. Every other page is measured only when
 * DESIGN_REPORT=1 is set, and then reported rather than failed, so the rest of
 * the site can be brought over one phase at a time without blocking other work:
 *
 *     DESIGN_REPORT=1 npx playwright test e2e/design-check.spec.ts
 */

type Budget = { route: string; screens: Record<number, number> };

const ENFORCED: Budget[] = [
  { route: "/", screens: { 1440: 3.5, 390: 5 } },
  // Since 2026-11-13 Courses lists every module and mission, so a visitor can see
  // what they would learn; on a phone that single column measures 3.38 screens.
  { route: "/courses", screens: { 1440: 1.5, 390: 3.5 } },
  { route: "/courses/finance-foundations", screens: { 1440: 3, 390: 6 } },
  { route: "/courses/investment-foundations", screens: { 1440: 3, 390: 6 } },
  // The start guide, rebuilt 2026-11-13: measured 1.15 and 1.40 screens on its first step.
  { route: "/start", screens: { 1440: 1.5, 390: 2 } },
];
const REPORTED = [
  "/studio",
  "/daily",
  "/lessons/what-is-finance-value-time-risk",
];
const SIZES: Record<number, number> = { 1440: 900, 390: 844 };

/** The most text colours a page may draw. The daily puzzle uses 2 and a lesson 6 to 8. */
const MAX_TEXT_COLOURS = 8;
/** One shadow for pop-ups and one faint lift for the sheet being worked on. */
const MAX_SHADOW_KINDS = 2;
const BANNED = ["unlock", "empower", "seamless", "streamline", "robust", "cutting-edge", "elevate", "harness", "delve", "journey", "journeys"];

type Measured = {
  screens: number;
  textColours: string[];
  shadowKinds: string[];
  capitals: string[];
  italicHeadings: string[];
  gradientSurfaces: string[];
  centredText: string[];
  bannedWords: string[];
  triplets: string[];
  yourSlogans: string[];
};

async function measure(page: Page): Promise<Measured> {
  return page.evaluate((banned) => {
    const main = document.querySelector("main") ?? document.body;
    const visible = (element: Element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.opacity !== "0";
    };
    const all = [...main.querySelectorAll("*")].filter(visible);
    const ownText = (element: Element) => [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim());
    const texts = all.filter(ownText);
    const label = (element: Element) => `${element.tagName.toLowerCase()} "${(element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60)}"`;

    // Shadows that lift something off the page. An inset hairline or a flat
    // ring is a border drawn another way, not elevation.
    const elevation = (shadow: string) =>
      shadow !== "none" &&
      shadow
        .split(/,(?![^(]*\))/)
        .some((part) => !/inset/.test(part) && /(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/.test(part) && !/\b0px\s+0px\s+0px\b/.test(part));

    const gradientSurfaces = all
      .filter((element) => /gradient\(/.test(getComputedStyle(element).backgroundImage))
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return (box.width >= 32 && box.height >= 32) || element.matches("a, button");
      })
      .map(label);

    const sentences = (text: string) =>
      text
        .replace(/\s+/g, " ")
        .split(/(?<=[a-z%)”’'"][.!?])\s*/i)
        .map((part) => part.trim())
        .filter(Boolean);
    const words = (sentence: string) => sentence.split(/\s+/).filter((word) => /[a-z]/i.test(word)).length;
    const candidates = all.filter(
      (element) =>
        (element.matches("p, h1, h2, h3, li") || element.querySelectorAll(":scope > p").length >= 2) &&
        (element.textContent ?? "").length < 240,
    );
    const triplets = new Set<string>();
    for (const element of candidates) {
      const parts = sentences(element.textContent ?? "");
      for (let i = 0; i + 2 < parts.length; i++) {
        const run = parts.slice(i, i + 3);
        if (run.every((sentence) => /[.!?]$/.test(sentence) && words(sentence) <= 6)) triplets.add(run.join(" "));
      }
    }

    const text = (main as HTMLElement).innerText;
    return {
      screens: document.documentElement.scrollHeight / innerHeight,
      textColours: [...new Set(texts.map((element) => getComputedStyle(element).color))],
      shadowKinds: [...new Set(all.map((element) => getComputedStyle(element).boxShadow).filter(elevation))],
      capitals: texts.filter((element) => getComputedStyle(element).textTransform === "uppercase").map(label),
      italicHeadings: [...main.querySelectorAll("h1, h2")]
        .filter(visible)
        .filter((heading) => [heading, ...heading.querySelectorAll("*")].some((part) => getComputedStyle(part).fontStyle === "italic"))
        .map(label),
      gradientSurfaces,
      centredText: all
        .filter((element) => element.matches("p, h1, h2, h3, li") && getComputedStyle(element).textAlign === "center" && (element.textContent ?? "").trim().length >= 20)
        .map(label),
      bannedWords: banned.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(text)),
      triplets: [...triplets],
      yourSlogans: [...new Set(text.match(/\bYour [a-z]+\.\s*Your [a-z]+\./gi) ?? [])],
    };
  }, BANNED);
}

function problems(measured: Measured, maxScreens: number | undefined): string[] {
  const found: string[] = [];
  if (maxScreens !== undefined && measured.screens > maxScreens) found.push(`page is ${measured.screens.toFixed(2)} screens tall; the budget is ${maxScreens}`);
  if (measured.textColours.length > MAX_TEXT_COLOURS) found.push(`${measured.textColours.length} text colours (at most ${MAX_TEXT_COLOURS}): ${measured.textColours.join(" | ")}`);
  if (measured.shadowKinds.length > MAX_SHADOW_KINDS) found.push(`${measured.shadowKinds.length} kinds of shadow (at most ${MAX_SHADOW_KINDS}): ${measured.shadowKinds.join(" | ")}`);
  const lists: [keyof Measured, string][] = [
    ["capitals", "text set in capitals"],
    ["italicHeadings", "a heading with an italic part"],
    ["gradientSurfaces", "a gradient on a surface or control"],
    ["centredText", "centred text"],
    ["bannedWords", "a banned word"],
    ["triplets", "three short fragments in a row"],
    ["yourSlogans", 'a "Your X. Your Y." slogan'],
  ];
  for (const [key, what] of lists) {
    const items = measured[key] as string[];
    if (items.length) found.push(`${what}: ${items.slice(0, 6).join("; ")}${items.length > 6 ? ` (+${items.length - 6} more)` : ""}`);
  }
  return found;
}

async function open(page: Page, route: string, width: number) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width, height: SIZES[width] });
  await page.goto(route);
  // A cold dev server compiles a route on first request.
  await expect(page.locator("main")).toBeVisible({ timeout: 45_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

for (const { route, screens } of ENFORCED) {
  for (const width of Object.keys(SIZES).map(Number)) {
    test(`design check: ${route} at ${width}px`, async ({ page }) => {
      await open(page, route, width);
      const found = problems(await measure(page), screens[width]);
      expect(found, found.join("\n")).toEqual([]);
    });
  }
}

test.describe("design check report", () => {
  test.skip(process.env.DESIGN_REPORT !== "1", "Set DESIGN_REPORT=1 to measure pages not yet rebuilt.");
  for (const route of REPORTED) {
    for (const width of Object.keys(SIZES).map(Number)) {
      test(`design report: ${route} at ${width}px`, async ({ page }, info) => {
        await open(page, route, width);
        const measured = await measure(page);
        const found = problems(measured, undefined);
        const summary = `${route} at ${width}px: ${measured.screens.toFixed(2)} screens; ${found.length ? found.join("\n  ") : "no findings"}`;
        info.annotations.push({ type: "design report", description: summary });
        console.log(summary);
      });
    }
  }
});
