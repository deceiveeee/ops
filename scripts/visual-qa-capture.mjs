// Minimal Playwright capture helper used by the competitive visual audit.
// Usage: node scripts/visual-qa-capture.mjs <url> <outPath> <width> <height> <label>
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [,, url, outPath, wStr, hStr, label] = process.argv;
if (!url || !outPath || !wStr || !hStr) {
  console.error('usage: node visual-qa-capture.mjs <url> <outPath> <width> <height> [label]');
  process.exit(2);
}
const width = parseInt(wStr, 10);
const height = parseInt(hStr, 10);
const outDir = dirname(outPath);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const isLocal = /localhost|127\.0\.0\.1/.test(url);
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  await page.goto(url, { waitUntil: isLocal ? 'networkidle' : 'domcontentloaded', timeout: 60000 });

  // Wait for fonts and any animation/asset settle.
  try {
    await page.evaluate(() => (document.fonts && document.fonts.ready) || Promise.resolve());
  } catch {}
  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  } catch {}
  // Give react hydration / framer-motion / katex extra time.
  await page.waitForTimeout(isLocal ? 2500 : 1500);

  await page.screenshot({ path: outPath, fullPage: true, type: 'png' });
  const stats = (await import('node:fs')).statSync(outPath);
  console.log(JSON.stringify({ ok: true, url, outPath, width, height, label, bytes: stats.size }));
} catch (e) {
  console.log(JSON.stringify({ ok: false, url, outPath, error: String(e && e.message || e) }));
  process.exitCode = 1;
} finally {
  await browser.close();
}
