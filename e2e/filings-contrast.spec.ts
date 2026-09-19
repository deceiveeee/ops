import { expect, test, type Page } from "@playwright/test";

/**
 * The filing reader, measured on the ground it is actually painted on.
 *
 * A theme conversion is exactly the change that passes every other check and
 * still ships something nobody can read: the markup is right, the tests pass,
 * and a colour resolves against a background it was never chosen for. So this
 * walks the rendered page, composites each element's colour over whatever is
 * actually behind it, and holds every one to WCAG.
 *
 * Measured rather than derived from the token values. A token is only correct
 * in the place it lands, and two of the colours on this page were dead on
 * arrival — `ops-caption` and `ops-body-strong` carry light-theme rules with a
 * descendant selector, which outranks a utility class and silently repaints it.
 */

const PAGES = [
  { name: "the filing list", url: "/filings?ticker=AAPL" },
  { name: "the reader's own shell", url: "/filings" },
];

type Measured = { text: string; ratio: number; color: string; on: string; size: number; bold: boolean };

/**
 * Every piece of text on the page, with the ratio it actually renders at.
 *
 * The background is resolved by walking up until something opaque is found,
 * because almost every surface here is a panel on a canvas and reading only the
 * element's own `background-color` would measure transparent against nothing.
 */
async function measure(page: Page): Promise<Measured[]> {
  return page.evaluate(() => {
    const parse = (value: string): [number, number, number, number] => {
      const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
    };
    const over = (top: number[], bottom: number[]): number[] => {
      const alpha = top[3];
      return [0, 1, 2].map((i) => top[i] * alpha + bottom[i] * (1 - alpha));
    };
    const luminance = (rgb: number[]): number => {
      const [r, g, b] = rgb.map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: number[], b: number[]): number => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (light + 0.05) / (dark + 0.05);
    };
    const backgroundOf = (element: Element): number[] => {
      let node: Element | null = element;
      let stack: number[][] = [];
      while (node) {
        const rgba = parse(getComputedStyle(node).backgroundColor);
        if (rgba[3] > 0) {
          stack.push(rgba);
          if (rgba[3] === 1) break;
        }
        node = node.parentElement;
      }
      // Page ground under everything, in case nothing opaque was found.
      let result = [255, 255, 255];
      for (const layer of stack.reverse()) result = over(layer, result);
      return result;
    };

    const out: Measured[] = [];
    for (const element of Array.from(document.querySelectorAll("body *"))) {
      const own = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? "")
        .join(" ")
        .trim();
      if (!own) continue;
      const style = getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;

      const color = parse(style.color);
      const background = backgroundOf(element);
      const size = parseFloat(style.fontSize);
      const weight = Number(style.fontWeight) || 400;
      out.push({
        text: own.slice(0, 60),
        ratio: ratio(over(color, background), background),
        color: style.color,
        on: `rgb(${background.map(Math.round).join(", ")})`,
        size,
        bold: weight >= 700,
      });
    }
    return out;
  });
}

/** WCAG: 3:1 for large text, 4.5:1 for the rest. */
const required = (item: Measured): number =>
  item.size >= 24 || (item.size >= 18.66 && item.bold) ? 3 : 4.5;

for (const target of PAGES) {
  test(`every word on ${target.name} is readable on the ground it lands on`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(target.url);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const measured = await measure(page);
    // A page that measured nothing would pass silently, which is the one
    // outcome this test must never produce.
    expect(measured.length).toBeGreaterThan(10);

    const failing = measured
      .filter((item) => item.ratio < required(item))
      .map((item) => `${item.ratio.toFixed(2)}:1 (needs ${required(item)}) — "${item.text}" ${item.color} on ${item.on}`);

    expect(failing, `contrast failures on ${target.url}`).toEqual([]);
  });
}
