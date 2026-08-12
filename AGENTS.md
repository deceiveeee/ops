## Creative Website Inspiration Standard

This project should take inspiration from highly creative websites that use immersive layouts, scroll storytelling, animation, interactivity, and visual metaphor. The goal is not to copy any specific website, but to translate strong creative web patterns into a finance education product.

The site should feel like:
- an interactive finance terminal,
- a cinematic learning experience,
- a market simulation,
- a real company investigation tool,
- and a visually rich educational product.

The site should not feel like:
- a generic financial literacy blog,
- a plain card-based SaaS landing page,
- a static textbook,
- a random dashboard,
- or a cheap animation demo.

Creativity should always support learning. Do not add animation only because it looks cool. The interaction must clarify a finance concept, guide user attention, or make the learning experience more memorable.

---

## Creative Interaction Principles

### Learning logic is a release requirement

Every lesson must be coherent for a learner encountering the topic for the first time. Before implementation and again during QA:

- Map the knowledge, vocabulary, and skills assumed by every prompt.
- Introduce and define a concept before asking the learner to use or identify it. An intentionally diagnostic opening must be labeled as such, must not penalize the learner, and must teach the missing concept immediately afterward.
- Define abstractions with a direct positive statement. Do not rely on an “X is not Y” contrast to carry the definition.
- Follow each new abstract finance term with a concrete cause-and-effect example. When useful, include numbers and explicitly identify the event, price effect, investor action, and condition expected to resolve the situation.
- Follow the sequence: introduce → model → guided practice → independent application → assessment.
- Give the learner enough information to answer from the lesson itself; never make unstated prior knowledge the hidden key to progression.
- Check transitions so the learner always understands why the next activity follows and what they should do.
- Review pedagogy separately from visual, functional, accessibility, and responsive QA. Passing tests does not prove that the teaching sequence is logical.
- Test the complete lesson from a fresh learner state, recording for every assessed idea where it was introduced and practiced.

### Source integrity is a release requirement

OPS lessons may be used by high school students who are encountering finance for the first time. Accuracy, authenticity, and traceability are required before lesson design or implementation begins:

- Lock the exact source edition, course sequence, session number, title, publication year, and canonical official URLs. Do not combine similarly named sessions from different editions unless the difference is explicitly documented and approved.
- Review the complete official slideshow visually and read all slide text, charts, tables, examples, notes, and footnotes. A search result, course-page summary, or extracted snippet is not a substitute for reviewing the full deck.
- Review the complete official video captions or transcript alongside the slideshow. Check how the instructor explains, qualifies, sequences, and connects every concept; do not infer the lesson scope from slide titles alone.
- Create a source coverage matrix before outlining the OPS lesson. For every proposed definition, claim, example, interaction, and assessment, record the supporting slide or video-caption segment and the prerequisite concepts the learner needs.
- Reconcile discrepancies among the course page, slideshow, captions, book edition, tests, and solutions before writing lesson content. Stop and resolve version ambiguity instead of choosing a sequence from memory.
- Separate source-authentic material from original OPS pedagogy. Preserve the source's meaning and qualifications; label original examples, numbers, metaphors, and interactions as OPS adaptations.
- Verify every equation, numerical example, answer, and feedback explanation independently. Assessment answers must be supported by the reviewed sources and by concepts already introduced and practiced in the lesson.
- Run a source-integrity review as a distinct release gate. Do not present a lesson as source-authentic until the edition lock, complete source review, coverage matrix, numerical checks, and citation metadata all pass.

### 1. Use immersive full-screen sections when appropriate

For landing pages, module introductions, and major lesson openers, prefer full-screen or near-full-screen sections when they create a stronger narrative experience.

Good uses:
- Hero sections.
- Opening hooks.
- Module introductions.
- Major concept transitions.
- Simulation intros.
- Case study reveals.

Possible techniques:
- Full-screen layouts.
- Scroll snapping.
- Sticky sections.
- Large typography.
- Large charts, diagrams, filings, or simulation panels.
- Minimal but deliberate navigation.

Finance translation:
- A full-screen market chaos scene resolves into a clean stock chart.
- A full-screen 10-K document appears as the “source code” behind a stock.
- A full-screen Fed control room introduces macro policy.
- A full-screen portfolio map shows risk as interacting assets.

Avoid making every page full-screen. Use immersive layouts for high-impact moments, not ordinary reading sections.

---

### 2. Use scroll storytelling, not static explanation 1

When a concept has layers, sequence, or causality, use scroll-driven storytelling.

Good uses:
- Price chart → business fundamentals → financial statements → valuation.
- Revenue → gross profit → operating income → free cash flow.
- Interest rates → bond prices → duration → convexity.
- Cash flows → present value → price → yield.
- Single stock risk → portfolio risk → diversification.
- Inflation → Fed policy → yields → stock valuation.

Possible techniques:
- Scroll-linked opacity.
- Transform transitions.
- Parallax layers.
- Sticky visual panel with changing text.
- SVG line drawing.
- Clip-path reveal.
- Masked reveals.
- Sequential annotations.
- Scroll progress indicators.

Finance translation:
- As the user scrolls, a stock chart splits into revenue, margin, free cash flow, debt, and shares outstanding.
- A bond’s future payments appear year by year, then collapse into present value.
- A 10-K filing scrolls behind floating annotations.
- A yield curve bends as rate expectations change.

Avoid long static blocks when the concept would be clearer as a sequence.

---

### 3. Use horizontal and vertical navigation deliberately

Creative websites often combine vertical scrolling with horizontal scene changes. This can be useful for finance when comparing alternatives or walking through a process.

Good uses:
- Comparing companies.
- Comparing investment strategies.
- Moving across years in a cash-flow timeline.
- Walking through a financial statement.
- Showing different modules in the course map.
- Showing multiple market scenarios.

Possible techniques:
- Horizontal snap sections.
- Horizontal timeline inside a vertical scroll section.
- Sticky container with horizontally moving panels.
- Carousel only when it feels intentional and premium.

Finance translation:
- A horizontal strip shows Year 1, Year 2, Year 3 bond cash flows.
- A company analysis moves from Business → Financials → Risks → Valuation.
- A macro simulation moves from Inflation → Fed Rate → Bond Market → Equity Market.
- A module map scrolls horizontally like a market investigation path.

Avoid generic carousels that feel like templates.

---

### 4. Prefer semantic controls over cheap controls

Do not add sliders, buttons, toggles, or cards merely to make a section look interactive.

A control is acceptable only if it visibly changes:
- a financial outcome,
- a valuation,
- a risk measure,
- a cash-flow relationship,
- an arbitrage signal,
- a portfolio result,
- a business decision,
- or a macroeconomic chain reaction.

Avoid generic range sliders unless the variable is naturally continuous and the result updates clearly.

Prefer:
- scenario chips,
- trade decision buttons,
- assumption panels,
- timeline scanners,
- before/after comparisons,
- drag-to-allocate interfaces,
- equation builders,
- cash-flow matching tools,
- valuation sensitivity panels,
- interactive filing annotations.

Bad interaction:
- A slider changes a number but does not teach why the number matters.
- Two cards have sliders that look symmetrical but do not reveal a financial relationship.
- A button says “scan” but no scanning animation or diagnostic result appears.

Good interaction:
- A scan line moves across two cash-flow timelines.
- Matching cash flows glow year by year.
- A difference row proves the cash flows are identical.
- A price comparison panel identifies whether arbitrage exists.
- The user sees a concrete trade signal such as “Sell bond, buy strips.”

The visual result must be stronger than the control itself. The user should remember the finance concept, not the widget.

---

## Creative Pattern Library

Use these patterns when they fit the page.

### 1. Market chaos to structure

Use floating tickers, price changes, headlines, rates, and financial metrics as atmospheric fragments. As the user scrolls, these fragments should organize into a clear chart, model, or lesson path.

Finance use:
- Homepage hero.
- Module opening.
- Market efficiency lesson.
- Risk lesson.

Concept:
Markets look chaotic, but finance teaches users to decode the structure underneath.

---

### 2. Chart X-ray

A stock chart, bond price chart, or yield curve visually opens up to reveal the drivers beneath it.

Finance use:
- Stock price → revenue, margins, cash flow, debt.
- Bond price → coupon, principal, discount rate, duration.
- Portfolio return → asset weights, covariance, volatility.
- Company valuation → growth, margins, reinvestment, risk.

Concept:
The visible price is only the surface layer.

---

### 3. Filing as source code

When showing 10-Ks, annual reports, SEC filings, or transcripts, treat the document as an investigative object.

Possible effects:
- Highlighted source lines.
- Glowing annotations.
- Jump-to-section navigation.
- Split-screen filing + explanation.
- Scroll-linked annotation cards.
- Hover-to-explain terms.
- “Investor lens” callouts.
- Important sections appearing as pins on a document map.

Finance use:
- 10-K reader.
- Financial statement lessons.
- Case studies.
- Company analysis.

Concept:
Real investors read source documents, not just summaries.

---

### 4. Cash-flow scanner

Use scan-line effects to compare, match, or discount cash flows.

Possible effects:
- A scan line moves across future dates.
- Each cash flow glows as it is matched.
- A difference row confirms whether cash flows are identical.
- A present-value row appears under each future payment.
- An arbitrage signal appears after the scan.

Finance use:
- Fixed-income replication.
- No-arbitrage pricing.
- DCF valuation.
- Duration and convexity.
- Project valuation.

Concept:
Finance is about timing, amount, risk, and price.

---

### 5. Money machine

Show a company as a system that converts customer demand into financial outcomes.

Possible flow:
Customers → Revenue → Gross Profit → Operating Income → Free Cash Flow → Value

Possible controls:
- Pricing power.
- Unit volume.
- Gross margin.
- Operating expenses.
- Reinvestment.
- Debt burden.
- Tax rate.

Finance use:
- Income statement lessons.
- Business model lessons.
- Margin analysis.
- Company case studies.

Concept:
A business is a machine that turns decisions into cash flows.

---

### 6. Valuation gravity

Represent valuation as a force system.

Possible forces:
- Growth pulls value upward.
- Cash flow stabilizes value.
- Risk pulls value downward.
- Interest rates compress multiples.
- Competition weakens margins.
- Moat protects returns.

Possible controls:
- Growth assumption.
- Discount rate.
- Margin assumption.
- Terminal multiple.
- Reinvestment rate.

Finance use:
- DCF.
- Multiples.
- Moat analysis.
- Interest-rate sensitivity.

Concept:
Value changes when expectations, risk, and cash flows change.

---

### 7. Portfolio constellation

Represent assets as connected nodes.

Possible effects:
- Assets move independently or together.
- Strong correlation creates clustered movement.
- Diversification spreads the constellation.
- Volatility appears as turbulence.
- Portfolio risk changes when weights change.

Finance use:
- Diversification.
- Correlation.
- Portfolio construction.
- CAPM.
- Efficient frontier.
- Risk management.

Concept:
Risk is not only about individual assets. It depends on how assets interact.

---

### 8. Macro control room

Use a dashboard-like interface for macro lessons.

Possible controls:
- Interest rate lever.
- Inflation gauge.
- Unemployment gauge.
- GDP growth meter.
- Bond yield curve.
- Stock market reaction.
- Credit spread indicator.

Finance use:
- Fed simulator.
- Monetary policy.
- Bond markets.
- Inflation.
- Macro investing.

Concept:
One policy decision can ripple through households, companies, bonds, and stocks.

---

### 9. Grid gallery with motion

Use CSS Grid or Flexbox to create visually rich layouts for case studies, companies, filings, concepts, or modules.

Possible effects:
- Cards slide and fade in on scroll.
- Hover reveals the financial question behind each card.
- Clicking opens a case study or filing.
- Grid items vary in size based on importance.
- Minimal modal previews can show larger content.

Finance use:
- Company case study gallery.
- Course module map.
- Filing library.
- Simulation menu.
- Concept library.

Concept:
The site should feel exploratory, not linear-only.

---

### 10. Dynamic background and mouse response

Use subtle mouse-linked movement, animated backgrounds, or 3D-like layers only when they improve immersion.

Possible effects:
- Background chart moves slightly with cursor.
- Ticker fragments drift based on mouse position.
- 3D-like financial object rotates subtly.
- Particle field responds to hover.
- Market fog clears as the user scrolls.

Finance use:
- Homepage hero.
- Simulation opening screen.
- Portfolio risk visualization.
- Macro control room.

Important:
Use this sparingly. Do not create distracting motion behind dense lesson text.

---

### 11. Background video or animated panels

Use background videos, looping animations, or animated panels when they create atmosphere without reducing readability.

Possible uses:
- Abstract trading floor motion.
- Slow-moving charts.
- Financial document pages.
- Market data texture.
- Company operations footage if available.
- Animated macro dashboard.

Finance use:
- Homepage.
- Course landing page.
- Module intro pages.
- Case study intros.

Avoid:
- Stock video that looks generic.
- Busy backgrounds behind important text.
- Videos that make the site slower without improving the experience.

---

### 12. Bold flat minimalism

Creativity does not always require heavy animation. Some pages should be bold, minimal, and editorial.

Use:
- Black and white design.
- Large typography.
- Strong spacing.
- One accent color.
- High-contrast charts.
- Minimal motion.
- Strong copy.

Finance use:
- Serious case studies.
- Research-style pages.
- Filing reader pages.
- Advanced lessons.
- Assessment pages.

Concept:
A page can feel creative through restraint, hierarchy, and precision.

---

## Homepage Creative Direction

The homepage should be cinematic and scroll-driven.

Recommended narrative:

1. Markets look chaotic.
2. Price is only the surface.
3. Behind every ticker is a business.
4. The 10-K is the source code.
5. Financial statements show how money moves.
6. Valuation depends on growth, risk, cash flow, and rates.
7. Portfolios change risk through interaction.
8. Macro policy ripples through markets.
9. The course teaches users to decode the market.

The homepage should feel closer to an interactive finance experience than a school website.

Preferred homepage effects:
- Full-screen hero.
- Floating market fragments.
- Scroll-linked transition into a stock chart.
- Chart X-ray into fundamentals.
- Filing annotation preview.
- Money-flow diagram.
- Valuation gravity interaction.
- Portfolio constellation.
- Macro control room.
- Final course-path reveal.

Avoid:
- Generic feature cards.
- Generic “learn finance today” sections.
- Random stock photos.
- Overused blue SaaS gradients.
- Cheap sliders with no conceptual payoff.

---

## Lesson and Module Page Creative Direction

Lessons should not all look the same. Match the interaction style to the concept.

Examples:

### Fixed income
Use:
- Cash-flow timelines.
- Present-value waterfalls.
- Arbitrage scanners.
- Yield curve animation.
- Duration/convexity visuals.
- Price-yield curve interaction.

Avoid:
- Generic cards with coupon definitions only.

### Company analysis
Use:
- 10-K annotation viewer.
- Business model map.
- Revenue segment breakdown.
- Margin bridge.
- Risk-factor highlights.
- Management discussion callouts.

Avoid:
- Static pasted filing excerpts without guidance.

### Valuation
Use:
- Assumption panels.
- Sensitivity tables.
- DCF flow diagrams.
- Valuation gravity.
- Multiple comparison cards.
- Scenario analysis.

Avoid:
- Formula-only explanations.

### Portfolio theory
Use:
- Portfolio constellation.
- Risk-return map.
- Efficient frontier curve.
- Drag-to-allocate assets.
- Correlation heatmap.
- Volatility simulation.

Avoid:
- Abstract definitions with no visual risk model.

### Macro and monetary policy
Use:
- Fed control room.
- Interest-rate lever.
- Yield curve.
- Inflation/unemployment gauges.
- Bond and equity reaction panels.
- Scenario decisions.

Avoid:
- Long text-only macro explanations.

---

## Visual Design Rules

Use a consistent premium finance aesthetic.

Preferred style:
- Dark backgrounds.
- Strong typography.
- Glass or terminal-like surfaces.
- Thin borders.
- Subtle glow.
- Minimal accent colors.
- Data as texture.
- High contrast.
- Smooth but restrained motion.

Suggested visual references:
- Bloomberg Terminal seriousness.
- Game-like simulation interfaces.
- Cinematic scrollytelling.
- Premium interactive case studies.
- Editorial financial graphics.

Color guidance:
- Use dark navy, black, slate, and deep charcoal as base colors.
- Use cyan, green, purple, amber, or red as accents only when they communicate meaning.
- Avoid using too many neon colors at once.
- Avoid childish colors unless the lesson explicitly calls for a lighter tone.

Typography guidance:
- Use large, confident headings.
- Keep section copy short.
- Use labels, badges, and callouts for financial concepts.
- Prioritize readability over visual density.
- **Never use monospace (`font-mono`) typefaces.** This is a hard project rule. The Tailwind `mono` token is deliberately remapped to Inter, and IBM Plex Mono is not loaded. Use Inter (`font-sans`) for all UI, labels, and numeric values — it has tabular figures, so `tabular-nums` still aligns table columns. Use Fraunces (`font-display`) for editorial headlines. Avoid `uppercase` + wide `letter-spacing` on labels; prefer sentence case with `tracking-[0.01em]–[0.02em]`.

---

## Animation Rules

Motion should be smooth, purposeful, and restrained.

Good motion:
- Reveals hierarchy.
- Shows cause and effect.
- Shows sequence over time.
- Makes invisible relationships visible.
- Responds to scroll, hover, keyboard, or input.
- Works on mobile and desktop.

Bad motion:
- Random bouncing.
- Excessive flashing.
- Motion that fights reading.
- Animations that make the page feel like a template.
- Effects that cause scroll jank or layout shift.
- Too many elements moving at once.

Respect reduced-motion preferences where feasible. The page must remain usable if animations are reduced.

---

## Technical Implementation Guidance

Use the existing Next.js, TypeScript, and Tailwind setup.

Preferred implementation tools:
- Motion for React for scroll-linked and reveal animations.
- CSS scroll snap for full-screen section navigation when appropriate.
- CSS transforms, opacity, gradients, masks, and clip-path for lightweight effects.
- SVG for timelines, curves, flow diagrams, and path drawing.
- Recharts or lightweight chart components for simple educational charts.
- Dynamic client-only imports for components that rely on browser APIs.
- WebGL or React Three Fiber only when the effect clearly justifies the dependency.

Avoid adding heavy animation or 3D libraries by default. Use them only for high-impact experiences where ordinary CSS, SVG, and Motion are not enough.

Avoid adding live market APIs unless explicitly requested. Static or mock data is preferred for homepage visuals and lesson concept demos.

---

## Performance Requirements

Creative effects must not make the site slow.

Rules:
- Prefer animating `transform` and `opacity`.
- Avoid repeatedly animating layout-heavy properties such as `width`, `height`, `top`, and `left`.
- Avoid excessive blur, large shadows, and too many animated DOM nodes.
- Lazy-load heavy visual components.
- Keep browser-only visual components isolated.
- Test mobile responsiveness.
- Preserve readability above all else.
- Do not allow decorative effects to block core learning content.

---

## Implementation Behavior

When asked to build or redesign a page, do not produce a plain static page by default.

Before implementing, consider whether the page would benefit from:
- full-screen storytelling,
- vertical or horizontal snap sections,
- sticky scroll narratives,
- scroll-linked chart reveals,
- interactive sliders or assumption panels,
- scenario chips,
- animated diagrams,
- hover annotations,
- filing previews,
- financial data textures,
- keyboard-triggered interactions,
- mouse-responsive backgrounds,
- SVG timeline animation,
- visual metaphors,
- or simulation-style controls.

If a creative visual treatment improves the concept, implement it directly rather than merely describing it.

When building user-facing pages, avoid defaulting to static card grids. First consider whether the concept can be taught through scroll storytelling, interactive diagrams, source-document annotation, financial simulation, or finance-specific visual metaphor. Static cards are acceptable only when they are the clearest option.
