import { test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

/**
 * Render a cached source deck to page images an agent can actually look at.
 *
 * Gate A requires a *visual* review of every complete deck, not a reading of the
 * extracted text: slide charts and tables are exactly what layout extraction
 * mangles, and the extracted text is also where caption/ASR defects hide.
 *
 * This machine has neither poppler (`pdftoppm`) nor a working Python, so the
 * repo's own extract script cannot render pages either. Chrome's PDF engine
 * can, with two caveats encoded below.
 *
 * Not part of the normal suite — it skips unless PDF_SESSION is set.
 *
 *   PDF_SESSION=30 PDF_PAGES=6 npx playwright test e2e/render-deck.spec.ts --workers=1
 *
 * Writes .agent-shots/deck<N>/pNN.png (gitignored). Never commit the source
 * PDFs or their renders — they are copyrighted working artifacts.
 */

const SESSION = process.env.PDF_SESSION;
const PAGES = Number(process.env.PDF_PAGES ?? 6);
const KIND = process.env.PDF_KIND ?? "session";

test.skip(!SESSION, "set PDF_SESSION to render a deck");

// Old headless Chromium ships no PDF viewer: page.goto on a .pdf resolves as
// "Download is starting" and nothing renders. The "chromium" channel runs
// Chrome's new headless, which draws the document with PDFium.
test.use({ channel: "chromium" });

test("render deck pages", async ({ page }) => {
  test.setTimeout(600_000);
  const out = `.agent-shots/deck${SESSION}`;
  mkdirSync(out, { recursive: true });
  await page.setViewportSize({ width: 1400, height: 1000 });

  const url = pathToFileURL(
    resolve(`.source-cache/pdf/${KIND}${SESSION}.pdf`),
  ).href;

  for (let p = 1; p <= PAGES; p++) {
    // The viewer treats a fragment-only change as an in-page jump rather than a
    // navigation, so every page comes back as page 1. Reset the document first.
    await page.goto("about:blank");
    await page.goto(`${url}#page=${p}&view=Fit`);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${out}/p${String(p).padStart(2, "0")}.png` });
  }

  console.log(`rendered ${PAGES} pages of ${KIND} ${SESSION} to ${out}`);
});
