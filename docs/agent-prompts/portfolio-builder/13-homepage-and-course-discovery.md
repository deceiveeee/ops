# Optional prompt — homepage and course discovery experience

Paste after `00-master-operating-prompt.md`. Use only when the homepage/discovery experience
is explicitly in scope. This prompt does not authorize changes to lesson finance content or
Portfolio Builder state.

---

## Objective

Refine OPS's homepage into a cinematic, fast, accessible explanation of what the product
does, then lead the visitor into the approved Portfolio Builder path with complete clarity.

The narrative is:

1. markets look chaotic;
2. price is only the surface;
3. behind the ticker is a business;
4. the filing is the business's source code;
5. statements show how money moves;
6. valuation links cash flow, growth, risk, and rates;
7. assets interact inside a portfolio;
8. macro decisions ripple through markets;
9. OPS teaches the learner to build one portfolio through 13 decisions.

## Availability truth gate

Before writing the learner promise or CTA, inspect actual mission availability and the
complete-course release evidence.

- If all 13 missions are implemented, tested, reviewed, and approved for release, the
  homepage may promise a course the learner can complete now and route `Start`/`Resume` to
  the live path.
- If any required mission is planned, gated, unreviewed, or unavailable, describe the
  13-mission course explicitly as **in development** or a **preview**. State what is
  currently available, prevent a CTA from implying the full portfolio can be completed,
  and use an honest action such as `Preview the mission path` or `Continue available
  missions`.
- Do not use curriculum approval, future prompt coverage, or a visible mission card as proof
  that the learner can finish the product.

Marketing truth is a release requirement. A beautiful promise cannot run ahead of the
implemented course.

Use Apple as a benchmark for editorial focus, scroll pacing, typography, continuity, and
finish. Use Khan Academy as a benchmark for a plain learner promise, transparent path, safe
entry point, and obvious next action. Do not copy either company's layouts, visuals, copy,
colors, typography, icons, scoring, or branding.

## Inspect before editing

Read `AGENTS.md` and the approved Portfolio Builder authorities, then inspect completely:

- `app/(marketing)/page.tsx`;
- `components/marketing/HomePage.tsx`;
- every component under `components/marketing/` used by the current page;
- the `/start`, `/courses`, Portfolio Builder course, lesson, and plan entry routes;
- `app/globals.css`, theme/type tokens, header, footer, and analytics/performance wiring;
- existing current visual-audit screenshots as baseline context only.

Render the current homepage at desktop, tablet, mobile, both themes where applicable,
reduced motion, keyboard, and 200% zoom. Capture baseline screenshots and record the current
chapter order, scroll mechanics, CTAs, load cost, and console output.

Do not rebuild components already doing their job. Identify the few changes that most
improve comprehension, emotional arc, and route into the course.

## First-screen contract

Within the initial viewport, a new visitor should understand:

- this is a guided finance-learning product;
- the outcome is a completed, defensible personal or practice portfolio;
- the experience is interactive, not a blog or stock-picking feed;
- no prior investment expertise is assumed;
- one primary action starts or resumes the course;
- a secondary action may preview the 13-mission path.

Do not promise returns, market-beating performance, professional credentials, or
personalized advice. Do not lead with feature count or a generic `Learn more` CTA.

## Scrollytelling contract

Each chapter must have:

- one question or idea;
- one finance-native visual relationship;
- one transition explaining why the next chapter follows;
- a static/reduced-motion equivalent;
- no essential information that exists only during a narrow scroll interval.

Preferred visual sequence:

- market fragments resolve into a price chart;
- chart X-ray reveals business drivers;
- filing annotations reveal statement evidence;
- money machine connects customers to free cash flow;
- valuation gravity changes with assumptions;
- portfolio constellation reveals covariance/diversification;
- macro control room shows transmission, not prediction;
- the final scan resolves into the learner’s 13-mission Workbench and plan.

Use static or clearly illustrative data. No live market API is required or authorized.

## Apple-level experience criteria

- One dominant message and action per scene.
- Deliberate whitespace and editorial type hierarchy.
- Smooth continuity between chapters; no collection of unrelated demos.
- Motion responds to the narrative and user scroll without hijacking it.
- Visitors can scroll normally, skip ahead, use keyboard, and interrupt motion.
- Progressive disclosure keeps source/technical detail available without crowding the
  story.
- Precision in all empty, loading, hover, focus, and CTA states.
- Recompose for mobile; do not shrink a wide artboard.

## Khan-level learner criteria

- The promise is concrete and attainable.
- `Build mine` and `Practice case` are equally visible before personal data is requested.
- The mission preview shows decisions and artifacts, not a wall of course modules.
- The next useful action is always obvious.
- Progress/resume messaging is accurate and does not equate clicks with mastery.
- A visitor can inspect the path before signing in.
- Language is plain, welcoming to a novice, and serious enough for an ambitious learner.

## OPS visual rules

- Premium finance atmosphere: dark navy/charcoal, restrained semantic accents, precise
  data texture, Inter UI, Fraunces headlines.
- Never use monospace or text below 12px.
- No generic stock photography, blue SaaS gradients, feature-card grids, fake Bloomberg
  terminals, or random tickers.
- Avoid neon overload and decorative animation.
- If a control does not change or reveal a finance relationship, remove it.
- Keep lesson routes' theme and accessibility constraints separate from marketing darkness;
  do not copy hard-coded marketing surfaces into light-theme learning pages.

## Accessibility and performance

- Semantic landmarks and heading order;
- skip link, keyboard-accessible navigation/CTAs, visible focus;
- no scroll lock, keyboard trap, or inaccessible scroll-jacking;
- reduced motion preserves chapter sequence and all meaning;
- color-independent information and descriptive text alternatives for complex visuals;
- 200% zoom and 320–360px width without loss;
- stable layout and no hydration errors;
- animate transform/opacity, limit concurrent nodes, avoid excessive blur;
- lazy-load only heavy below-fold visuals without delaying the first message;
- audit image/font/script weight, Core Web Vitals, and console output.

## Conversion without manipulation

- Primary CTA starts/resumes the course at the correct state.
- Secondary CTA previews the 13 decisions or completed plan outcome.
- Never use false urgency, fake social proof, fabricated market results, or shame.
- If authentication is optional, let visitors understand the product before asking for it.
- Explain local/private progress accurately.

## Verification

Run the master automated checks plus browser QA at approximately 1440×900, 1024×768,
390×844, 320–360px, and 200% zoom. Inspect fast/slow load, reduced motion, keyboard, both
relevant themes, CTA routing for fresh and returning users, back navigation, console, and
visual continuity across the entire page.

Create or update `docs/release-evidence/homepage-course-discovery.md` with baseline/final
screenshot paths and performance observations.

## Explicit non-goals

Do not:

- change the approved curriculum or Workbench schema;
- imply a second mission/module direction;
- add live prices, news, market claims, or product recommendations;
- copy Apple product pages or Khan Academy identity;
- introduce WebGL/3D or video without a proven learning/story benefit and performance
  budget;
- turn the homepage into a generic feature grid;
- add manipulative conversion patterns;
- commit, push, or deploy.

End with the learner promise now communicated, before/after evidence, measured performance,
and the master report.

---
