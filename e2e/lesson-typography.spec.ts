import { test, expect, type Page } from "@playwright/test";

/**
 * Visual-hierarchy gate for the learning pages.
 *
 * Why this exists: mission 8 shipped with a section heading rendered at 10px
 * above 15px body copy — the title was smaller than its own content — and every
 * behavioural check passed, because reading DOM text cannot see typography. This
 * spec measures COMPUTED styles so that class of defect fails automatically
 * instead of waiting to be spotted.
 *
 * It walks every stage of every lesson. Later stages of a gated journey do not
 * mount until the current one is answered, so the spec solves each stage before
 * moving on (see `solveStage`) and audits the scene twice: on arrival, and again
 * once answered, when feedback and result panels are on screen. A stage the
 * walker cannot solve fails the test — silently auditing only what happens to be
 * reachable is how the entry stage became the only verified part of the product.
 */

const IF_LESSON_ROUTES = [
  "if-1-1-how-an-investor-builds-a-philosophy",
  "if-1-2-where-philosophy-enters-the-investment-process",
  "if-1-3-comparing-investment-philosophy-families",
  "if-1-4-when-a-philosophy-fits-the-investor",
  "if-2-1-reading-a-bonds-promise",
  "if-2-2-why-market-rates-change-bond-prices",
  "if-2-3-duration-measuring-interest-rate-sensitivity",
  "if-2-4-default-risk-can-the-issuer-deliver",
  "if-2-5-from-credit-rating-to-bond-price",
  "if-3-1-what-risk-means-for-a-shareholder",
  "if-3-2-why-diversification-changes-the-question",
  "if-3-3-what-beta-measures",
  "if-3-4-what-makes-beta-rise-or-fall",
  "if-3-5-choosing-a-risk-measure",
  "if-3-6-build-an-equity-risk-policy",
  "if-pb-05-set-allocation-and-risk-limits",
  "if-4-1-the-three-financial-statements",
  "if-4-2-read-the-balance-sheet",
  "if-4-3-recast-the-business",
  "if-4-4-read-profit-and-leverage",
  "if-4-5-repair-the-investor-view",
  "if-4-6-trace-cash-to-the-investor",
  "if-5-1-estimate-a-valuation-range",
  "if-6-1-count-the-friction",
  "if-7-1-test-the-claim",
  "if-8-1-choose-passive-or-prove-an-edge",
  "if-pb-11-set-a-market-timing-policy",
  "if-pb-12-choose-the-actual-holdings",
  "if-pb-13-write-the-rules-and-defend-the-portfolio",
];

/**
 * Reviewed captions that are deliberately small.
 *
 * Structure cannot distinguish a speaker label from a section heading — both are
 * a small caption above larger prose — so each exception is listed and reasoned
 * about here. That is the point: a NEW caption-over-content pattern fails until
 * someone looks at it and decides.
 *
 * Do not add an entry to silence a failure. Add it only after confirming the
 * caption labels a single value or names a speaker, rather than titling a group.
 */
const REVIEWED_LABELS = {
  /** Matched as regular expressions. */
  patterns: [
    // The guide persona: an attribution above the guide's message. Small on
    // purpose — the message is the content, the name is the tag.
    "^OPS .*guide$",
    // DefinitionCard / DefinitionStrip term labels, one definition each.
    "^Definition( ·|$)",
    "^Direct definition$",
    // Dated source callouts, one example each.
    "^Historical source example",
  ],
  /**
   * Description-list labels: each names exactly one adjacent value, which is
   * meant to dominate. Their 10px size is the open design question on the shared
   * definition and research-row components — tracked, not silently accepted.
   */
  exact: [
    "Issuer",
    "Risk-free rate",
    "Investor question",
    "Evidence it watches",
    "Why it expects a price move",
    "Must survive",
    "Proposed cause",
    "Expected closing condition",
    "Your decision",
    "Model status",
    "How to read the example",
    "Source-era problem",
    "Current-standard reconciliation",
  ],
};

/**
 * WCAG AA, enforced — not reported.
 *
 * It used to be a warning, on the grounds that the design sat at 4.15–4.42:1.
 * Those two numbers turned out to be one token and one missing light-theme
 * variant, both fixed, so the standard is now the gate. Large text gets AA's
 * lower bar, which is the standard's own rule, not a concession.
 */
const CONTRAST_AA_NORMAL = 4.5;
const CONTRAST_AA_LARGE = 3;

/**
 * Nobody should have to magnify anything to read it. 12px is the floor for any
 * text, including labels and navigation. Enforced on every route: the whole
 * Investment Foundations set was raised to this scale in one pass, so there is
 * no longer a reason to exempt anything.
 */
const MIN_FONT_PX = 12;

/** Every journey shell mounts one of these; the page has one at most. */
const JOURNEY_SELECTOR = "#lesson-journey, #statement-investigation";

/**
 * The two stages no search can answer, written out as the clicks a learner
 * would make. Keyed by `slug#stageIndex`, matched on visible text, run in order.
 *
 * Both are mastery checks. One asks five questions in a row inside a single
 * stage, each replacing the last; the other includes a "select every correct
 * answer" question, where the answer is a SET and trying combinations one
 * choice at a time can never express it. Everything else in the course is
 * answered by search — this list should stay short, and a miss is reported in
 * the failure trace rather than passing quietly.
 */
const ANSWER_KEYS: Record<string, string[]> = {
  "if-pb-05-set-allocation-and-risk-limits#0": [
    "Continue to Goal",
    "Continue to Runway",
    "Continue to Loss",
    "Continue to Access",
    "Continue to Change",
    "choose:Capacity and liquidity changed; willingness may be unchanged",
    "choose:Record the $12,000 as near-term cash",
    "Save readiness route",
  ],
  "if-pb-05-set-allocation-and-risk-limits#1": [
    "choose:Their weights, each asset's volatility",
    "choose:Reduce some asset-specific risk",
    "choose:An estimate-based opportunity set",
    "choose:As estimates that depend on inputs",
    "Check the four relationships",
  ],
  "if-pb-05-set-allocation-and-risk-limits#2": [
    "Reveal next contribution",
    "Reveal next contribution",
    "Reveal next contribution",
    "Reveal next contribution",
    "Use the model",
  ],
  "if-pb-05-set-allocation-and-risk-limits#3": [
    "type-label:Ready weight=15",
    "type-label:Steady weight=30",
    "type-label:Grow weight=55",
    "Lock the weight repair",
    "type-label:Ready weight=30",
    "type-label:Steady weight=30",
    "type-label:Grow weight=40",
    "Lock the liquidity repair",
    "type-label:Ready weight=20",
    "type-label:Steady weight=35",
    "type-label:Grow weight=45",
    "Lock the stress repair",
  ],
  "if-pb-05-set-allocation-and-risk-limits#4": [
    "choose:I understand that the weights and budget",
    "Lock this draft for transfer",
  ],
  "if-pb-05-set-allocation-and-risk-limits#5": [
    "type-label:Ready weight=25",
    "type-label:Steady weight=35",
    "type-label:Grow weight=40",
    "Lock the independent repair",
    "choose:Capacity and liquidity changed; willingness may be unchanged",
    "choose:Allocation and every dependent architecture",
    "Check the unfamiliar case",
  ],
  "if-pb-05-set-allocation-and-risk-limits#6": [
    "choose:A · 15% Ready / 35% Steady / 50% Grow",
    "type:candidate-ceiling-answer=3",
    "choose:A learner/OPS policy from a hypothetical loss",
    "Save Allocation and Risk Policy",
  ],
  "if-4-6-trace-cash-to-the-investor#3": [
    "Accounts receivable and inventory",
    "Next source concept",
    "Neither statement is always true",
    "Next source concept",
    "Net income ÷ shareholders' equity",
    "Next source concept",
    "Substantial interest expense and a high effective tax rate",
    "Next source concept",
    "An increase in accounts payable",
    "Complete mastery file",
    "Save Investor Statement Brief",
  ],
  // Stage 4 asks for the spread between the extreme PE portfolios as a number:
  // 2.61% − (−1.95%). Typed, not chosen.
  "if-7-1-test-the-claim#3": ["type:pe-spread=4.56", "Check the spread"],
  /**
   * Mission 10's final stage needs a review date, and `fillFields` only fills
   * text fields — a date input left empty keeps the save button disabled. The
   * prose fields on this stage are filled generically, so this is the mission's
   * one keyed stage, within the budget of one.
   */
  "if-8-1-choose-passive-or-prove-an-edge#5": [
    "Passive core only — I have not proved an edge, and that is my answer",
    "type:passive-review=2027-08-14",
    "Save the architecture decision",
  ],
  /**
   * Mission 11's policy stage cannot be completed by `fillFields` alone: the
   * bounded branch needs a number and two date inputs, which it does not fill.
   * The no-timing branch needs only a typed reason, which it does — so the one
   * keyed step is the mode itself. No timing is a complete outcome of this
   * mission, not a shortcut around it.
   */
  /**
   * Mission 13's transfer case is an assessment: it passes only when all four
   * planted defects are found and the decoy is left alone, so no arbitrary set
   * of choices satisfies it. This is the mission's one keyed stage.
   */
  "if-pb-13-write-the-rules-and-defend-the-portfolio#10": [
    "Problem — The sleeve weights total 104%",
    "Problem — Next year's tuition sits in the growth sleeve",
    "Problem — The plan names a ticker but no share class",
    "Problem — The overlap figure carries no as-of date",
    "Not a problem — One fund charges 0.03% rather than 0.02%",
    "Save the Operating Plan",
  ],
  "if-pb-11-set-a-market-timing-policy#3": [
    "No timing",
    "type:timing-reason=My horizon is long and no signal has passed my evidence test.",
    "Lock this policy draft",
  ],
  "if-5-1-estimate-a-valuation-range#6": [
    "FCFF with the cost of capital",
    "Cash flow from existing assets",
    "Expected growth",
    "Reinvestment needed for growth",
    "Risk in the cash flows",
    "When return on capital exceeds cost of capital",
    "Not enough",
    "Yes",
    "Check answers",
  ],
};

type Finding = {
  kind: "hierarchy" | "contrast" | "size" | "overflow";
  detail: string;
};

async function auditRenderedText(
  page: Page,
  reviewed: { patterns: string[]; exact: string[] },
  normal: number,
  large: number,
  minFont: number,
  enforceMinFont: boolean,
) {
  return page.evaluate(
    ({ reviewed, normal, large, minFont, enforceMinFont }) => {
      const exact = new Set(reviewed.exact);
      // Case-insensitive: "OPS Guide" and "OPS filing guide" are the same label.
      const patterns = reviewed.patterns.map((p) => new RegExp(p, "i"));
      const isReviewed = (t: string) =>
        exact.has(t) || patterns.some((re) => re.test(t));
      const findings: { kind: string; detail: string }[] = [];
      const warnings: string[] = [];

      const luminance = (r: number, g: number, b: number) => {
        const f = (c: number) => {
          const v = c / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const parse = (s: string) => (s.match(/\d+(\.\d+)?/g) ?? []).map(Number);
      const effectiveBg = (el: Element): number[] => {
        let node: Element | null = el;
        while (node && node !== document.documentElement) {
          const p = parse(getComputedStyle(node).backgroundColor);
          if (p.length >= 3 && (p[3] === undefined || p[3] > 0.5)) return p;
          node = node.parentElement;
        }
        return [255, 255, 255];
      };
      const ratio = (fg: number[], bg: number[]) => {
        const a = luminance(fg[0], fg[1], fg[2]);
        const b = luminance(bg[0], bg[1], bg[2]);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };

      // `main` rather than the journey element: the lesson hero, the source
      // panel and the progress rail are lesson copy too, and scoping to the
      // journey was hiding all of them from every check below.
      const scope = document.querySelector("main");
      if (!scope) return { findings: [{ kind: "hierarchy", detail: "no <main> found" }], warnings };

      // 1. A caption/eyebrow acting as a heading.
      //
      //    Two legitimate uses must NOT be flagged:
      //      - eyebrow: a larger short title follows it ("Stage 1 of 7" above an h2)
      //      - label in a pair: it names exactly one adjacent value, however long
      //        ("Definition · accrual accounting" above its definition). This is an
      //        ordinary description-list shape and the value is meant to dominate.
      //
      //    It IS a bug when the caption heads a GROUP — two or more sibling blocks,
      //    or a list/grid of two or more items — because that is a section heading
      //    rendered at label size. That is the mission 8 defect.
      for (const cap of scope.querySelectorAll(".ops-caption, .ops-eyebrow")) {
        const capPx = parseFloat(getComputedStyle(cap).fontSize);
        const parent = cap.parentElement;
        if (!parent) continue;
        const others = [...parent.querySelectorAll("*")].filter(
          (e) =>
            e !== cap &&
            !cap.contains(e) &&
            !e.contains(cap) &&
            (e.textContent ?? "").trim().length > 0,
        );
        const prose = others.filter((e) => (e.textContent ?? "").trim().length > 60);
        if (!prose.length) continue;
        const maxProse = Math.max(
          ...prose.map((e) => parseFloat(getComputedStyle(e).fontSize)),
        );
        if (maxProse <= capPx) continue;

        // A caption is a legitimate EYEBROW only when a structural heading follows
        // it — an h1–h6 or an explicit heading class. The earlier version of this
        // check accepted "any short element larger than the caption", and a
        // 58-character body row satisfied that, which silently disabled the whole
        // check and let the original mission 8 defect pass again. Structure, not
        // length.
        const hasStructuralHeading = others.some(
          (e) =>
            /^H[1-6]$/.test(e.tagName) ||
            e.classList.contains("ops-section-title") ||
            e.classList.contains("ops-interactive-title") ||
            e.classList.contains("ops-display"),
        );
        if (hasStructuralHeading) continue;

        // Does the caption head a GROUP, or name one thing? This is the whole
        // distinction the check turns on, and it is structural — the blocks a
        // caption sits above are its own siblings.
        //
        //   group  → repeated, parallel blocks (same tag and same classes, the
        //            shape an array renders), or one sibling holding two or
        //            more such blocks: a list, a grid of cards. A caption above
        //            that is a section heading at label size — the mission 8
        //            defect.
        //   not a group → a label and the thing it names, however many
        //            supporting parts follow. "Maturity" above a value, its
        //            definition and a progress counter is a term card, and the
        //            value is meant to dominate; so is "Your mission" above its
        //            one sentence.
        const parallel = (a: Element, b: Element) =>
          a.tagName === b.tagName && a.className === b.className;
        const textBlocks = (el: Element) =>
          [...el.children].filter((k) => (k.textContent ?? "").trim().length > 0);
        const anyParallelPair = (list: Element[]) =>
          list.some((a, i) => list.some((b, j) => i !== j && parallel(a, b)));
        const isCluster = (el: Element) => {
          if (/^(P|H[1-6]|SPAN|A|LI|STRONG|EM|TIME|LABEL)$/.test(el.tagName)) return false;
          // Two or more blocks that repeat the same shape. Comparing every child
          // against the first matched the first against ITSELF, which made every
          // container with two children look like a group and flagged the label
          // above every question card in the course.
          return anyParallelPair(textBlocks(el));
        };
        const blocksBelow = textBlocks(parent).filter((e) => e !== cap);
        // What sits DIRECTLY under the caption decides this. If that is a list
        // or grid of parallel blocks, the caption is the only title those blocks
        // have, at label size — the mission 8 defect. If it is a single block —
        // a value, a question, a sentence — then that block is the title or the
        // named value, and it is bigger than the caption, which is the ordinary
        // eyebrow shape. Judging on "any sibling anywhere is a group" flagged
        // every term card that happened to carry a metric row underneath.
        const first = blocksBelow[0];
        const clustered = Boolean(first && isCluster(first));
        const repeated = anyParallelPair(blocksBelow);
        if (!clustered && !repeated) continue;
        const shape = clustered
          ? `a ${first.tagName.toLowerCase()} of ${textBlocks(first).length} parallel blocks`
          : "repeated sibling blocks";

        const text = (cap.textContent ?? "").trim();
        if (isReviewed(text)) continue;
        findings.push({
          kind: "hierarchy",
          detail: `"${text.slice(0, 60)}" renders at ${capPx}px above ${shape} of up to ${maxProse}px, with no structural heading present — a caption doing a heading's job`,
        });
      }

      // 2. Contrast.
      for (const el of scope.querySelectorAll("*")) {
        if (el.children.length) continue;
        const text = (el.textContent ?? "").trim();
        // Any length, but must contain a letter or digit. A 3-character minimum
        // let the hero numerals ("10", "38") escape the check entirely; bare
        // symbols like arrows and separators are decorative and skipped.
        if (!/[a-z0-9]/i.test(text)) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        if (parseFloat(cs.opacity) < 0.15) continue;
        // Off-screen scenes stay mounted in some journeys; only judge what is
        // actually painted.
        if (!(el as HTMLElement).getClientRects().length) continue;
        // 3. Absolute size floor. Labels and navigation count as text.
        const px = parseFloat(cs.fontSize);
        if (px < minFont) {
          const note = `"${text.slice(0, 34)}" renders at ${px}px, below the ${minFont}px readability floor`;
          if (enforceMinFont) findings.push({ kind: "size", detail: note });
          else warnings.push(`${px}px "${text.slice(0, 28)}"`);
        }

        // AA's own definition of large text: 24px, or 18.66px when bold.
        const weight = Number(cs.fontWeight) || 400;
        const required = px >= 24 || (px >= 18.66 && weight >= 700) ? large : normal;
        const bg = effectiveBg(el);
        const r = ratio(parse(cs.color), bg);
        if (r < required) {
          findings.push({
            kind: "contrast",
            detail: `"${text.slice(0, 40)}" at ${r.toFixed(2)}:1 — ${cs.color} on rgb(${bg.slice(0, 3).join(",")}), under the ${required}:1 AA requirement for ${px}px text`,
          });
        }
      }

      return { findings, warnings };
    },
    { reviewed, normal, large, minFont, enforceMinFont },
  );
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    return { client: d.clientWidth, scroll: d.scrollWidth };
  });
}

/**
 * How many stages this lesson has, and which one is on screen.
 *
 * Every shell prints the position in its own vocabulary — "Stage 3 of 7",
 * "Step 3 of 6", "Mission 3 of 7", "Evidence file 3 of 6" — so one regex covers
 * all of them. A page with no journey reports a single stage.
 */
async function stagePosition(page: Page) {
  return page.evaluate((selector) => {
    const journey = document.querySelector(selector);
    if (!journey) return { index: 0, total: 1, label: "page" };
    // Read the element that prints the position, not the journey's whole text:
    // concatenating it ran "Evidence file 1 of 4" into the "0/4 verified"
    // counter beside it and yielded a 40-stage lesson, which walked four files
    // and then looked for a fifth.
    for (const el of journey.querySelectorAll("*")) {
      if (el.children.length) continue;
      const m = (el.textContent ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .match(/^(Stage|Step|Mission|Evidence file) (\d+) of (\d+)\b/i);
      if (m) {
        return {
          index: Number(m[2]) - 1,
          total: Number(m[3]),
          label: `${m[1]} ${m[2]} of ${m[3]}`,
        };
      }
    }
    return { index: 0, total: 1, label: "journey" };
  }, JOURNEY_SELECTOR);
}

/**
 * Answer the current stage so the next one will mount.
 *
 * There is no per-lesson answer key. Every gated stage in this course is built
 * from the same parts — option buttons, a commit button, occasionally a written
 * answer — and completion is observable from the shell itself, so the walker
 * sweeps the stage's own controls and stops the instant the stage reports
 * complete. Wrong answers are not a problem: nothing here locks out after a
 * miss, and the incorrect-feedback panels a sweep opens are lesson copy that the
 * audit should be reading anyway.
 *
 * It returns its click trace, because a stage it cannot solve fails the test and
 * the trace is what makes that failure diagnosable.
 */
async function solveStage(page: Page, key: string[] = []) {
  return page.evaluate(
    async ({ selector, budget, key }) => {
      /**
       * Looked up on every use, never captured. Switching a lesson's case
       * ("Build mine" / "Practice case") remounts the journey, and a captured
       * reference then points at a DETACHED tree: every later click lands on an
       * element no longer in the document, so the walker reported eight
       * successful interactions and zero progress.
       */
      const findJourney = () => document.querySelector(selector);
      if (!findJourney()) return { completed: true, clicks: 0, trace: ["no journey on this page"] };

      // Two frames plus a margin. At 8ms the walker read the DOM before React
      // had committed under load, and which lessons failed changed from run to
      // run — a gate that accuses a different lesson each time gets ignored.
      const settle = () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setTimeout(() => resolve(), 40)),
          ),
        );
      const label = (el: Element) =>
        (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim();
      const buttons = () => [...(findJourney()?.querySelectorAll("button") ?? [])];

      /**
       * Complete, as the shell itself reports it:
       *   - the last stage renders "Complete this … to finish" while unanswered,
       *     and replaces it with a link once answered;
       *   - every other stage renders an advance button ending in an arrow,
       *     disabled until the stage is answered.
       */
      /**
       * The shell's own footer row — previous, the instruction line, advance —
       * is the last child of the journey frame in every shell. Identifying the
       * advance button as "the last button ending in an arrow" instead put the
       * SCENE's own "Next finding →" out of the walker's reach on any stage
       * where the footer had no arrow, which is every lesson's final stage.
       */
      const frame = () => findJourney()?.querySelector(".ops-interactive-frame") ?? findJourney();
      const footer = () => frame()?.lastElementChild ?? null;
      const inFooter = (el: Element) => Boolean(footer()?.contains(el));
      const advanceControl = () => {
        const arrows = buttons().filter((b) => inFooter(b) && /→$/.test(label(b)));
        return arrows[arrows.length - 1] ?? null;
      };

      /**
       * Completion, read from the counter every shell prints for the learner —
       * "3 of 7 stages complete", "2/4 verified", "1 of 6 decisions complete".
       * Stages unlock in order, so being on stage k with k+1 counted means this
       * stage is answered.
       *
       * Reading the advance button instead looked simpler and was wrong: the
       * last stage has no advance button at all, so "no button" was taken for
       * "finished" and the final stage of every investigation was recorded as
       * solved without anything being clicked.
       */
      const counter = () => {
        for (const el of findJourney()?.querySelectorAll("*") ?? []) {
          if (el.children.length) continue;
          const m = label(el).match(
            /^(\d+)\s*(?:of|\/)\s*(\d+)\s*(?:stages?|steps?|missions?|decisions?|files?)?\s*(?:complete|verified)$/i,
          );
          if (m) return Number(m[1]);
        }
        return null;
      };
      const stageIndex = () => {
        for (const el of findJourney()?.querySelectorAll("*") ?? []) {
          if (el.children.length) continue;
          const m = label(el).match(/^(?:Stage|Step|Mission|Evidence file) (\d+) of (\d+)\b/i);
          if (m) return Number(m[1]) - 1;
        }
        return 0;
      };
      /**
       * The stage this call set out to solve, fixed at entry.
       *
       * Re-reading the position each time looked equivalent and was not: a
       * lesson may advance ITSELF once its stage is saved. Mission 5 does, and
       * the walker then compared a counter of 1 against the stage it had already
       * been moved to, concluded `1 >= 2` was false, and declared a stage it had
       * just completed unanswerable.
       */
      const startIndex = stageIndex();
      const complete = () => {
        const done = counter();
        if (done !== null) return done >= startIndex + 1;
        // No counter (a page with no journey shell): fall back to the button.
        const advance = advanceControl();
        return advance ? !advance.disabled : true;
      };

      const trace: string[] = [];
      let clicks = 0;
      if (complete()) return { completed: true, clicks, trace: ["already complete on arrival"] };

      // Controls that belong to the stage, not to the shell: no rail navigation,
      // no advance/previous, and nothing that would throw the answer away. The
      // advance control is excluded by identity, not by its arrow: scenes have
      // their own arrow buttons ("Use this lens on Maya and Daniel →") and
      // excluding those by text left some stages with no controls at all.
      const controls = () => {
        return buttons().filter((b) => {
          const t = label(b);
          return (
            !inFooter(b) &&
            !b.disabled &&
            !b.closest("nav, [role='navigation']") &&
            !/^←/.test(t) &&
            // Retrying is how several stages recover from a wrong answer — the
            // choices disable themselves and "Try this concept again" is the
            // only control left, so excluding it stranded the walker. Only
            // controls that throw the whole stage away stay out.
            !/^(reset|clear|start over|restart|back)\b/i.test(t) &&
            // Size, not merely presence. A responsive layout can mount the same
            // control twice and collapse one copy to 0×0; `getClientRects()`
            // still returns a rect for it, so the walker was clicking phantom
            // buttons that looked right and did nothing.
            b.getBoundingClientRect().width > 0 &&
            b.getBoundingClientRect().height > 0
          );
        });
      };

      /** Selecting is idempotent; toggling is not. Leave anything already on. */
      const press = (el: HTMLButtonElement) => {
        const state = el.getAttribute("aria-pressed") ?? el.getAttribute("aria-checked");
        if (state === "true") return false;
        el.click();
        return true;
      };

      /**
       * A written answer, where the stage asks for one. React ignores a plain
       * value assignment, so go through the prototype setter it listens to.
       *
       * Called on every round rather than once: the brief-writing fields on the
       * last stage of the cash-flow investigation only mount after the mastery
       * questions are passed, so filling once at the start filled nothing.
       */
      const fillFields = () => {
        let filled = 0;
        for (const field of findJourney()?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          "textarea, input[type='text'], input:not([type])",
        ) ?? []) {
          if (field.value.trim() || field.disabled) continue;
          const proto =
            field instanceof HTMLTextAreaElement
              ? HTMLTextAreaElement.prototype
              : HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
          // Long enough to clear the minimum-length gates the briefs impose.
          setter?.call(field, "Readability walk-through answer for this gate.");
          field.dispatchEvent(new Event("input", { bubbles: true }));
          trace.push(`typed into ${field.getAttribute("id") ?? field.tagName.toLowerCase()}`);
          filled++;
        }
        return filled;
      };
      if (fillFields()) {
        await settle();
        if (complete()) return { completed: true, clicks, trace };
      }

      /**
       * Sweep: hold one control, then try every control after it, checking after
       * each click. In DOM order that is "pick an option, then press the button
       * below it", which is the shape of nearly every stage; the outer loop
       * retries with the next option when the first one was wrong.
       *
       * The held control is re-asserted before each probe, because probing the
       * options between it and the commit button replaces the selection — an
       * earlier version always arrived at "Check" holding the LAST option, and
       * so could never answer a question whose last option was wrong.
       *
       * Rounds, not one pass: a stage that reveals its controls one at a time
       * ("Add stage 2", then "Add stage 3"…) only exposes the next one after the
       * last is used, and written answers only appear once the questions above
       * them are passed.
       */
      const sweep = async () => {
        // A stage that disables its choices after a wrong answer leaves only
        // "Try this concept again", and pressing it puts the scene back exactly
        // where it was. Left alone the sweep will do that until the budget is
        // gone, so bail out on a state it has already been in twice and let the
        // next pass attack it with the search instead.
        /**
         * A wrong answer in some stages disables the choices and leaves only
         * "Try this concept again", which puts the scene back exactly where it
         * was — the sweep will press it until the budget is gone. Cap how often
         * the sweep may press any one label and it moves on instead.
         *
         * Scoped to the sweep: the search presses the same option once per
         * combination by design, and capping there would break it.
         */
        const pressed = new Map<string, number>();
        const fresh = () =>
          controls().filter((b) => (pressed.get(label(b)) ?? 0) < 3);
        /**
         * Only presses that change nothing count against the cap. "Reveal next
         * line" is meant to be pressed once per line and moves the scene on
         * every time; "Try this concept again" returns it to where it was. A
         * flat click count could not tell those apart and stopped the walker
         * four lines into a five-line reveal.
         */
        const sceneState = () =>
          `${counter()}|${(findJourney()?.textContent ?? "").length}|${controls().length}`;
        const note = (b: HTMLButtonElement, before: string) => {
          const key = label(b);
          if (sceneState() === before) {
            pressed.set(key, (pressed.get(key) ?? 0) + 1);
          } else {
            pressed.delete(key);
          }
        };
        for (let round = 0; round < 8 && clicks < budget; round++) {
          // Scenes animate, and some only mount the next question a beat after
          // the last one is answered. No controls is not the same as nothing
          // left to do, so wait properly before concluding it.
          if (!fresh().length) {
            await new Promise<void>((r) => setTimeout(() => r(), 400));
            if (complete()) return true;
            if (!fresh().length) return complete();
          }
          if (fillFields()) {
            await settle();
            if (complete()) return true;
          }
          for (let i = 0; i < fresh().length && clicks < budget; i++) {
            const held = fresh()[i];
            if (!held) break;
            const beforeHeld = sceneState();
            if (press(held)) {
              clicks++;
              trace.push(label(held).slice(0, 40));
              await settle();
              note(held, beforeHeld);
              if (complete()) return true;
            }

            for (let j = i + 1; j < fresh().length && clicks < budget; j++) {
              const anchor = fresh()[i];
              if (anchor) {
                const beforeAnchor = sceneState();
                if (press(anchor)) {
                  clicks++;
                  await settle();
                  note(anchor, beforeAnchor);
                  // Re-asserting the held control can itself be the answer, and
                  // the scene it reveals can leave nothing further to probe.
                  if (complete()) return true;
                }
              }
              const probe = fresh()[j];
              if (!probe) break;
              const beforeProbe = sceneState();
              probe.click();
              clicks++;
              trace.push(`+ ${label(probe).slice(0, 40)}`);
              await settle();
              note(probe, beforeProbe);
              if (complete()) return true;
            }
          }
        }
        return complete();
      };

      /**
       * Grouped multiple choice: several questions on screen at once, each with
       * its own options, where the stage completes only when every one of them
       * is right. Probing options one at a time can never finish that, so walk
       * the combinations instead — options sharing a parent are one question —
       * changing only what differs between successive combinations.
       */
      /**
       * Controls grouped by the question they belong to: the nearest ancestor
       * holding more than one of them. Grouping by the immediate parent alone
       * missed every scene that wraps each option in its own row, which is most
       * of the profile-building stages.
       */
      const byParent = () => {
        const list = controls();
        const map = new Map<Element, HTMLButtonElement[]>();
        for (const b of list) {
          let node: Element | null = b.parentElement;
          const root = findJourney();
          let key: Element = b.parentElement ?? root!;
          while (node && node !== root) {
            if (list.filter((c) => node!.contains(c)).length >= 2) {
              key = node;
              break;
            }
            node = node.parentElement;
          }
          const bucket = map.get(key) ?? [];
          bucket.push(b);
          map.set(key, bucket);
        }
        return [...map.values()];
      };
      const groupsNow = () => byParent().filter((g) => g.length >= 2);
      /** A button standing alone under its parent: "Check", "Save", "Verify". */
      const commitsNow = () => byParent().filter((g) => g.length === 1).map((g) => g[0]);

      const combinationSearch = async () => {
        const groups = groupsNow();
        const sizes = groups.map((g) => g.length);
        const product = sizes.reduce((a, b) => a * b, 1);
        if (!groups.length) return false;
        // Artifact stages ("choose your turnover, your tax setting… then save")
        // have no wrong answer, so the first combination plus the save button
        // finishes them — worth trying even when the full product is enormous.
        const combinations = Math.min(product, 1200);
        trace.push(`combinations: ${sizes.join("×")}${product > combinations ? ` (first ${combinations})` : ""}`);
        let previous: number[] | null = null;
        for (let n = 0; n < combinations && clicks < budget; n++) {
          let rest = n;
          const pick = sizes.map((size) => {
            const value = rest % size;
            rest = Math.floor(rest / size);
            return value;
          });
          const current = groupsNow();
          if (current.length !== groups.length) {
            // A wrong check disables the choices until the retry is pressed, so
            // the shape changing is a normal step, not the end of the search.
            previous = null;
            for (const commit of commitsNow()) {
              if (clicks >= budget) break;
              commit.click();
              clicks++;
              await settle();
              if (complete()) return true;
            }
            continue;
          }
          for (let g = 0; g < current.length; g++) {
            if (previous && previous[g] === pick[g]) continue;
            const option = current[g][pick[g]];
            if (!option) continue;
            option.click();
            clicks++;
            await settle();
            if (complete()) return true;
          }
          previous = pick;

          // Then commit. Stages that assemble an artifact only record it when
          // the save button is pressed, and a written field may have appeared
          // alongside the choices.
          if (fillFields()) await settle();
          for (const commit of commitsNow()) {
            if (clicks >= budget) break;
            commit.click();
            clicks++;
            trace.push(`commit: ${label(commit).slice(0, 30)}`);
            await settle();
            if (complete()) return true;
          }
        }
        return complete();
      };

      /**
       * Passes, because a stage is not always one question: the mastery files
       * ask five in a row in the same scene, each replacing the last. One pass
       * answers one of them, so keep going while something is still changing,
       * and stop as soon as a whole pass changes nothing.
       *
       * Within a pass, order matters. Wherever the stage presents options at
       * all, the search is what finishes it — it holds one choice per question
       * and presses commit, where the sweep re-asserts a single wrong answer
       * against a retry button until the budget is gone. The sweep is for
       * stages built from lone controls: reveal this, then continue.
       */
      // The written-out answer, where this stage has one. Run first and once:
      // it is the whole solution, and the searches below are the fallback if a
      // label has drifted.
      if (key.length) {
        for (const wanted of key) {
          if (clicks >= budget) break;

          // "type:<field id>=<value>" writes an exact answer. A stage that asks
          // the learner to work out a number and type it cannot be answered by
          // clicking, and lowering it to multiple choice to suit the walker
          // would be letting the test rewrite the lesson.
          if (wanted.startsWith("type:")) {
            const [id, ...rest] = wanted.slice(5).split("=");
            const value = rest.join("=");
            const field = findJourney()?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
              `#${CSS.escape(id)}`,
            );
            if (!field) {
              trace.push(`key miss: field #${id}`);
              continue;
            }
            const proto =
              field instanceof HTMLTextAreaElement
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(field, value);
            field.dispatchEvent(new Event("input", { bubbles: true }));
            trace.push(`key: #${id} = ${value}`);
            await settle();
            if (complete()) return { completed: true, clicks, trace };
            continue;
          }

          // Select a native radio or checkbox by the visible label that a
          // learner sees. Mission 5 deliberately keeps semantic form controls
          // rather than turning every answer into a button for the test.
          if (wanted.startsWith("choose:")) {
            const visible = wanted.slice(7);
            // Only a label that is actually rendered: this lesson mounts some
            // controls twice for responsive layouts and collapses one copy to
            // 0×0, and clicking the collapsed twin does nothing at all.
            const optionLabel = [...(findJourney()?.querySelectorAll("label") ?? [])].find((candidate) => {
              const box = candidate.getBoundingClientRect();
              return box.width > 0 && box.height > 0 && label(candidate).includes(visible);
            });
            const field = optionLabel?.querySelector<HTMLInputElement>(
              "input[type='radio'], input[type='checkbox']",
            );
            if (!field) {
              trace.push(`key miss: choice ${visible.slice(0, 40)}`);
              continue;
            }
            field.click();
            clicks++;
            trace.push(`key: choice ${visible.slice(0, 40)}`);
            await settle();
            if (fillFields()) await settle();
            if (complete()) return { completed: true, clicks, trace };
            continue;
          }

          if (wanted.startsWith("type-label:")) {
            const [visible, ...rest] = wanted.slice(11).split("=");
            const value = rest.join("=");
            const fieldLabel = [...(findJourney()?.querySelectorAll<HTMLLabelElement>("label[for]") ?? [])].find(
              (candidate) => label(candidate).includes(visible),
            );
            const field = fieldLabel?.htmlFor
              ? findJourney()?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                  `#${CSS.escape(fieldLabel.htmlFor)}`,
                )
              : null;
            if (!field) {
              trace.push(`key miss: labelled field ${visible.slice(0, 40)}`);
              continue;
            }
            const proto =
              field instanceof HTMLTextAreaElement
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(field, value);
            field.dispatchEvent(new Event("input", { bubbles: true }));
            trace.push(`key: ${visible} = ${value}`);
            await settle();
            if (fillFields()) await settle();
            if (complete()) return { completed: true, clicks, trace };
            continue;
          }

          const target = controls().find((b) => label(b).includes(wanted));
          if (!target) {
            trace.push(`key miss: ${wanted.slice(0, 40)}`);
            continue;
          }
          target.click();
          clicks++;
          trace.push(`key: ${wanted.slice(0, 40)}`);
          await settle();
          if (fillFields()) await settle();
          if (complete()) return { completed: true, clicks, trace };
        }

        /**
         * A written key is the declared solution for this stage, so the searches
         * below must not run after it. Two reasons, both learned the hard way:
         *
         * 1. Saving can be asynchronous. The last key entry completed the stage
         *    but `complete()` was read before the save landed, so give it a
         *    proper wait before judging.
         * 2. The sweep clicks whatever it finds, and on a lesson with isolated
         *    cases that includes the case switcher. It pressed "Build mine"
         *    after the key had finished the practice case, moving to an empty
         *    case where nothing was complete — destroying the answer and then
         *    reporting the stage unanswerable.
         *
         * If a key exists and does not finish the stage, that is a real failure
         * and belongs in the trace, not something to paper over by brute force.
         */
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
        if (complete()) return { completed: true, clicks, trace };
        trace.push(
          `key finished without completing: counter=${counter()} stageIndex=${stageIndex()} journey=${findJourney()?.id ?? "none"}`,
        );
        return { completed: false, clicks, trace };
      }

      const signature = () => `${counter()}|${controls().map(label).join("|")}`;
      for (let pass = 0; pass < 8 && clicks < budget; pass++) {
        const before = signature();

        // A stage holding a wrong answer shows no options at all — they are
        // disabled until the retry is pressed. Press it, and the questions come
        // back, which is what the search needs to see.
        if (!groupsNow().length && controls().length === 1) {
          const only = controls()[0];
          only.click();
          clicks++;
          trace.push(`unblock: ${label(only).slice(0, 30)}`);
          await settle();
          if (complete()) return { completed: true, clicks, trace };
        }

        if (groupsNow().length >= 1) {
          if (await combinationSearch()) return { completed: true, clicks, trace };
          if (await sweep()) return { completed: true, clicks, trace };
        } else {
          if (await sweep()) return { completed: true, clicks, trace };
          if (await combinationSearch()) return { completed: true, clicks, trace };
        }
        if (signature() === before) break;
        trace.push(`— pass ${pass + 1} moved the scene on`);
      }

      return { completed: complete(), clicks, trace };
    },
    { selector: JOURNEY_SELECTOR, budget: 5000, key },
  );
}

/**
 * Move to the next stage using the shell's own advance button.
 *
 * Note the selector: `#a, #b button` is a selector LIST, so the earlier
 * `${JOURNEY_SELECTOR} button` matched the journey SECTION on every lesson that
 * uses #lesson-journey. Clicking a section does nothing, `toBeEnabled` passes on
 * it, and the walk sat on stage 1 while reporting that it had walked six. The
 * caller now asserts that the stage index actually moved.
 */
async function advanceStage(page: Page) {
  const advance = page
    .locator("#lesson-journey button, #statement-investigation button")
    .filter({ hasText: /→\s*$/ })
    .last();
  await expect(advance).toBeEnabled();
  await advance.click();
}

const format = (findings: Finding[]) =>
  findings.length
    ? `\n${findings.map((f) => `  [${f.kind}] ${f.detail}`).join("\n")}\n`
    : "";

for (const slug of IF_LESSON_ROUTES) {
  test(`lesson renders a readable hierarchy at every stage: ${slug}`, async ({ page }) => {
    // Walking a lesson means answering every stage and auditing it twice, on a
    // dev server compiling routes on demand. The 30s default is a limit on the
    // work, not on the page.
    test.setTimeout(180_000);
    await page.goto(`/lessons/${slug}`);
    await page.waitForLoadState("domcontentloaded");
    // A cold dev server compiles a route on first request, which regularly
    // takes longer than the 5s default and produced failures that vanished on
    // a warm re-run. The page is not slow; the compiler is.
    await expect(page.locator("main")).toBeVisible({ timeout: 45_000 });

    /**
     * Visible is not the same as listening.
     *
     * The walk opens by clicking, and a dev server compiling a route for the
     * first time serves the server-rendered HTML well before React attaches its
     * handlers. A press inside that window is dropped in silence — the button is
     * present, visible and enabled, and nothing happens. Mission 13 failed here
     * on a cold server and walked to its last stage on a warm one: four clicks
     * on stage 1, no state change, reported as a stage that could not be
     * answered. The lesson was never at fault, and the walker had no way to see
     * the difference.
     *
     * React sets `__reactProps$…` on a host node when it commits that node's
     * handlers, so its presence on a real control is the signal that a click
     * will now be heard.
     */
    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            [...document.querySelectorAll("main button")].some((control) =>
              Object.keys(control).some((k) => k.startsWith("__reactProps$")),
            ),
          ),
        {
          message: `${slug}: React never attached its handlers, so every click in the walk would land on a page that cannot hear it`,
          timeout: 45_000,
        },
      )
      .toBe(true);

    if (slug === "if-pb-05-set-allocation-and-risk-limits") {
      /**
       * Mission 5 opens on the readiness runway, which is where the course
       * actually asks whose mandate is being built, with the consequence of each
       * route on screen. The workbench rail used to carry a second copy of that
       * choice as a segmented toggle, and this walk used to click it; it was
       * removed because it flipped a global setting from every lesson page with
       * nothing on the page confirming it had changed. The walk now drives the
       * control the learner is left with.
       *
       * The radio is `sr-only` inside its card, so the click goes through the
       * rendered label to the input, the same way `choose:` does above.
       */
      const chosen = await page.evaluate(() => {
        const card = [...document.querySelectorAll("label")].find((candidate) => {
          const box = candidate.getBoundingClientRect();
          return (
            box.width > 0 &&
            box.height > 0 &&
            /Practice case/.test(candidate.textContent ?? "")
          );
        });
        const field = card?.querySelector<HTMLInputElement>(
          "input[type='radio'][value='practice']",
        );
        field?.click();
        return Boolean(field);
      });
      expect(chosen, `${slug}: the practice-case card was never on screen`).toBe(true);
      await expect(
        page.locator("input[type='radio'][value='practice']").first(),
      ).toBeChecked();
    }

    const findings: Finding[] = [];
    const warnings = new Set<string>();
    const seen = new Set<string>();
    const collect = (
      result: { findings: { kind: string; detail: string }[]; warnings: string[] },
      where: string,
    ) => {
      for (const f of result.findings) {
        const key = `${f.kind}|${f.detail}`;
        if (seen.has(key)) continue;
        seen.add(key);
        findings.push({ kind: f.kind as Finding["kind"], detail: `${where}: ${f.detail}` });
      }
      for (const w of result.warnings) warnings.add(w);
    };

    const { total } = await stagePosition(page);
    for (let stage = 0; stage < total; stage++) {
      const { label } = await stagePosition(page);

      collect(
        await auditRenderedText(page, REVIEWED_LABELS, CONTRAST_AA_NORMAL, CONTRAST_AA_LARGE, MIN_FONT_PX, true),
        `${label} on arrival`,
      );

      const solved = await solveStage(page, ANSWER_KEYS[`${slug}#${stage}`] ?? []);
      expect(
        solved.completed,
        `${slug}: could not answer ${label} after ${solved.clicks} interactions, so no stage past it was audited.\n  tried: ${solved.trace.join(" › ")}\n`,
      ).toBe(true);

      collect(
        await auditRenderedText(page, REVIEWED_LABELS, CONTRAST_AA_NORMAL, CONTRAST_AA_LARGE, MIN_FONT_PX, true),
        `${label} answered`,
      );

      if (stage < total - 1) {
        // Some lessons advance themselves once a stage is saved. Clicking the
        // shell's advance button as well would skip the stage that auto-arrived
        // and leave it unaudited, so only press it if the lesson has not
        // already moved.
        if ((await stagePosition(page)).index === stage) {
          await advanceStage(page);
        }
        await expect
          .poll(async () => (await stagePosition(page)).index, {
            message: `${slug}: advancing from ${label} never moved the lesson on, so the stages after it were not audited`,
          })
          .toBe(stage + 1);
      }
    }

    console.log(
      `  ${slug}: ${total} stage(s) walked${warnings.size ? `, ${warnings.size} note(s): ${[...warnings].slice(0, 3).join(", ")}` : ""}`,
    );
    expect(findings, format(findings)).toEqual([]);

    // The same lesson, at its last stage, must not scroll sideways on a phone.
    await page.setViewportSize({ width: 375, height: 812 });
    const { client, scroll } = await horizontalOverflow(page);
    expect(scroll, `${slug} overflows horizontally at 375px (${scroll}px > ${client}px)`).toBeLessThanOrEqual(client);
  });
}

/**
 * The gate's own gate.
 *
 * Every check in `auditRenderedText` has already been disabled once by accident:
 * an over-permissive eyebrow exemption made the hierarchy check unreachable, and
 * the whole suite stayed green while the defect it was written for sat on the
 * page. A checker that cannot fail is not evidence. This plants one of each
 * defect in a real lesson page and requires the audit to report all three.
 */
test("the gate still fails on the defects it was built to catch", async ({ page }) => {
  await page.goto(`/lessons/${IF_LESSON_ROUTES[0]}`);
  // A cold dev server compiles a route on first request, which regularly
    // takes longer than the 5s default and produced failures that vanished on
    // a warm re-run. The page is not slow; the compiler is.
    await expect(page.locator("main")).toBeVisible({ timeout: 45_000 });

  await page.evaluate(() => {
    const probe = document.createElement("section");
    // Colours and sizes are inline and self-contained, so the expectation does
    // not move when the theme does.
    probe.innerHTML = `
      <div>
        <div class="ops-caption" style="font-size:10px">Group title at label size</div>
        <div style="display:grid">
          <p style="font-size:15px">First block of a group, long enough to count as prose in this audit.</p>
          <p style="font-size:15px">Second block of the same group, also long enough to count as prose.</p>
        </div>
      </div>
      <p style="font-size:9px">Nine pixel text that nobody should have to magnify to read.</p>
      <p style="font-size:16px;background:#111827;color:#1f2937">Grey on grey, far under the contrast floor.</p>`;
    document.querySelector("main")?.appendChild(probe);
  });

  const { findings } = await auditRenderedText(
    page,
    REVIEWED_LABELS,
    CONTRAST_AA_NORMAL,
    CONTRAST_AA_LARGE,
    MIN_FONT_PX,
    true,
  );
  const kinds = [...new Set(findings.map((f) => f.kind))].sort();
  expect(kinds, format(findings as Finding[])).toEqual(["contrast", "hierarchy", "size"]);
});

for (const route of [
  "/dossier",
  "/courses/investment-foundations",
  "/courses/finance-foundations",
]) {
  test(`page renders a readable hierarchy: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("domcontentloaded");
    // A cold dev server compiles a route on first request, which regularly
    // takes longer than the 5s default and produced failures that vanished on
    // a warm re-run. The page is not slow; the compiler is.
    await expect(page.locator("main")).toBeVisible({ timeout: 45_000 });

    const { findings } = await auditRenderedText(
      page,
      REVIEWED_LABELS,
      CONTRAST_AA_NORMAL,
      CONTRAST_AA_LARGE,
      MIN_FONT_PX,
      true,
    );
    expect(findings as Finding[], format(findings as Finding[])).toEqual([]);

    await page.setViewportSize({ width: 375, height: 812 });
    const { client, scroll } = await horizontalOverflow(page);
    expect(scroll, `${route} overflows horizontally at 375px`).toBeLessThanOrEqual(client);
  });
}
