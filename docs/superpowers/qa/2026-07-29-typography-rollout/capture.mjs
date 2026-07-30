import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:3001";
const OUT = fileURLToPath(new URL("./captures/", import.meta.url));

const PAGES = [
  { key: "home", path: "/" },
  { key: "fi", path: "/lessons/fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds" },
  { key: "equities", path: "/lessons/equity-gordon-growth-model" },
  { key: "portfolio", path: "/lessons/portfolio-risk-covariance-correlation" },
  { key: "capbudget", path: "/lessons/irr-and-payback" },
  { key: "em", path: "/lessons/active-vs-passive-investing" },
];

const VIEWPORTS = [
  { suffix: "desktop", width: 1440, height: 900 },
  { suffix: "mobile", width: 390, height: 844 },
];

async function settle(page) {
  // Scroll through the page so scroll-reveal (whileInView) content mounts.
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        y += window.innerHeight * 0.85;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) {
          setTimeout(step, 90);
        } else {
          window.scrollTo(0, 0);
          resolve();
        }
      };
      step();
    });
  });
  await page.waitForTimeout(800);
}

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  for (const p of PAGES) {
    const page = await context.newPage();
    const url = BASE + p.path;
    process.stdout.write(`[${vp.suffix}] ${p.key} ... `);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await settle(page);
      const file = `${OUT}/${p.key}-${vp.suffix}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log("ok");
    } catch (e) {
      console.log("FAIL " + e.message.split("\n")[0]);
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
console.log("done");
