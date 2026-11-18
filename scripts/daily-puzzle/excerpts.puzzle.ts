/**
 * Captures each puzzle's report excerpt: the company's own income statement,
 * from its title to the revenue line, and from the line before operating
 * profit to operating profit, latest year only, with the clue lines highlighted.
 * Writes the pictures to public/images/reports/ and the list to
 * data/daily-puzzle/excerpts.ts, and a contact sheet to tmp/excerpts-review.html
 * for checking every picture by eye.
 *
 *     npx vitest run -c scripts/daily-puzzle/vitest.config.ts scripts/daily-puzzle/excerpts.puzzle.ts
 *
 * Reads only the annual reports build.puzzle.ts cached in tmp/daily-puzzle-cache/;
 * it sends nothing to the SEC. Each report is rendered with scripts and network
 * off. Lines are found by their figures, not their labels, because companies
 * word them differently ("Total revenue", "Net sales", "Revenues"): the revenue
 * row is the one whose latest-year figure equals the puzzle's revenue, in the
 * statement's own units, and likewise for operating profit.
 *
 * Every puzzle either gets an excerpt or is listed as skipped with the reason;
 * nothing is guessed. lib/daily-puzzle/excerpts.test.ts then rechecks every
 * figure against the puzzle data.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, type Page } from "playwright";
import { expect, test } from "vitest";
import { PUZZLES } from "@/data/daily-puzzle/puzzles";
import { archivePath, fixtureFileName } from "@/lib/filings/edgar";

const ROOT = process.cwd();
const CACHE = path.join(ROOT, "tmp", "daily-puzzle-cache");
/**
 * EXCERPTS_ONLY=9,23 runs a trial on those puzzles alone: pictures and the review sheet go to
 * tmp/excerpts-trial/, and the real list and pictures are left as they are.
 */
const ONLY = (process.env.EXCERPTS_ONLY ?? "").split(",").map(Number).filter(Boolean);
const TRIAL = ONLY.length > 0;
const OUT_DIR = TRIAL ? path.join(ROOT, "tmp", "excerpts-trial") : path.join(ROOT, "public", "images", "reports");
const DATA = path.join(ROOT, "data", "daily-puzzle", "excerpts.ts");
const SHEET = TRIAL ? path.join(OUT_DIR, "review.html") : path.join(ROOT, "tmp", "excerpts-review.html");
/** A phone's width: the text then shows near full size on a phone and at full size on a desktop. */
const LAYOUT_WIDTH = 340;
const HIGHLIGHT = "#FFF1A8";
/** Part two starts at most this many lines above operating profit, so it stays a short, continuous cut. */
const MAX_PART_TWO_LINES = 4;

type Found = {
  tableIndex: number;
  title: string | null;
  units: "thousands" | "millions";
  revenue: { row: number; label: string; printed: string };
  operating: { row: number; label: string; printed: string };
  costs: { row: number; label: string; printed: string } | null;
  partTwoFrom: number;
  leftOut: number;
  flags: string[];
};

/** Finds the income statement and its rows by figure. Runs in the page. */
function locate({ revenue, operating, maxPartTwo }: { revenue: number; operating: number; maxPartTwo: number }): Found | { error: string } {
  const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
  /** A printed figure, its value and how many decimals it shows ("37,184.4" -> 37184.4, 1). */
  const parse = (text: string): { value: number; decimals: number } | null => {
    const t = norm(text).replace(/[$ \s]/g, "");
    if (!/^\(?-?[\d,]+(\.\d+)?\)?$/.test(t) || !/\d/.test(t)) return null;
    const negative = t.startsWith("(") || t.startsWith("-");
    const digits = t.replace(/[(),-]/g, "");
    const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
    const n = Number(digits);
    return { value: negative ? -n : n, decimals };
  };
  /** True when a printed figure is the exact amount, rounded the way the statement rounds it. */
  const near = (printed: { value: number; decimals: number }, exact: number, divisor: number) =>
    Math.abs(printed.value * divisor - exact) <= 0.5 * Math.pow(10, -printed.decimals) * divisor + 1e-6;
  // A statement's own title: short, not a sentence that merely mentions a statement.
  const titleRe = /(consolidated |combined )?(statements? of (consolidated )?(income|operations|earnings|comprehensive (income|loss))|income statements?)/i;
  const isTitle = (text: string) => text.length <= 130 && titleRe.test(text) && !/^(the following|selected|results|we |our |as |in )/i.test(text);
  const tables = [...document.querySelectorAll("table")];
  const candidates: (Found & { score: number })[] = [];
  for (const [tableIndex, table] of tables.entries()) {
    const rows = [...table.querySelectorAll("tr")];
    const tableTop = table.getBoundingClientRect().top + scrollY;
    const headings = [...document.querySelectorAll("p, div, span, td")].filter((el) => {
      const r = el.getBoundingClientRect().top + scrollY;
      const text = norm(el.textContent);
      return r < tableTop && r > tableTop - 260 && text.length > 0 && text.length < 180 && !table.contains(el);
    });
    const title = headings.filter((el) => isTitle(norm(el.textContent))).sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0] ?? null;
    const nearby = headings.map((el) => norm(el.textContent)).join(" ") + " " + rows.slice(0, 4).map((r) => norm(r.textContent)).join(" ");
    const unitsMatch = nearby.match(/\(\s*(?:amounts |dollars |\$ )?(?:in )?(thousands|millions)/i) ?? nearby.match(/\bin (thousands|millions)\b/i);
    const unitsSaid = (unitsMatch ? unitsMatch[1].toLowerCase() : null) as "thousands" | "millions" | null;
    const cellsOf = (row: Element) => [...row.children].map((cell) => ({ cell, printed: parse(cell.textContent ?? "") }));
    for (const units of ["thousands", "millions"] as const) {
      if (unitsSaid && unitsSaid !== units) continue;
      const divisor = units === "thousands" ? 1e3 : 1e6;
      const find = (exact: number, from = 0) => {
        for (let i = from; i < rows.length; i++) {
          const hit = cellsOf(rows[i]).find((c) => c.printed && near(c.printed, exact, divisor));
          if (hit) return { row: i, cell: hit.cell, printed: hit.printed! };
        }
        return null;
      };
      const rev = find(revenue);
      if (!rev) continue;
      const op = find(operating, rev.row + 1);
      if (!op) continue;
      const flags: string[] = [];
      const rc = rev.cell.getBoundingClientRect();
      if (Math.abs(rc.right - op.cell.getBoundingClientRect().right) > 4) flags.push("revenue and operating profit figures are in different columns");
      if (!unitsSaid) flags.push("units line not found near the statement; matched as " + units);
      const label = (row: Element) => norm([...row.children].map((c) => norm(c.textContent)).find((t) => t && parse(t) === null && t !== "$") ?? "").replace(/:$/, "");
      const shown = (cell: Element) => norm(cell.textContent).replace(/^\$\s*/, "");
      // A cost line that, taken from revenue, leaves operating profit, in the same column. Optional.
      let costs: Found["costs"] = null;
      const wantCosts = rev.printed.value - op.printed.value;
      for (let i = op.row - 1; i > rev.row; i--) {
        const match = cellsOf(rows[i]).find((c) => c.printed && Math.abs(c.printed.value - wantCosts) < 1e-6 && Math.abs(c.cell.getBoundingClientRect().right - rc.right) < 4);
        if (match) { costs = { row: i, label: label(rows[i]), printed: shown(match.cell) }; break; }
      }
      const textRows = (from: number, to: number) => rows.slice(from, to).filter((row) => norm(row.textContent)).length;
      let partTwoFrom = op.row;
      if (costs && textRows(costs.row, op.row) <= maxPartTwo) partTwoFrom = costs.row;
      else costs = null;
      if (!title) flags.push("no statement title found above the table");
      if (rev.row > 12) flags.push("revenue is " + rev.row + " rows into the table; part one may be tall");
      candidates.push({
        tableIndex, title: title ? norm(title.textContent) : null, units,
        revenue: { row: rev.row, label: label(rows[rev.row]), printed: shown(rev.cell) },
        operating: { row: op.row, label: label(rows[op.row]), printed: shown(op.cell) },
        costs, partTwoFrom, leftOut: textRows(rev.row + 1, partTwoFrom), flags,
        // A titled statement wins over a summary table that repeats its figures; then fewer problems; then the earliest.
        score: (title ? 100 : 0) - flags.length * 10 - tableIndex / 1000,
      });
    }
  }
  if (!candidates.length) return { error: "no table has both the revenue and the operating profit figure" };
  candidates.sort((a, b) => b.score - a.score);
  const { score: _score, ...best } = candidates[0];
  if (candidates.length > 1 && candidates[1].score === candidates[0].score) best.flags.push("two tables matched equally");
  return best;
}

/** Hides every column but the labels and the latest year, measured before hiding anything. */
function keepLatestYear({ tableIndex, row, want }: { tableIndex: number; row: number; want: string }) {
  const norm = (t: string | null | undefined) => (t ?? "").replace(/\s+/g, " ").trim();
  const table = document.querySelectorAll("table")[tableIndex] as HTMLElement;
  const rows = [...table.querySelectorAll("tr")];
  const cells = [...rows[row].children];
  const target = cells.find((c) => norm(c.textContent).replace(/^\$\s*/, "") === want)!;
  const t = target.getBoundingClientRect();
  // Statements that list the oldest year first have earlier figures in this row before the kept one.
  // Only then are columns before it hidden: the span from the first earlier figure (or its dollar sign)
  // to the last. Everywhere else the cells before the figure are labels and spacing, and stay.
  const older = cells.slice(0, cells.indexOf(target)).filter((c) => /\d/.test(c.textContent ?? "") && !/[A-Za-z]{2}/.test(c.textContent ?? ""));
  let olderLeft = Infinity;
  let olderRight = -Infinity;
  for (const c of older) {
    const box = c.getBoundingClientRect();
    olderRight = Math.max(olderRight, box.right);
    const prev = c.previousElementSibling;
    const dollar = prev && norm(prev.textContent) === "$" ? prev.getBoundingClientRect().left : box.left;
    olderLeft = Math.min(olderLeft, dollar);
  }
  const doomed = [...table.querySelectorAll("td, th")].filter((cell) => {
    const box = cell.getBoundingClientRect();
    if (box.left >= t.right - 1) return true; // columns after the latest year
    if (!older.length || box.width === 0) return false;
    // Everything from the first earlier figure up to the kept figure, headings and spacers included,
    // except the kept figure's own dollar sign.
    const ownDollar = norm(cell.textContent) === "$" && box.left >= olderRight - 1;
    return box.left >= olderLeft - 1 && box.right <= t.left + 1 && !ownDollar;
  });
  for (const cell of doomed) (cell as HTMLElement).style.display = "none";
  // A figure never breaks across lines.
  for (const cell of table.querySelectorAll("td, th")) {
    const text = norm(cell.textContent);
    if (text && /\d/.test(text) && !/[A-Za-z]{2}/.test(text)) {
      for (const el of [cell, ...cell.querySelectorAll("*")]) (el as HTMLElement).style.whiteSpace = "nowrap";
    }
  }
  // Some filings set the page to a fixed width; let it and the table follow the narrower window.
  // Positioned page blocks (filings converted from print) would shrink to nothing at "auto", so they fill the window.
  for (let el: HTMLElement | null = table.parentElement; el && el !== document.body; el = el.parentElement) {
    if (el.style.width && !el.style.width.endsWith("%")) el.style.width = "100%";
    if (getComputedStyle(el).position === "absolute") el.style.left = "0";
    el.style.maxWidth = "100%";
  }
  table.style.width = "100%";
  return doomed.length;
}

/**
 * A table still wider than the window after narrowing has fixed cell widths (filings converted
 * from print). Its cells' fixed widths are cleared and nothing around it hides the overflow.
 * Tables that already fit are left exactly as the filing sets them.
 */
function fitWidth({ tableIndex, width }: { tableIndex: number; width: number }) {
  const table = document.querySelectorAll("table")[tableIndex] as HTMLElement;
  if (table.getBoundingClientRect().width <= width - 12) return false;
  for (const el of table.querySelectorAll("td, th, col")) {
    const style = (el as HTMLElement).style;
    if (style.width && !style.width.endsWith("%")) style.width = "";
    if (style.minWidth) style.minWidth = "";
  }
  for (let el: HTMLElement | null = table.parentElement; el && el !== document.body; el = el.parentElement) el.style.overflow = "visible";
  return true;
}

/** Highlights rows and returns the box from the title (or a row) to a row, in page coordinates. */
function boxFor({ tableIndex, fromTitle, fromRow, toRow, highlight, colour }: { tableIndex: number; fromTitle: string | null; fromRow: number; toRow: number; highlight: number[]; colour: string }) {
  const table = document.querySelectorAll("table")[tableIndex];
  const rows = [...table.querySelectorAll("tr")];
  for (const i of highlight) {
    (rows[i] as HTMLElement).style.background = colour;
    for (const cell of rows[i].children) (cell as HTMLElement).style.background = colour;
  }
  const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
  const t = table.getBoundingClientRect();
  let top: number;
  if (fromTitle) {
    const title = [...document.querySelectorAll("p, div, span, td")]
      .filter((el) => norm(el.textContent) === fromTitle && el.getBoundingClientRect().top < t.top && !table.contains(el))
      .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];
    // The company name line often sits just above the title; take what sits within two lines of it.
    top = (title ?? table).getBoundingClientRect().top + scrollY - 30;
  } else {
    top = rows[fromRow].getBoundingClientRect().top + scrollY + 1;
  }
  const next = rows[toRow + 1];
  const bottom = (next ? next.getBoundingClientRect().top : rows[toRow].getBoundingClientRect().bottom + 6) + scrollY;
  return { x: Math.max(0, t.left - 10), y: Math.max(0, top), width: t.width + 20, height: bottom - Math.max(0, top) };
}

async function capture(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  // Scroll to the area and capture what is on screen. A full-page capture of a very long filing
  // (Deckers' is about 102,000px) exceeds what the browser can draw and comes back blank.
  await page.setViewportSize({ width: LAYOUT_WIDTH, height: Math.max(1200, Math.ceil(clip.height) + 40) });
  const scrolled = await page.evaluate((y) => { window.scrollTo(0, Math.max(0, y - 20)); return window.scrollY; }, clip.y);
  const png = await page.screenshot({ clip: { ...clip, y: clip.y - scrolled } });
  const name = `${createHash("sha256").update(png).digest("hex").slice(0, 16)}.png`;
  writeFileSync(path.join(OUT_DIR, name), png);
  return { src: `/images/reports/${name}`, width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

/** "DUOLINGO, INC. AND SUBSIDIARIES CONSOLIDATED STATEMENTS OF OPERATIONS" -> "consolidated statements of operations". */
const statementName = (title: string) => {
  const from = title.search(/(consolidated |combined )?(statements? of|income statements?)/i);
  return title.slice(Math.max(0, from)).toLowerCase().replace(/\s+/g, " ").trim();
};

function sheetHtml(sections: string[], skipped: string[], trial: boolean): string {
  const joined = sections.join("\n");
  const body = trial ? joined.replaceAll('src="../public/images/reports/', 'src="./') : joined;
  return `<!doctype html><meta charset="utf-8"><title>Excerpts review</title><style>body{font:14px system-ui;margin:24px;background:#eee}section{display:inline-block;vertical-align:top;width:380px;margin:0 8px 16px 0;padding:10px;background:#fff}h2{font-size:13px;margin:0 0 6px}.flag{color:#b00;margin:0 0 6px}.gap{color:#666;margin:4px 0;font-size:12px;border-block:1px dashed #ccc}img{display:block}</style>${body}<h2>Skipped</h2><pre>${skipped.join("\n")}</pre>`;
}

test("captures every puzzle's report excerpt", async () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const before = new Set(readdirSync(OUT_DIR));
  const browser = await chromium.launch();
  const entries: string[] = [];
  const sheet: string[] = [];
  const skipped: string[] = [];
  const kept = new Set<string>();
  try {
    for (const puzzle of PUZZLES.filter((entry) => !TRIAL || ONLY.includes(entry.number))) {
      const url = archivePath(puzzle.answer.cik, puzzle.report.accession, puzzle.report.document);
      const file = path.join(CACHE, fixtureFileName(url));
      if (!existsSync(file)) { skipped.push(`#${puzzle.number} ${puzzle.answer.name}: report not cached`); continue; }
      const page = await browser.newPage({ javaScriptEnabled: false, deviceScaleFactor: 2, viewport: { width: 900, height: 1200 } });
      await page.route("**/*", (route) => (route.request().url().startsWith("file:") ? route.continue() : route.abort()));
      await page.goto(pathToFileURL(file).href);
      const found = await page.evaluate(locate, { revenue: puzzle.revenue.value, operating: puzzle.operatingProfit.value, maxPartTwo: MAX_PART_TWO_LINES });
      if ("error" in found) { skipped.push(`#${puzzle.number} ${puzzle.answer.name}: ${found.error}`); await page.close(); continue; }
      await page.evaluate(keepLatestYear, { tableIndex: found.tableIndex, row: found.revenue.row, want: found.revenue.printed });
      await page.setViewportSize({ width: LAYOUT_WIDTH, height: 1200 });
      await page.evaluate(fitWidth, { tableIndex: found.tableIndex, width: LAYOUT_WIDTH });
      // Never a clipped picture: both figures must sit inside the narrowed window, or the puzzle is skipped.
      const inside = await page.evaluate(({ tableIndex, rows, width }) => {
        const table = document.querySelectorAll("table")[tableIndex];
        const all = [...table.querySelectorAll("tr")];
        return rows.every(({ row, figure }) => {
          const cell = [...all[row].children].find((c) => (c.textContent ?? "").replace(/\s+/g, " ").trim().replace(/^\$\s*/, "") === figure);
          if (!cell) return false;
          // Measure the drawn text, not the cell: print-converted filings place text at fixed offsets outside its cell.
          const range = document.createRange();
          range.selectNodeContents(cell);
          const text = range.getBoundingClientRect();
          return text.width > 0 && text.right <= width + 2 && cell.getBoundingClientRect().right <= width + 2;
        });
      }, { tableIndex: found.tableIndex, width: LAYOUT_WIDTH, rows: [{ row: found.revenue.row, figure: found.revenue.printed }, { row: found.operating.row, figure: found.operating.printed }] });
      if (!inside) {
        skipped.push("#" + puzzle.number + " " + puzzle.answer.name + ": its report is laid out as fixed print pages, so the statement cannot be narrowed to a readable width");
        await page.close();
        continue;
      }
      const one = await page.evaluate(boxFor, { tableIndex: found.tableIndex, fromTitle: found.title, fromRow: 0, toRow: found.revenue.row, highlight: [found.revenue.row], colour: HIGHLIGHT });
      const partOne = await capture(page, one);
      const two = await page.evaluate(boxFor, { tableIndex: found.tableIndex, fromTitle: null, fromRow: found.partTwoFrom, toRow: found.operating.row, highlight: [found.operating.row], colour: HIGHLIGHT });
      const partTwo = await capture(page, two);
      await page.close();
      kept.add(path.basename(partOne.src)).add(path.basename(partTwo.src));
      const twoFrom = found.costs ? found.costs.label : found.operating.label;
      entries.push(`  ${puzzle.number}: ${JSON.stringify({
        ...(found.title ? { statement: statementName(found.title) } : {}),
        units: found.units,
        parts: [
          { ...partOne, from: found.title ? "the statement's title" : "the top of the table", to: found.revenue.label },
          { ...partTwo, from: twoFrom, to: found.operating.label },
        ],
        shows: [
          { label: found.revenue.label, printed: found.revenue.printed, clue: "revenue" },
          { label: found.operating.label, printed: found.operating.printed, clue: "margin" },
        ],
        ...(found.costs ? { costs: { label: found.costs.label, printed: found.costs.printed } } : {}),
        leftOut: found.leftOut,
      })},`);
      sheet.push(`<section><h2>#${puzzle.number} ${puzzle.answer.name} · ${found.units} · revenue ${found.revenue.printed} · operating ${found.operating.printed}${found.costs ? ` · costs ${found.costs.printed}` : ""} · left out ${found.leftOut}</h2>${found.flags.length ? `<p class="flag">${found.flags.join("; ")}</p>` : ""}<img src="../public${partOne.src}" style="width:${partOne.width / 2}px"><p class="gap">${found.leftOut} lines left out</p><img src="../public${partTwo.src}" style="width:${partTwo.width / 2}px"></section>`);
    }
  } finally {
    await browser.close();
  }
  if (TRIAL) {
    writeFileSync(SHEET, sheetHtml(sheet, skipped, true));
    console.log(`trial: ${entries.length} captured, ${skipped.length} skipped; sheet at ${SHEET}`);
    return;
  }
  // Pictures from an earlier run that no puzzle uses any more.
  for (const name of before) if (!kept.has(name) && name.endsWith(".png")) rmSync(path.join(OUT_DIR, name));
  writeFileSync(DATA, `/**
 * Each puzzle's report excerpt. Generated by scripts/daily-puzzle/excerpts.puzzle.ts
 * from the cached annual reports; do not edit by hand, run the script again.
 * lib/daily-puzzle/excerpts.test.ts rechecks every figure against the puzzles.
 */
import type { ReportExcerptRecord } from "@/lib/daily-puzzle/excerpts";

export const EXCERPTS: Record<number, ReportExcerptRecord> = {
${entries.join("\n")}
};

/** Puzzles with no excerpt, and why. */
export const SKIPPED: string[] = ${JSON.stringify(skipped, null, 2)};
`);
  writeFileSync(SHEET, sheetHtml(sheet, skipped, false));
  console.log(`excerpts: ${entries.length}, skipped: ${skipped.length}\n${skipped.join("\n")}`);
  expect(entries.length + skipped.length).toBe(PUZZLES.length);
});
