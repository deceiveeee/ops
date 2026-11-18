# Restructure plan: make OPS look designed, not generated

Date: 2026-11-04. Status: phases 0 and 1 built, uncommitted (section 10).
Decisions 1 and 2 were taken as recommended; decisions 3 and 4 come with
phase 5. Measured on the running site (`claude/previews-and-daily-puzzle`,
ca1f58b) at 1440×900 and 390×844.

## 1. In short

Visitors can tell OPS was assembled from a landing-page kit, even though its
content is real (Federal Reserve data, SEC filings, verified 10-K figures).
The kit shows in five places: slogan headings, a pastel palette with too many
colours, decorative props (3D cubes, a coin, a ring, a star), template furniture
(numbered pills, stat rows, "What you'll learn" columns, "Ready to begin?"),
and very long pages.

The fix is to design every page the way the Daily puzzle page is already
designed: like a page from a real annual report. That page draws its text in 2
colours with one faint shadow, and it passes every check on the 30-point list
except "not Inter", which no page can pass while Inter is the body font. The plan
rebuilds the homepage and the course pages in that style, cleans up labels and
colours across lessons and Studio, and adds an automatic check so the template
look cannot creep back.

## 2. What makes it look AI-made today

### Measured page by page

| Page | Height (screens, 1440×900) | Text colours drawn | Shadow kinds | Template signs |
|---|---|---|---|---|
| Homepage | 5.1 (6.9 on a phone) | 37 | 7 | Slogan headings, eyebrow pill, two pill buttons, numbered chapter pills, 3D cubes, gradient coin, ring, ✳ star, rotated "Try it" sticker, pastel closing band |
| Courses | 1.8 | 8 | 0 | H1 and H2 are the same size (43px), "WHAT YOU'LL LEARN" in capitals, stat row, a chart copied from other pages |
| Finance Foundations | **11.2** | 9 | 0 | "COURSE 01" in capitals, background gradient, Hours/Modules/Lessons stat trio, three "What you will…" columns, all 46 lessons laid out at once, centred "Ready to begin?" |
| Investment Foundations | 7.6 | 11 | 1 | Same hero and columns; **13 identical "Open journey" buttons** |
| Studio overview | 1.3 | 24 | 4 | "Your next *move.*" slogan, lavender and lime panels, rotated paper-page drawing |
| A Finance Foundations lesson | 6.0 | 8 | 5 | 21 capitalised, widely spaced labels on one page |
| Daily puzzle | 1.0 | **2** | 1 | None. This is the model. |
| Start (6 questions) | 1.2 | 2 | 0 | None |

### Eight findings, including three the first audit missed

1. **Four colour schemes in one site.** The homepage has its own (cream, indigo,
   lime, lavender: 105 colour values in one stylesheet). The rest of the site uses
   grey and blue (#0066CC). Course pages add teal and amber gradients plus leftover
   classes from the old dark theme. Studio repeats lavender and lime with
   charcoal panels (59 and 83 colour values in its two main stylesheets).
2. **One heading trick everywhere.** A plain line followed by an italic serif
   line appears on 9 headings: five on the homepage, then on Courses, Studio overview,
   Goals and Research.
3. **Three-fragment slogans.** Six times: "See how money works. Try the ideas.
   Build a portfolio…", "Try an idea. Follow the evidence. Make it yours.",
   "Read. Question. Connect.", "Research a business. Build a portfolio. Test
   your assumptions.", "Your pace. Your questions. Your next move.", "A
   question. Some evidence. A decision you can explain." This rhythm is one of the
   strongest tells of generated copy, and the checklist does not cover it.
4. **Props that show no data.** Cubes, a coin with a $ sign, a ring labelled
   "Your thinking.", ripple circles with a %, skewed bars, a 150px ✳, a tilted
   sticker, tilted paper pages. Only the rate chart and the report table are
   real.
5. **The same chart on three pages (missed by the first audit).** The
   interest-rate chart appears on the homepage, the Courses page and the Finance
   Foundations page. The loss-recovery chart appears on two pages. That fails
   the "no same image reused" check, so my re-score of the homepage is
   **73/100**, not 77.
6. **The phone hero is entirely centred (missed).** Below 900px wide, every
   line of the hero is centred, which is the stock mobile template.
7. **One course, two names (missed).** The course is called Investment
   Foundations, but buttons say "Open Portfolio Builder" (Courses page) and "See
   Portfolio Builder" (Finance Foundations page). AGENTS.md requires one name per
   concept. (If "Portfolio Builder" is meant as the course's second name, that is
   a decision for you; the plan assumes one name.)
8. **The project rules describe a look the site no longer has.** AGENTS.md
   still asks for dark backgrounds, glass and glow, and a nine-chapter
   cinematic homepage. The site switched to one light system on 2026-09-09.
   Any agent following AGENTS.md will bring back glass, glow and cyan. Lessons
   still carry about **990 capitalised, widely spaced labels across 257 files**,
   which break AGENTS.md's own typography rule. 27 of the 32 homepage component
   files (4,573 lines) are left over from the old dark homepage, and nothing
   uses them.

## 3. The direction: pages that look like the documents they teach

Template sites have no material of their own, so they decorate. OPS has
material: annual reports, rate tables, cash-flow schedules. The Daily puzzle
already shows the result. It is a redacted report page that clears line by line,
and it reads as a report, not as a quiz built from cards. Make that the house
style:

- **Paper and ink.** One background, white sheets, thin rules between things.
  No floating cards with drop shadows.
- **Numbers look like financial figures.** They are aligned in columns, with
  the unit and date stated and a source line under every real number. The rate
  chart already does this.
- **Headings name what is shown,** the way a report titles its tables: "Banks'
  overnight borrowing rate rose from 0.08% to 5.33% in 19 months", not "Small
  numbers. Big ripple effects."
- **One accent colour.** The blue the site already uses for links and buttons.
  Green, amber and red appear only inside a chart or a result, where they mean
  good, caution or bad.
- **Notes in the margin instead of decoration.** Highlighted lines and side
  notes, as when someone marks up a filing, replace eyebrow pills, numbered
  circles and stickers.
- **Hide the answer until the learner acts.** The puzzle's blacked-out bar
  becomes the site's standard way to say "try it first".

This fits two patterns AGENTS.md already endorses: "Filing as source code" and
"Bold flat minimalism" (one accent colour, large type, restraint).

## 4. The rules every page follows

### Colour
- Use only named site colours (defined once in `app/globals.css` and reused
  everywhere): background #F5F5F7, sheet #FFFFFF, ink #1D1D1F, three greys, the
  blue #0066CC and its pale tint. Good, caution and bad colours are allowed only
  inside data.
- No gradients on backgrounds, buttons or panels. A chart may use a gradient
  only if it encodes a value.
- No colour values typed directly into a page's own stylesheet, except in
  chart files that read the named colours.
- Two shadow kinds only. One for pop-ups (menus, dialogs, tooltips). One faint
  lift for the sheet the learner is working on. The Daily puzzle's sheet shadow
  is the reference.

### Type (decision 2 picks the fonts)
- Recommended: **Fraunces, upright (not italic), for page titles and section
  headings**, and Inter for everything else. Lessons, the Daily puzzle and Start
  already set their titles in Fraunces, so this extends the site's own choice.
- Clear steps between levels. Desktop: 56 / 36 / 24 / 18 / 16px (title,
  section, sub-section, lead, body). Phone: 40 / 30 / 22 / 17 / 16px.
- Headings: line height 1.1 to 1.2, letter spacing −0.015em. Today the hero
  uses −0.065em, the extreme tightness of startup sites. Body text: line height 1.6.
- No italic second line. Italic only for its normal jobs: a title of a work, or
  a term being defined.
- Labels: sentence case, 13px, weight 500, letter spacing 0.01em. No capitals.
- Fraunces only at 24px and above, because it reads poorly when small.

### Words
- A heading says what the section shows or lets you do. If the heading would
  fit on any other website, rewrite it.
- Subtitles are one sentence. No three-fragment slogans. No "Your X. Your Y."
  No reassurance nobody asked for ("You don't need all the answers to begin").
  AGENTS.md already bans that.
- Buttons name the destination or the action: "Find where to start (6
  questions)", "Start lesson 1: What is finance?". At most two per section,
  and only one of them filled.
- Every rewrite reuses a claim the site already makes or a figure already
  verified. No new promises about what a course contains.
- The banned-word list from the checklist, plus "journey" as a button label.

### Layout
- Left-aligned text at every width, phones included.
- No two sections in a row share the same structure.
- Height budgets: homepage at most 3.5 screens at 1440×900 and 5 at 390×844;
  course pages at most 3 screens with one module open. Measured at 390, 768,
  1024, 1280, 1440 and 1920, as AGENTS.md requires.

### Pictures
- Every picture is a chart, a table, a document or a diagram built from real
  numbers or clearly labelled OPS example numbers. No props.
- Each picture lives on one page only.

### Motion
- Keep today's restraint. Movement shows cause and effect: a clue clearing, a
  bar growing. Nothing moves for decoration.

## 5. Page by page

### 5.1 Homepage: four scenes, about 3 screens

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Investing Studio   Courses  Studio  Your plan  Company reports  Daily puzzle │
│                                                              [Open Studio]   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1  Learn investing, then practice     ┌ Today's company · Form 10-K ───────┐ │
│    on real company reports.           │ ██████████████  (name hidden)      │ │
│                                       │ 1 How much it sells   $11.9 billion│ │
│    Interactive lessons, a daily       │ 2 What it keeps       ▒▒▒▒▒▒▒▒▒▒   │ │
│    company puzzle and a workspace     │ 3 What it owns        ▒▒▒▒▒▒▒▒▒▒   │ │
│    for building your own portfolio.   │ [Show the next clue] [Guess ____]  │ │
│    [Find where to start · 6 questions]│ Source: the company's 10-K         │ │
│    See both courses →  Free. No account.└────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2  Banks' overnight borrowing rate rose from 0.08% to 5.33% in 19 months     │
│    [ full-width chart, Jan 2022 – Dec 2024, three marked values ]            │
│    Higher rates generally make borrowing more expensive…  Source: Fed H.15   │
│    Interest rates and bond prices → (Finance Foundations)                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3  Two courses, a workspace and a daily puzzle                               │
│    Finance Foundations ··· value, time and risk · 9 modules, 46 lessons   →  │
│    Investment Foundations ··· 13 decisions, one portfolio plan             →  │
│    Studio ··· research a business, build a portfolio, test assumptions     →  │
│    Daily puzzle ··· six clues from one annual report, a new one each day   →  │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4  Not sure which course fits? Answer 6 questions.   [Find where to start]   │
└──────────────────────────────────────────────────────────────────────────────┘
```
(The wireframe's figure is an example from puzzle #1. The real panel shows
whichever puzzle is running.)

- **Scene 1: open a real report (decision 1).** The left side says in one line
  what the site is, with one filled button. The right side is today's Daily
  puzzle page, built from the existing puzzle components and data. Every figure
  in it is already verified against the company's XBRL data file and its
  printed 10-K. A visitor can do something real before scrolling. The single
  Atkore example leaves the homepage, in line with the "any company, not one
  example" rule. When no puzzle is running, the panel shows a past puzzle.
- **Scene 2: one real market figure, shown full width.** The rate chart moves
  out of its tinted box and drops its extra heading, tag and ripple drawing. The
  heading is the finding itself. The explanation sentence is the chart's
  existing, reviewed sentence.
- **Scene 3: a contents list instead of cards.** It reads like a report's
  table of contents: four ruled rows, each with a name, one sentence and a
  link. It replaces the two course cards (coin and ring art), the Studio strip
  and the "01 / 02 / 03" principles strip.
- **Scene 4: one closing line.** It replaces the lime band, the star and the
  slogan.
- **What goes:** eyebrow pills, numbered chapter circles, "There's more beneath
  the numbers", the cubes, coin, ring, ripple, bars, ✳, the tilted sticker,
  the dark evidence band, the pastel bands. Two of the three "Open Studio"
  buttons also go; the one in the header stays.
- **The $100 experiment** moves to the Finance Foundations page (5.3), redrawn
  as a year-by-year table instead of cubes. Time value is that course's first
  idea.

| Where | Now | Proposed |
|---|---|---|
| Title | Your money. *Your move.* | Learn investing, then practice on real company reports. (Changed while building: lessons also use OPS example numbers, so "learn from real reports" overclaimed.) |
| Sentence | See how money works. Try the ideas. Build a portfolio you can explain. | Interactive lessons, a daily company puzzle and a workspace for building your own portfolio. |
| Buttons | Explore courses · Open Studio | Find where to start (6 questions) · See both courses (text link) |
| Strip | 01 Try an idea. 02 Follow the evidence. 03 Make it yours. | removed |
| Scene 2 heading | Small numbers. *Big ripple effects.* | Banks' overnight borrowing rate rose from 0.08% to 5.33% in 19 months |
| Scene 2 sentence | Interest rates show up in the news. And in the cost of a car, a home, or an idea. | Higher interest rates generally make borrowing more expensive, which can slow spending and investment. (the chart's existing sentence) |
| Scene 2 links | Understand the forces · Explore why ↗ | Interest rates and bond prices (Finance Foundations; confirm the target lesson while building) · How the Fed sets this rate ↗ |
| Evidence | Every number has a *backstory.* (Atkore) | merged into scene 1 |
| Paths | A curious mind. *A place to start.* | Two courses, a workspace and a daily puzzle |
| Closing | You don't need all the answers to begin. Just a little *curiosity.* | Not sure which course fits? Answer 6 questions. |

The rate figures were checked against `data/marketing/teachingVisuals.ts`:
0.08% in January 2022, 5.33% in August 2023, 19 months apart.

### 5.2 Courses list

- Title: "Courses", with one sentence: "Start with Finance Foundations, then use
  it to build a portfolio in Investment Foundations." The page already makes
  this claim.
- The two tall cards (each with a chart borrowed from another page and a stat
  row) become a two-row comparison: course, what you will be able to do, size,
  and first step. It is a table on desktop and stacked rows on a phone.
- Fix the same-size headings, the capitalised label and the second course name
  ("Open Portfolio Builder" becomes "Start Investment Foundations").

### 5.3 The two course pages

- **Top:** the title, one sentence and one plain metadata line ("9 modules · 46
  lessons · about 40 hours") instead of three giant numbers. One filled button
  names the first step ("Start lesson 1: What is finance?"). Beside it sits the
  course's own opening exercise: the $100 table for Finance Foundations, the
  loss-recovery chart for Investment Foundations. The rate chart no longer
  appears here.
- **Remove:** "COURSE 01", the background gradient, the dotted flow drawing
  (its sequence stays as a plain line of text), and the closing "Ready to
  begin?" band.
- **Three columns become one list,** "By the end you can", with three points
  taken from the current "What you will learn" points.
- **Fold the curriculum.** Modules show as one row each: number, title, lesson
  count and progress. One module opens at a time, the learner's current one by
  default. Finance Foundations drops from 11.2 screens to about 3.
- **Investment Foundations:** the 13 "Open journey" buttons become rows whose
  link is the mission's own title.
- Replace the leftover dark-theme classes on these pages with the named colours.

### 5.4 Studio (after Codex's Portfolio work lands)

- Overview: "Your next *move.*" becomes "Your investing workspace" (today's
  eyebrow text). Drop the three-fragment line and the rotated paper drawing.
- Goals: "Give the money a *job.*" becomes "Your goal and limits", the settled
  term in AGENTS.md. Research: "Research what you might *buy.*" becomes
  "Research a company or fund".
- Move the lavender, lime and charcoal panels to the named colours. Keep every
  layout: the screen-budget work there is done and tested.
- Codex's preview branch writes to the Portfolio pages and `lib/studio.ts`.
  This step touches only the overview, Goals and Research headings and their
  two stylesheets, and starts after that branch is merged or released.

### 5.5 Lessons: labels and frames only

- Convert the ~990 capitalised labels to sentence case with 0.01em spacing in
  one mechanical pass. The text inside the page does not change, so tests that
  look for words keep working. The lesson typography check must still pass.
- Lesson panels lose their drop shadow and use a thin border instead. The cyan
  top edge on interactive panels becomes the blue accent.
- No lesson content or structure changes here. Those are governed by the
  learning-logic and source rules and belong to lesson work.

### 5.6 Header, footer, link previews

- Header: unchanged. Its "Open Studio" becomes the only one on the homepage.
- Footer: unchanged. Its height is load-bearing for 14 Studio screen-budget
  tests.
- Link-preview card: its line already matches the new direction. Optionally
  align it with the new homepage title.

## 6. Keeping it from coming back

1. **Rewrite two sections of AGENTS.md** (decision 3). "Visual Design Rules"
   would describe the light document style in section 4, replacing dark, glass
   and glow. "Homepage Creative Direction" would describe the four scenes,
   which keep its story order (a business behind the price, the report as the
   source, rates moving markets, the course path) in about 3 screens instead of
   nine full-screen chapters.
2. **An automatic design check that can fail.**
   - A source scan, run with the unit tests, fails on: capitals with spacing
     above 0.02em, `<em>` inside page and section titles, gradients outside
     charts, typed colour values outside the colour file and chart files,
     and the banned words.
   - A page check, run with the browser tests at 390 and 1440, fails when
     a page shows more than 8 text colours, more than 2 shadow kinds, or
     exceeds its height budget.
   - It starts in report-only mode, so lessons do not block other work. Each
     page is switched to enforced once its phase lands.
   - Before trusting it, run it against today's homepage and confirm it fails.
3. **Delete the 27 unused homepage files** (4,573 lines, decision 4),
   after a build and a search confirm nothing imports them.

## 7. Order of work

Each phase is its own reviewable change. Nothing is committed unless you ask.

| Phase | What changes | Main files | Checks before calling it done |
|---|---|---|---|
| 0 | Design check in report-only mode; named colours confirmed | new test files; `app/globals.css` (shared, claimed first) | Check fails on today's homepage |
| 1 | Homepage | `components/marketing/HomePage.tsx`, `homepage.module.css`, `MoneyTimeExperiment.tsx`; reuses `components/daily/*` read-only; rewrites `e2e/visual-refresh.spec.ts` | Six widths within budget; full e2e; 30-point re-audit; visual-audit skill |
| 2 | Courses list and both course pages; one course name | `app/(learning)/courses/**`, `components/courses/*` | Six widths; full e2e (copy changes affect tests) |
| 3 | Site-wide headings and labels; lesson frames | `app/globals.css`, ~257 lesson files | Lesson typography gate; full e2e, rerunning the known flaky Studio specs |
| 4 | Studio headings and colours | three workspace files, two stylesheets | Studio e2e and screen budgets |
| 5 | AGENTS.md sections, check enforced, unused files removed | `AGENTS.md`, test config, `components/marketing/*` | Build, type check, full e2e |

Target homepage score on the 30-point list: about 97/100 with recommended fonts
(the "not Inter" item stays failed because Inter remains the body font), or 100
if you replace Inter. These are targets, not measurements. Each phase re-scores
the pages it touched.

## 8. Decisions needed from you

1. **Homepage opening.** Recommended: today's Daily puzzle report page, which
   is unique to OPS, real, and gives people a reason to come back.
   Alternative: the $100 experiment, as the first audit suggested. It is
   already built, but a compound-interest toy is common on finance sites.
2. **Fonts.** Recommended: Fraunces (upright) for titles, Inter for everything
   else. This keeps AGENTS.md's font rule and the tested type sizes.
   Alternative: replace Inter with another sans-serif. That clears the
   checklist item but means re-checking typography on every page.
3. **Rewrite the AGENTS.md visual and homepage sections** (section 6.1). They
   are your file, and you have uncommitted edits in it, so I will not touch them
   without a yes.
4. **Delete the 27 unused homepage files.** Or keep a few as reference.
   `CompanyXray` and `FilingReaderTeaser` hold ideas worth reusing elsewhere.

## 9. Risks and limits

- The puzzle schedule starts on 2026-11-03 and has 35 puzzles, so the last
  new one runs on 2026-12-07. After that the homepage panel needs either more
  puzzles or the past-puzzle fallback.
- Today's puzzle depends on the date. The server picks it, because the
  catalog holds the answers to puzzles that have not opened yet and only the one
  shown may reach the browser. The page is cached for 60 seconds, so for at
  most the first minute after midnight in New York it still shows yesterday's.
- I measured with scripts. Screenshots below the first screen did not render
  because the browser pane was hidden, so the visual judgements in section 2
  rest on the measurements, the code and the first audit's screenshots.
- The 30-point list is a smoke test, not the goal. Several of its items
  conflict with deliberate choices (Inter). The aim is a site that looks
  designed for finance, and that should be judged by eye at six widths after
  each phase.

## 10. Progress

### Phase 0: design check (done)

- `lib/design-check/scan.ts` checks source files for capitals, gradients and
  typed-in colours. Its tests plant each defect and confirm it is caught; files
  already rebuilt are listed in `lib/design-check/scan.test.ts` and must stay
  clean.
- `e2e/design-check.spec.ts` checks the rendered page: height budget, text
  colours (at most 8), shadow kinds (at most 2), capitals, italic heading parts,
  gradient surfaces, centred text, banned words, three-fragment runs and "Your X.
  Your Y." slogans. The homepage is enforced at 1440×900 and 390×844. Other pages
  are measured with `DESIGN_REPORT=1` and reported, not failed.
- Both halves failed on the old homepage before it was touched: 5.06 and 6.87
  screens, 37 text colours, 6 shadow kinds, 5 italic headings, a centred phone
  hero, six fragment runs and two "Your X. Your Y." slogans.
- Known limit: the fragment rule is a heuristic. It flags Studio's three-line
  disclaimer ("Saved in this browser only. Educational planning, not investment
  advice. No orders are ever sent."), which is a list of facts, not a slogan.

Baseline for later phases (report mode, 2026-11-04):

| Page | Screens 1440 / 390 | Main findings |
|---|---|---|
| Courses | 1.79 / 3.82 | capitals, italic heading |
| Finance Foundations | 11.21 / 15.06 | capitals ×12, background gradient, centred text, 9 text colours |
| Investment Foundations | 7.62 / 13.83 | capitals, gradient, centred text, 11 text colours, "journey" |
| Studio overview | 1.25 / 1.50 | 24 text colours, 3 shadow kinds, italic heading |
| A Finance Foundations lesson | 5.95 / 10.46 | capitals ×21, gradient panels |
| Daily puzzle, Start | about 1 to 1.4 | none |

### Phase 1: homepage (done, uncommitted)

- Four parts as in 5.1: the live daily puzzle beside the title, the rate figure
  with margin notes, the contents list, and one closing line.
- The server picks today's puzzle and passes only that one to the browser.
  Progress is shared with /daily, so a game started on the homepage continues
  there.
- `DailyPuzzleView` takes `layout="stacked"` for the homepage column; /daily is
  unchanged. On phones the "What this means" toggles are now 44px tall.
- The rate chart's outside link reads "How the Fed sets this rate".
- `MoneyTimeExperiment` is no longer on the homepage. Phase 2 moves it to the
  Finance Foundations page.

Measured on the dev server, with every puzzle state (fresh, all clues, finished)
at six widths:

| Width | Fresh | All clues | Finished |
|---|---|---|---|
| 390 | 4.22 | 4.28 | 4.38 |
| 768 | 3.46 | 3.49 | 3.62 |
| 1024 | 2.96 | 3.46 | 3.57 |
| 1280 | 2.89 | 3.31 | 3.44 |
| 1440 | 2.83 | 3.27 | 3.40 |
| 1920 | 2.83 | 3.27 | 3.40 |

Screens are measured at 900px tall. No sideways scrolling at any width.
Smallest text is 12px; weakest contrast is 4.83:1.

Re-score on the 30-point list: about 93/100. Colours, Layout, Copy and UX
score 100. Typography is 80, because Inter is the body font by choice. Images
are 80, because the rate chart still also appears on the Courses and Finance
Foundations pages; phase 2 removes it from both, which takes the score to
about 97.

Checks run (2026-11-04, on the shared `next dev` server on port 3200):

- Type check clean. Lint clean on the changed files. Unit tests: 100 files, 1,317
  tests pass, after updating one test that named the old link text.
- Full browser suite: 270 passed and 25 failed on the first run. Every failure
  was retried on its own:
  - 15 passed on the retry. They had timed out or lost their page while the dev
    server recompiled; CSS was being edited during the run.
  - 10 still fail. All are company-report tests, and they fail because the
    shared dev server was started without `OPS_EDGAR_FIXTURE_DIR`, so its SEC
    search returns "No other company at the SEC matches 'atkore'" instead of
    reading the test fixtures. None of these tests uses a changed file.
- Not run: the production build and the suite on its own server. A build would
  rewrite `.next`, which the port 3200 dev server is using, and that server
  belongs to another chat.
- Update, same day: with your go-ahead the port 3200 dev server was stopped.
  The production build and the full browser suite then ran on Playwright's own
  server (port 3301): **295 passed, 0 failed**. 19 were skipped: the 14
  report-only design checks plus tests that are skipped by default. The 10
  company-report tests pass on the saved test copies. The homepage builds as a
  cached page refreshed every 60 seconds.

### Phase 2: the Courses list and both course pages (done, uncommitted)

What changed for a visitor:

- **Courses list:** a two-row table instead of two tall cards. The columns are
  Course, By the end you can, Size and First step. Each first step is a named
  button: "Start lesson 1" and "Start mission 1". The borrowed charts are gone.
  So is the second course name: "Open Portfolio Builder" is now "Start mission 1".
- **Course pages, first screen:** the title, one sentence and one plain line of
  facts ("9 modules · 46 lessons · About 40 hours"). There is one filled button
  for the first step, a "By the end you can" list and the course's source line.
  Beside them sits the course's own exercise:
  - Finance Foundations: the $100 example, now a ten-year table where you
    choose 2%, 5% or 8% and watch each year's growth get larger.
  - Investment Foundations: the loss-recovery chart.
- **Removed:** "COURSE 01" capitals, background gradients, the stat trio, the
  dotted flow drawing, the three "What you will…" columns, the sticky module
  rail and the centred "Ready to begin?" band.
- **Finance Foundations curriculum:** folded to one ruled row per module, one
  open at a time. The learner's current module opens by itself (the first part
  done, or the one after the last finished). A link to `#module-3` opens module
  3; the homepage's bond link uses it.
- **Investment Foundations missions:** each mission's title is its link,
  replacing the 13 "Open journey" buttons. Its question opens what it covers,
  with one mission open at a time. Plain state words replace "Filed", "Scanning",
  "Ahead" and "Awaiting source gate". Each mission's details name its source as
  "sessions 1–3 of Damodaran's Investment Philosophies course".
- **The rate chart** now appears on the homepage only, and the loss-recovery
  chart on the Investment Foundations page only.

Heights in screens at 900px tall, with the tallest state being the largest
module open or a mission's details open:

| Page | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Courses | 1.80 | 1.27 | 1.08 | 1.02 | 1.00 | 1.00 |
| Finance Foundations (fresh / tallest) | 3.88 / 3.98 | 3.09 / 3.25 | 2.59 / 2.75 | 2.57 / 2.73 | 2.57 / 2.73 | 2.57 / 2.73 |
| Investment Foundations (fresh / tallest) | 4.00 / 4.29 | 2.99 / 3.15 | 2.56 / 2.72 | 2.59 / 2.70 | 2.58 / 2.69 | 2.58 / 2.69 |

Before: Finance Foundations 11.21 / 15.06 and Investment Foundations 7.62 /
13.83 screens at 1440 / 390.

- No sideways scrolling. Smallest text is 12px; weakest contrast is 4.88:1.
- Every control is at least 44px tall. The Courses list buttons were 43px until
  they were fixed.
- The design check now enforces all three pages: at most 1.5 and 3 screens for
  Courses, 3 and 6 for each course page, at 1440 and 390. All the touched files
  are on the source check's list.
- The $100 table has its own unit test, checked against hand-worked values
  (100 × 1.05¹⁰ = $162.89, and so on).
- With the rate chart now only on the homepage, the homepage scores about
  97/100 on the 30 checks. Inter as the body font is the only item that fails.

Left in place for the phase 5 deletion decision: `CourseCard`, `CourseRail`,
`ModuleSection`, `LessonRow` and `MoneyTimeExperiment`, which nothing renders
now. Noticed, not changed: module 1's description still says "Open Portfolio
Studio", the old site name, where the site is now "Investing Studio".

Checks run for phase 2 (production build, Playwright's own server on port 3301):

- Type check and lint clean. Unit tests: 101 files, 1,326 tests pass.
- Full browser suite: 302 passed, 1 failed, 13 skipped. The failure was the
  Studio reader keeping a whole paragraph instead of the selected words "PVC
  resin", a known load-sensitive spec that no changed file touches. On its own,
  rerun on a fresh production build, all 14 reader tests pass.
- `e2e/progress.spec.ts` now opens module 3 before clicking its lesson, because
  modules are folded. Two new tests in `e2e/visual-refresh.spec.ts` cover the
  homepage's link landing on module 3 and the one-open-at-a-time folding.

### Phase 3: labels and lesson frames (done, uncommitted)

What changed for a visitor:

- **No capital-letter labels left in lessons.** One mechanical pass changed
  1,032 lines in 241 files, one line for one line. It dropped the capitals,
  set letter spacing to 0.01em, and raised 443 labels from 9 to 11px to 12px,
  the project's own floor. Only style classes changed, never the words, so
  tests that look for text are unaffected.
- **Labels capitalised in code** were also fixed:
  - The metrics lens now reads NPV, IRR, Payback, EPS and ROIC; "PAYBACK" was
    a word, not an acronym.
  - The bond market cards read Treasury, Agency, Corporate, Municipal, MBS and
    Derivatives.
  - The cards' cryptic "liq L · cx M · def H" became "Liquidity: Low ·
    Complexity: Medium · Default risk: High" on its own line.
- **Maths labels read correctly now.** Capitals had been turning symbols into
  different symbols, for example σ_i into Σ_I.
- **Labels that read as broken once lowercase** were capitalised where they are
  written: Soon, Locked, Empty, Required, Tap to view / ✓ Viewed, Pool and
  Securitize, and the three finance-lens tag lists. Annotations inside charts
  and diagrams ("price today", "year 1", "first loss") stay lowercase. That is
  the ordinary editorial style for a chart note, and there are 36 of them.
- **Lesson side rails:** the ten module rails' "Module 1", "5 lessons" and
  lesson numbers went from 10 to 11px to 12px.
- **Panels:** lesson panels lost their drop shadows and are flat sheets with a
  thin border. Interactive panels carry a solid 2px blue top edge instead of a
  faded cyan line. Definition cards are edged in the blue accent instead of
  teal. These are four shared rules in `app/globals.css`.

Checks:

- Every published lesson (75) was scanned on a production build at 1440:
  no capitals left, and no label now reads as broken in lowercase.
- Finance Foundations lesson 1 is 5.96 screens tall, against 5.95 before.
- A new unit test fails if the capital-letter style class appears in any
  rendered file. Studio (phase 4) and the unused files (phase 5) are excepted.

Found, not changed (each is its own piece of work):

- **36 of the 75 lessons are over 10 screens tall** at 1440×900. The three
  longest fixed-income lessons run 37 to 41 screens. AGENTS.md says a lesson step
  is a screen, not a scroll. These are the old long-scroll lessons, and fixing
  them is lesson redesign, which the learning-logic and source rules govern.
- **About 93 lesson files carry their own gradient washes** (hero glows,
  coloured card tints) and their own purple, teal and amber palettes. Removing
  them is lesson-by-lesson work.
- **One lesson** (spot rates and forward rates) has a white glow shadow left
  over from the dark theme.
- **Text under 12px is still common in Finance Foundations lessons:** 912
  style classes at 9 to 11px across 194 lesson files, plus 64 small font sizes
  inside SVG diagrams. All 46 Finance Foundations lessons show some, for example
  "Source Basis", section numbers "01" and "02", and "Ready". The 12px floor is
  enforced only on Investment Foundations lessons, which the typography gate
  walks. Raising the rest needs a check of each diagram and table, so it is not
  part of this mechanical pass.

Phase 3 test results (production build, Playwright's own server on 3301):
unit tests 101 files and 1,328 tests pass; browser suite 303 passed, 0 failed,
13 skipped, including the typography gate over all 29 Investment Foundations
lessons.
