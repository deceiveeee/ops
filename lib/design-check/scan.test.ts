import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanSource } from "./scan";

/**
 * Files already rebuilt to the rules in
 * docs/design/anti-template-restructure-plan-2026-11-04.md. Every other file is
 * reported by the check but not yet held to it; each phase of the plan adds the
 * files it rebuilds here.
 */
const ENFORCED = [
  "components/marketing/HomePage.tsx",
  "components/marketing/HomeContents.tsx",
  "components/marketing/HomePuzzle.tsx",
  "components/marketing/homepage.module.css",
  "components/marketing/FedRateChart.tsx",
  "app/(learning)/courses/page.tsx",
  "app/(learning)/courses/[courseSlug]/page.tsx",
  "components/courses/courses.module.css",
  "components/courses/CompoundingTable.tsx",
  "components/courses/CourseModules.tsx",
  "components/courses/PortfolioBuilderPath.tsx",
  "components/marketing/HomeGreeting.tsx",
  "components/onboarding/StartGuide.tsx",
  "components/onboarding/start-guide.module.css",
  "components/courses/courses-list.module.css",
];

describe("design check: the scanner catches what it is for", () => {
  it("finds capitals set by a class, an inline style and CSS", () => {
    expect(scanSource("a.tsx", `<p className="text-[11px] uppercase tracking-[0.14em]">Lens</p>`).map((f) => f.rule)).toEqual(["capitals"]);
    expect(scanSource("a.tsx", `<p style={{ textTransform: "uppercase" }}>Lens</p>`).map((f) => f.rule)).toEqual(["capitals"]);
    expect(scanSource("a.module.css", `.label { text-transform: uppercase; }`).map((f) => f.rule)).toEqual(["capitals"]);
  });

  it("finds gradients in CSS, inline styles and SVG", () => {
    expect(scanSource("a.module.css", `.coin { background: linear-gradient(130deg, var(--a), var(--b)); }`).map((f) => f.rule)).toContain("gradient");
    expect(scanSource("a.tsx", `<div style={{ background: "radial-gradient(ellipse, var(--a), transparent)" }} />`).map((f) => f.rule)).toEqual(["gradient"]);
    expect(scanSource("a.tsx", `<linearGradient id="front" x1="0" x2="1">`).map((f) => f.rule)).toEqual(["gradient"]);
  });

  it("finds colours typed in instead of named", () => {
    expect(scanSource("a.module.css", `.home { background: #f8f8f4; }`).map((f) => f.rule)).toEqual(["raw-colour"]);
    expect(scanSource("a.module.css", `.card { box-shadow: 0 16px 50px rgba(0, 0, 0, .15); }`).map((f) => f.rule)).toEqual(["raw-colour"]);
    expect(scanSource("a.tsx", `<path fill="#282782" d="M0 0" />`).map((f) => f.rule)).toEqual(["raw-colour"]);
  });

  it("passes named colours, words that merely contain a pattern, and comments", () => {
    const clean = [
      `.home { color: var(--ops-text-primary); background: var(--ops-surface); }`,
      `/* The old homepage used linear-gradient(#a4a0ec, #6059b6) here. */`,
      `<a href="#explore-money">Read on</a>`,
      `const label = "Uppercase letters are not used";`,
      `// rgba( in a comment`,
    ];
    for (const line of clean) expect(scanSource(line.startsWith(".") || line.startsWith("/*") ? "a.module.css" : "a.tsx", line), line).toEqual([]);
  });

  it("honours an exception only when it names the rule and gives a reason", () => {
    const withReason = `/* design-check-allow: gradient - the fill encodes the bond's yield */\n.curve { fill: linear-gradient(var(--a), var(--b)); }`;
    const withoutReason = `/* design-check-allow: gradient */\n.curve { fill: linear-gradient(var(--a), var(--b)); }`;
    const wrongRule = `/* design-check-allow: capitals - not this one */\n.curve { fill: linear-gradient(var(--a), var(--b)); }`;
    expect(scanSource("a.module.css", withReason)).toEqual([]);
    expect(scanSource("a.module.css", withoutReason).map((f) => f.rule)).toEqual(["gradient"]);
    expect(scanSource("a.module.css", wrongRule).map((f) => f.rule)).toEqual(["gradient"]);
  });

  it("reports the line a finding is on", () => {
    const [finding] = scanSource("a.module.css", `.a { color: var(--x); }\n\n.b { color: #fff; }`);
    expect(finding).toMatchObject({ rule: "raw-colour", line: 3, text: ".b { color: #fff; }" });
  });
});

describe("design check: rebuilt files follow the rules", () => {
  for (const file of ENFORCED) {
    it(file, () => {
      const findings = scanSource(file, readFileSync(path.resolve(__dirname, "../..", file), "utf8"));
      expect(findings, findings.map((f) => `${file}:${f.line} ${f.rule}: ${f.text}`).join("\n")).toEqual([]);
    });
  }
});

/**
 * Phase 3 took capitals off every label in lessons and pages. This holds the
 * whole product to that one rule. Studio comes over in phase 4; the old homepage
 * and course components below are no longer rendered and await the phase 5
 * decision on deleting them.
 */
const CAPITALS_NOT_YET = [
  /^components\/studio\//,
  /^components\/marketing\/(?!(HomePage|HomeContents|HomePuzzle|FedRateChart|LossRecoveryVisual|CompanyResultsChart)\.tsx$)/,
  /^components\/courses\/(CourseCard|CourseRail|ModuleSection|LessonRow)\.tsx$/,
];

describe("design check: no capital-letter labels anywhere rendered", () => {
  const root = path.resolve(__dirname, "../..");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx|css)$/.test(name) && !/\.test\.tsx$/.test(name)) files.push(path.relative(root, full).replace(/\\/g, "/"));
    }
  };
  walk(path.join(root, "app"));
  walk(path.join(root, "components"));

  it("finds files to check", () => expect(files.length).toBeGreaterThan(300));

  it("has no capitals set by style outside the areas still to come", () => {
    const findings = files
      .filter((file) => !CAPITALS_NOT_YET.some((pattern) => pattern.test(file)))
      .flatMap((file) =>
        scanSource(file, readFileSync(path.join(root, file), "utf8"))
          .filter((finding) => finding.rule === "capitals")
          .map((finding) => `${file}:${finding.line} ${finding.text}`),
      );
    expect(findings, findings.join("\n")).toEqual([]);
  });
});
