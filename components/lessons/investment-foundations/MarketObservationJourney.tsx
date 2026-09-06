"use client";

import { useMemo, useState } from "react";
import ValuationJourneyShell, {
  type ValuationStage,
} from "./ValuationJourneyShell";
import ChoiceGroup from "./ChoiceGroup";
import {
  EMPTY_OBSERVATION_NOTE,
  isObservationNoteComplete,
  useIFProgress,
  type MarketObservationNote,
} from "@/lib/if-progress";

const LESSON_SLUG = "if-1-1-how-an-investor-builds-a-philosophy";

/**
 * Mission 2, rebuilt as an evidence desk.
 *
 * The previous lesson taught the shape of a market belief through other people's
 * reasoning for four stages and then handed the learner a blank field, with a
 * placeholder that stated a named anomaly in expert language. A novice either
 * froze or copied it, and the copy reached the plan as though it were their
 * own decision. The rebuild is recorded in
 * `docs/lesson-plans/if-1-1-real-market-cases-design-brief.md`, and the mission's
 * artifact was moved from a Market Belief Statement to a Market Observation Note
 * by curriculum amendment 1.
 *
 * Every figure below is quoted from a primary source retrieved on 2026-08-24 and
 * recorded in the brief's Gate A table. Price reactions are stated as bands
 * rather than percentages: no exchange-published archive of the daily closes was
 * reachable, and this lesson forbids reasoning from the size of a move anyway.
 *
 * Stage-completion behaviour, declared for the typography gate's stage walker.
 *
 * Every stage completes through its own primary control. Stages 1 to 5 each gate
 * on a correct reading, which is the point of an evidence lesson, and every one
 * of them explains the miss rather than only refusing to advance. The stage-6
 * reset is deliberately named "Reset this case": the walker excludes controls
 * whose label begins with reset, and without that it clicked the case switcher
 * forever, destroying the answer it had just built.
 */
const STAGES: readonly ValuationStage[] = [
  {
    label: "Desk",
    title: "You do not need an opinion yet",
    guide:
      "Your job here is to read what a company disclosed, observe how the market responded, and separate what the evidence shows from what it does not. Nothing in this lesson asks you what you believe.",
    instruction: "Learn the three objects, then classify the source note.",
    next: "Continue to the first case",
  },
  {
    label: "Netflix",
    title: "A company can grow and still disappoint",
    guide:
      "This is the worked case. Read the filing before you see what the market did — the order matters, because knowing the answer makes every fact look like it pointed there.",
    instruction: "Sort the disclosed facts, then read the response.",
    next: "Continue to the second case",
  },
  {
    label: "NVIDIA",
    title: "The most important line may be about next quarter",
    guide:
      "The same shape, with the sign reversed. One of these lines moved expectations far more than the others, and it is not the one describing the quarter just finished.",
    instruction: "Choose the line that changed expectations, then the direction.",
    next: "Continue to the third case",
  },
  {
    label: "GameStop",
    title: "Some moves have several causes at once",
    guide:
      "No worked answer this time. The regulator who studied this episode declined to name one cause, and the most defensible thing you can say is narrower than the story you have probably heard.",
    instruction: "Choose the most defensible statement, then name what is missing.",
    next: "Continue to the comparison",
  },
  {
    label: "Compare",
    title: "Three cases, and what they cannot show",
    guide:
      "Three events can illustrate a mechanism. They cannot establish that it repeats, survives costs, or supports a strategy. Sorting the claims is how you keep those apart.",
    instruction: "Sort all four claims.",
    next: "Continue to your note",
  },
  {
    label: "Note",
    title: "Record what you observed",
    guide:
      "This is what Mission 2 saves. Not a belief — an observation you could defend, and an honest statement of what it does not settle.",
    instruction: "Choose a case and answer all three questions.",
    next: "Continue to the boundary",
  },
  {
    /*
     * Split from the note stage rather than sealed inside a scroll box. The
     * note's three questions plus the boundary question and the save ran to 2.06
     * screens at 1440 against a 1.5 limit, and AGENTS.md fixes an overrunning
     * stage by splitting it.
     */
    label: "Boundary",
    title: "Is that enough for a belief?",
    guide:
      "One more question, and it is the one the mission exists to ask. Three cases is not a sample, and saying so is the finding rather than a failure to decide.",
    instruction: "Answer, then save the note.",
    next: "Return to Investment Foundations",
  },
];

const BTN =
  "min-h-11 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-default disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40";

function SourceLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="ops-caption mt-3 text-[12px] leading-5 text-slate-400">
      {children}
    </p>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/8 py-2 first:border-t-0 sm:flex sm:gap-4">
      <dt className="text-[14px] text-slate-400 sm:w-52 sm:flex-shrink-0">{term}</dt>
      <dd className="text-[15px] leading-7 text-white">{children}</dd>
    </div>
  );
}

/** Reveal panel used after the learner has committed to a reading. */
function Response({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-accent-amber/40 bg-accent-amber/10 p-4 text-[15px] leading-7 text-white">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 1 — the three objects a case is made of.
// ---------------------------------------------------------------------------

const SOURCE_KIND = [
  { id: "filing" as const, label: "A company's own filing", hint: "Published by the company to the regulator." },
  { id: "news" as const, label: "A news article", hint: "Someone's account of what happened." },
  { id: "opinion" as const, label: "An analyst's opinion", hint: "A view about what it means." },
];

const BOUNDARY = [
  { id: "illustrate" as const, label: "It can illustrate how something worked once", hint: "The honest reading." },
  { id: "prove" as const, label: "It can prove the pattern repeats", hint: "One case cannot do this." },
  { id: "strategy" as const, label: "It can support a trading strategy", hint: "That needs a sample, costs and risk adjustment." },
];

// ---------------------------------------------------------------------------
// Stage 2 — Netflix, April 19 2022. Every figure quoted from the shareholder
// letter filed as Exhibit 99.1 to that day's Form 8-K.
// ---------------------------------------------------------------------------

const NFLX_FACTS = [
  { id: "revenue", label: "Revenue of $7.868 billion, up 9.8% on the year", kind: "past" as const },
  { id: "members", label: "Global Streaming Paid Memberships of 221.64 million", kind: "current" as const },
  { id: "netadds", label: "Paid net additions of −0.20 million, against the company's own guidance of +2.5 million", kind: "current" as const },
  { id: "forecast", label: "A forecast of −2.0 million paid net additions for the next quarter", kind: "forward" as const },
];

const FACT_KINDS = [
  { id: "past" as const, label: "A past result" },
  { id: "current" as const, label: "A current condition" },
  { id: "forward" as const, label: "A forward expectation" },
];

/**
 * One question rather than three verdicts.
 *
 * Sorting three claims across three verdicts is nine controls, and it put this
 * stage over the screen budget after the reveal. Asking which single claim
 * survives tests the same discrimination in a third of the height, and reads as
 * a sharper question.
 */
const NFLX_SORT = [
  { id: "weaker", label: "Investors received materially weaker information about future growth" },
  { id: "overreaction", label: "The fall was an overreaction" },
  { id: "cheap", label: "The fall made the shares cheap" },
];

// ---------------------------------------------------------------------------
// Stage 3 — NVIDIA, May 24 2023. Quoted from the Q1 FY2024 results release.
// ---------------------------------------------------------------------------

const NVDA_LINES = [
  { id: "revenue", label: "Revenue of $7.19 billion, down 13% on the year", hint: "The quarter just finished." },
  { id: "qoq", label: "Up 19% on the previous quarter", hint: "Still backward-looking." },
  { id: "datacenter", label: "Record Data Center revenue of $4.28 billion", hint: "A record, and still a past result." },
  { id: "outlook", label: "Next quarter's revenue expected to be $11.00 billion, plus or minus 2%", hint: "The only line about the future." },
];

const DIRECTION = [
  { id: "better" as const, label: "More favourable than before" },
  { id: "worse" as const, label: "Less favourable than before" },
  { id: "unknown" as const, label: "Not enough information to say" },
];

// ---------------------------------------------------------------------------
// Stage 4 — GameStop, January 2021. Quoted from the SEC staff report.
// ---------------------------------------------------------------------------

const GME_CAUSE = [
  {
    id: "board",
    label: "The January 11 board announcement explains the whole move",
    hint: "One announcement, a 1,600% move over sixteen days.",
  },
  {
    id: "squeeze",
    label: "Short covering explains the whole move",
    hint: "The most repeated explanation.",
  },
  {
    id: "several",
    label: "Several documented forces coincided, and this evidence does not isolate one complete cause",
    hint: "The narrowest reading the report supports.",
  },
];

const GME_MISSING = [
  { id: "sample", label: "Other episodes with the same conditions", hint: "One case cannot show a pattern." },
  { id: "flow", label: "Who was buying, and in what size, day by day" },
  { id: "counterfactual", label: "What the price would have done without the attention" },
];

// ---------------------------------------------------------------------------
// Stage 5 — the comparison.
// ---------------------------------------------------------------------------

const CLAIMS = [
  {
    id: "expectations",
    label: "Prices respond to changes in what investors expect, not only to what was reported",
    answer: "supported" as const,
  },
  {
    id: "guidance",
    label: "A forward outlook can matter more than the quarter just reported",
    answer: "supported" as const,
  },
  {
    id: "attention",
    label: "Social attention is a reliable signal you could trade on",
    answer: "not-established" as const,
  },
  {
    id: "underreaction",
    label: "Investors systematically revise their expectations too slowly",
    answer: "not-established" as const,
  },
];

const VERDICTS = [
  { id: "supported" as const, label: "Supported by these cases" },
  { id: "plausible" as const, label: "Plausible, not shown here" },
  { id: "not-established" as const, label: "Not established by these cases" },
];

// ---------------------------------------------------------------------------
// Stage 6 — the note.
// ---------------------------------------------------------------------------

const NOTE_CASES = [
  { id: "netflix" as const, label: "Netflix, April 2022", hint: "Growth continued; expectations fell." },
  { id: "nvidia" as const, label: "NVIDIA, May 2023", hint: "The quarter was weaker; the outlook was not." },
  { id: "gamestop" as const, label: "GameStop, January 2021", hint: "Several forces at once." },
];

const DISCLOSURES: Record<string, { disclosure: string; priceResponse: string }> = {
  netflix: {
    disclosure:
      "Netflix reported revenue growth of 9.8% alongside paid net additions of −0.20 million, against its own guidance of +2.5 million, and forecast −2.0 million for the next quarter.",
    priceResponse: "The shares fell by roughly a third in the next regular session.",
  },
  nvidia: {
    disclosure:
      "NVIDIA reported revenue down 13% on the year and guided to $11.00 billion, plus or minus 2%, for the next quarter.",
    priceResponse: "The shares rose by roughly a quarter in the next regular session.",
  },
  gamestop: {
    disclosure:
      "GameStop announced a board appointment on January 11, 2021, amid high short interest, heavy volume and sustained public attention.",
    priceResponse:
      "The closing price rose from $19.95 to $31.40 on January 13 and to $347.51 by January 27.",
  },
};

const INTERPRETATIONS = [
  { id: "expectations", label: "What investors expected changed, and the price moved with it" },
  { id: "several", label: "Several forces coincided and this case does not isolate one" },
  { id: "none", label: "I cannot state a narrow explanation this case supports" },
];

const UNCERTAINTIES = [
  { id: "repeat", label: "It does not show the pattern repeats" },
  { id: "size", label: "It does not show the size of the move was right" },
  { id: "costs", label: "It does not show anything would survive trading costs" },
];

const NEXT_EVIDENCE = [
  { id: "sample", label: "More events, not just memorable ones" },
  { id: "benchmark", label: "A comparison against expected market returns" },
  { id: "risk", label: "Risk adjustment and realistic costs" },
  { id: "horizon", label: "A longer horizon" },
];

export default function MarketObservationJourney() {
  const { observationNote, saveObservationNote } = useIFProgress();

  const [note, setNote] = useState<MarketObservationNote>(EMPTY_OBSERVATION_NOTE);
  const [saved, setSaved] = useState(false);

  // Stage-local answers. None of these reach the plan; only the note does.
  const [sourceKind, setSourceKind] = useState("");
  const [boundary, setBoundary] = useState("");
  const [factKinds, setFactKinds] = useState<Record<string, string>>({});
  const [nflxRevealed, setNflxRevealed] = useState(false);
  const [nflxSort, setNflxSort] = useState<Record<string, string>>({});
  const [nvdaLine, setNvdaLine] = useState("");
  const [nvdaDirection, setNvdaDirection] = useState("");
  const [nvdaRevealed, setNvdaRevealed] = useState(false);
  const [gmeCause, setGmeCause] = useState("");
  const [gmeMissing, setGmeMissing] = useState("");
  const [claims, setClaims] = useState<Record<string, string>>({});
  const [declined, setDeclined] = useState(false);

  const set = (patch: Partial<MarketObservationNote>) => setNote({ ...note, ...patch });

  const claimsCorrect = useMemo(
    () => CLAIMS.every((c) => claims[c.id] === c.answer),
    [claims],
  );

  const noteReady = isObservationNoteComplete(note);

  const renderStage = (stage: number, onComplete: () => void) => {
    // ---- 0 the evidence desk --------------------------------------------
    if (stage === 0) {
      const ready = sourceKind === "filing" && boundary === "illustrate";
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              Three things, kept apart
            </h3>
            <dl className="mt-3">
              <Fact term="Event">
                Dated information that reached the market. A filing, an
                announcement, a disclosure.
              </Fact>
              <Fact term="Price response">
                What the price did after that information became public.
              </Fact>
              <Fact term="Inference">
                A possible explanation connecting the two. This is the part that
                is yours, and the part that can be wrong.
              </Fact>
            </dl>
            <p className="mt-3 text-[15px] leading-7 text-slate-300">
              One event can illustrate how something worked. It cannot show that
              it repeats, that it survives risk and costs, or that it supports a
              strategy.
            </p>
          </div>

          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              A source note from the first case
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-slate-300">
              &ldquo;Netflix, Inc. — Form 8-K and Q1 2022 shareholder letter, filed
              April 19, 2022, after the regular market close.&rdquo;
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ChoiceGroup
                label="What kind of source is this?"
                value={sourceKind}
                onChange={setSourceKind}
                options={SOURCE_KIND}
              />
              <ChoiceGroup
                label="What can one case like this do?"
                value={boundary}
                onChange={setBoundary}
                options={BOUNDARY}
              />
            </div>
            {sourceKind && sourceKind !== "filing" ? (
              <Response>
                Not quite. A shareholder letter filed with the SEC is the
                company&rsquo;s own account, published to the regulator. That is
                what makes it the thing to read first — everything else is
                somebody&rsquo;s reading of it.
              </Response>
            ) : null}
            {boundary && boundary !== "illustrate" ? (
              <Response>
                That is more than one case can carry. Proving a pattern repeats,
                or that it survives costs, needs a sample and a comparison — which
                is Mission 9&rsquo;s work, not this one&rsquo;s.
              </Response>
            ) : null}
          </div>

          <button type="button" disabled={!ready} onClick={onComplete} className={BTN}>
            {ready ? "Continue to the first case" : "Answer both to continue"}
          </button>
        </div>
      );
    }

    // ---- 1 Netflix -------------------------------------------------------
    if (stage === 1) {
      const allSorted = NFLX_FACTS.every((f) => factKinds[f.id]);
      const sortedRight = NFLX_FACTS.every((f) => factKinds[f.id] === f.kind);
      const conclusionsDone = nflxSort.pick === "weaker";
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              What Netflix disclosed on 19 April 2022
            </h3>
            {/*
             * Collapsed once the price is revealed. The classifier is finished
             * work at that point, and leaving four three-option groups on screen
             * under the reveal pushed this stage to 1.94 screens at 1440 against
             * a 1.5 limit. The facts stay visible; only the answered controls go.
             */}
            {nflxRevealed ? (
              <dl className="mt-3">
                {NFLX_FACTS.map((f) => (
                  <Fact
                    key={f.id}
                    term={FACT_KINDS.find((k) => k.id === f.kind)?.label ?? ""}
                  >
                    {f.label}
                  </Fact>
                ))}
              </dl>
            ) : (
              <>
                <p className="mt-1 text-[15px] leading-7 text-slate-300">
                  Read these before looking at any price. Each one is a different
                  kind of fact.
                </p>
                <div className="mt-3 space-y-3">
                  {NFLX_FACTS.map((f) => (
                    <ChoiceGroup
                      key={f.id}
                      label={f.label}
                      className="grid gap-2 sm:grid-cols-3"
                      value={factKinds[f.id] ?? ""}
                      onChange={(v) => setFactKinds({ ...factKinds, [f.id]: v })}
                      options={FACT_KINDS.map((k) => ({ ...k, label: `${f.label} — ${k.label}` }))}
                    />
                  ))}
                </div>
              </>
            )}
            <SourceLine>
              Quoted from the Q1 2022 shareholder letter, filed as Exhibit 99.1 to
              the Form 8-K of 19 April 2022. Revenue confirmed against the
              as-filed 10-Q.
            </SourceLine>
          </div>

          {allSorted && !sortedRight ? (
            <Response>
              Look again at the last one. A forecast for a quarter that has not
              happened is the only forward-looking item here; the memberships and
              the net additions describe the quarter just closed.
            </Response>
          ) : null}

          {sortedRight && !nflxRevealed ? (
            <button type="button" onClick={() => setNflxRevealed(true)} className={BTN}>
              Now show what the price did
            </button>
          ) : null}

          {nflxRevealed ? (
            <div className="ops-definition-card p-5">
              <h3 className="ops-body-strong text-[16px] text-white">
                The shares fell by roughly a third in the next session
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-300">
                Revenue was still growing. What changed was the expectation: the
                company had guided to +2.5 million subscribers, delivered −0.20
                million, and told investors to expect −2.0 million more.
              </p>
              <ChoiceGroup
                label="Which of these does the evidence actually support?"
                className="mt-3 space-y-2"
                value={nflxSort.pick ?? ""}
                onChange={(v) => setNflxSort({ pick: v })}
                options={NFLX_SORT}
              />
              {nflxSort.pick && nflxSort.pick !== "weaker" ? (
                <Response>
                  That one needs something the filing cannot give you: a view on
                  what the shares were worth. What you can see is that the
                  information about future growth got worse.
                </Response>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!conclusionsDone}
            onClick={onComplete}
            className={BTN}
          >
            {conclusionsDone ? "Continue to the second case" : "Sort the facts, then choose the supported claim"}
          </button>
        </div>
      );
    }

    // ---- 2 NVIDIA --------------------------------------------------------
    if (stage === 2) {
      const ready = nvdaLine === "outlook" && nvdaDirection !== "";
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              What NVIDIA disclosed on 24 May 2023
            </h3>
            <ChoiceGroup
              label="Which line is most relevant to what happens next?"
              className="mt-3 space-y-2"
              value={nvdaLine}
              onChange={setNvdaLine}
              options={NVDA_LINES}
            />
            <SourceLine>
              Quoted from the Q1 fiscal 2024 results release, filed 24 May 2023.
            </SourceLine>
          </div>

          {nvdaLine && nvdaLine !== "outlook" ? (
            <Response>
              That line describes a quarter that has already happened. Investors
              were pricing the next one — and only one line here is about that.
            </Response>
          ) : null}

          {nvdaLine === "outlook" ? (
            <div className="ops-definition-card p-5">
              <h3 className="ops-body-strong text-[16px] text-white">
                Direction only
              </h3>
              <p className="mt-1 text-[15px] leading-7 text-slate-300">
                Not how far. Given an outlook of $11.00 billion against a quarter
                that just came in at $7.19 billion, is the picture of the future
                more or less favourable than it was?
              </p>
              <ChoiceGroup
                label="Direction of the change in expectations"
                className="mt-3 grid gap-2 sm:grid-cols-3"
                value={nvdaDirection}
                onChange={(v) => {
                  setNvdaDirection(v);
                  setNvdaRevealed(true);
                }}
                options={DIRECTION}
              />
            </div>
          ) : null}

          {nvdaRevealed ? (
            <Response>
              The shares rose by roughly a quarter in the next session. Note what
              you still do not know: whether that expectation turned out to be
              accurate, whether the move was too large or too small, and whether
              anything like it happens again.
            </Response>
          ) : null}

          <button type="button" disabled={!ready} onClick={onComplete} className={BTN}>
            {ready ? "Continue to the third case" : "Choose the line, then the direction"}
          </button>
        </div>
      );
    }

    // ---- 3 GameStop ------------------------------------------------------
    if (stage === 3) {
      const ready = gmeCause === "several" && gmeMissing !== "";
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              GameStop, January 2021
            </h3>
            {/*
             * Collapsed once the causal question is answered: five timeline rows
             * above two further questions ran this stage to 1.77 screens at 1440.
             * The dates the answer depends on stay; the detail folds away.
             */}
            {gmeCause ? (
              <p className="mt-2 text-[15px] leading-7 text-slate-300">
                11 Jan, a board appointment. 13 Jan, $19.95 to $31.40 on twenty
                times the volume. 27 Jan, $347.51 — over 1,600% above the 11 Jan
                close. 28 Jan, a $483.00 high and trading restrictions, amid high
                short interest, heavy attention and extensive coverage at once.
              </p>
            ) : (
              <dl className="mt-3">
                <Fact term="11 January">
                  GameStop announces a board appointment.
                </Fact>
                <Fact term="13 January">
                  The closing price rises to $31.40 from $19.95 the day before.
                  Volume rises to about 144 million shares, from about 7 million.
                </Fact>
                <Fact term="27 January">
                  The price closes at $347.51 — more than 1,600% above its 11
                  January close.
                </Fact>
                <Fact term="28 January">
                  An intraday high of $483.00, and trading restrictions at several
                  brokers.
                </Fact>
                <Fact term="Throughout">
                  High short interest, heavy retail attention, and extensive media
                  coverage, all at once.
                </Fact>
              </dl>
            )}
            <SourceLine>
              Quoted from the SEC staff report on equity and options market
              structure conditions in early 2021, published October 2021.
            </SourceLine>
          </div>

          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              Which statement is most defensible?
            </h3>
            {/*
             * Folds to a line once answered, so the missing-evidence question
             * below is the only open one. Two three-option groups on screen at
             * once took this stage to 1.55 screens at 1440.
             */}
            {gmeCause === "several" ? (
              <Fact term="Your reading">
                {GME_CAUSE.find((o) => o.id === gmeCause)?.label}
              </Fact>
            ) : (
              <ChoiceGroup
                label="The most defensible reading of this evidence"
                className="mt-3 space-y-2"
                value={gmeCause}
                onChange={setGmeCause}
                options={GME_CAUSE}
              />
            )}
            {gmeCause === "squeeze" ? (
              <Response>
                This is the most repeated explanation, and the regulator who
                studied the episode rejected it. The staff report concluded that
                &ldquo;it was the positive sentiment, not the buying-to-cover,
                that sustained the weeks-long price appreciation of GameStop
                stock.&rdquo;
              </Response>
            ) : null}
            {gmeCause === "board" ? (
              <Response>
                A board appointment is one dated event. It cannot carry sixteen
                days and a 1,600% move on its own, and the report documents
                several other forces present at the same time.
              </Response>
            ) : null}
          </div>

          {gmeCause === "several" ? (
            <div className="ops-definition-card p-5">
              <h3 className="ops-body-strong text-[16px] text-white">
                What would you need before saying more?
              </h3>
              <ChoiceGroup
                label="The missing evidence"
                className="mt-3 space-y-2"
                value={gmeMissing}
                onChange={setGmeMissing}
                options={GME_MISSING}
              />
            </div>
          ) : null}

          <button type="button" disabled={!ready} onClick={onComplete} className={BTN}>
            {ready ? "Continue to the comparison" : "Choose a statement, then what is missing"}
          </button>
        </div>
      );
    }

    // ---- 4 compare -------------------------------------------------------
    if (stage === 4) {
      const answered = CLAIMS.every((c) => claims[c.id]);
      return (
        <div className="space-y-4">
          <div className="ops-definition-card p-5">
            <h3 className="ops-body-strong text-[16px] text-white">
              What the three cases will and will not carry
            </h3>
            <p className="mt-1 text-[15px] leading-7 text-slate-300">
              Two of these follow from what you read. Two are the kind of claim
              that needs a sample, a benchmark and a cost model — which is what
              Mission 9 builds.
            </p>
            <div className="mt-3 space-y-2">
              {CLAIMS.map((c) => (
                <ChoiceGroup
                  key={c.id}
                  label={c.label}
                  className="grid gap-2 sm:grid-cols-3"
                  value={claims[c.id] ?? ""}
                  onChange={(v) => setClaims({ ...claims, [c.id]: v })}
                  options={VERDICTS.map((v) => ({ ...v, label: `${c.label} — ${v.label}` }))}
                />
              ))}
            </div>
            {answered && !claimsCorrect ? (
              <Response>
                Check the last two again. Nothing you read measured whether
                attention predicts returns, or whether investors are slow in
                general — those need many events, not three.
              </Response>
            ) : null}
          </div>

          <button type="button" disabled={!claimsCorrect} onClick={onComplete} className={BTN}>
            {claimsCorrect ? "Continue to your note" : "Sort all four claims"}
          </button>
        </div>
      );
    }

    // ---- 6 the boundary and the save -------------------------------------
    if (stage === 6) return renderBoundary(onComplete);

    // ---- 5 the note ------------------------------------------------------
    return (
      <div className="space-y-4">
        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">
            Market Observation Note 0.1
          </h3>
          <p className="mt-1 text-[15px] leading-7 text-slate-300">
            One case, recorded as evidence rather than as an opinion.
          </p>

          {/*
             Collapsed once chosen, for the same reason as the Netflix stage:
             three option cards plus the note's own three questions ran to 2.28
             screens at 1440. Changing case stays one click away.
          */}
          {note.caseId ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="ops-body-strong text-[15px] text-white">
                  {NOTE_CASES.find((c) => c.id === note.caseId)?.label}
                </span>
                <button
                  type="button"
                  onClick={() => setNote({ ...EMPTY_OBSERVATION_NOTE })}
                  className="min-h-11 rounded-full border border-white/15 px-4 py-2 text-[13px] text-slate-300 transition-colors hover:border-white/30"
                >
                  Reset this case
                </button>
              </div>
              <dl className="mt-3">
                <Fact term="What was disclosed">{note.disclosure}</Fact>
                <Fact term="What the price did">{note.priceResponse}</Fact>
              </dl>
            </div>
          ) : (
            <ChoiceGroup
              label="Which case is this note about?"
              className="mt-3 space-y-2"
              value={note.caseId}
              onChange={(caseId) => {
                const packet = DISCLOSURES[caseId];
                setNote({
                  ...note,
                  caseId: caseId as MarketObservationNote["caseId"],
                  disclosure: packet?.disclosure ?? "",
                  priceResponse: packet?.priceResponse ?? "",
                });
              }}
              options={NOTE_CASES}
            />
          )}
        </div>

        {note.caseId ? (
          <div className="ops-definition-card p-5">
            {/*
             * One question at a time, with answered ones folded to a line.
             * Three ten-option groups stacked ran to 1.71 screens at 1440, and
             * the learner only ever needs the question in front of them.
             */}
            <div className="space-y-3">
              {note.interpretation ? (
                <Fact term="Narrowest explanation">
                  {INTERPRETATIONS.find((o) => o.id === note.interpretation)?.label}
                </Fact>
              ) : (
                <ChoiceGroup
                  label="The narrowest explanation this case supports"
                  className="space-y-2"
                  value={note.interpretation}
                  onChange={(interpretation) => set({ interpretation })}
                  options={INTERPRETATIONS}
                />
              )}

              {note.interpretation ? (
                note.uncertainty ? (
                  <Fact term="Not established here">
                    {UNCERTAINTIES.find((o) => o.id === note.uncertainty)?.label}
                  </Fact>
                ) : (
                  <ChoiceGroup
                    label="What this case does not establish"
                    className="space-y-2"
                    value={note.uncertainty}
                    onChange={(uncertainty) => set({ uncertainty })}
                    options={UNCERTAINTIES}
                  />
                )
              ) : null}

              {note.uncertainty ? (
                note.nextEvidence ? (
                  <Fact term="Needed before generalising">
                    {NEXT_EVIDENCE.find((o) => o.id === note.nextEvidence)?.label}
                  </Fact>
                ) : (
                  <ChoiceGroup
                    label="What you would need before generalising"
                    className="space-y-2"
                    value={note.nextEvidence}
                    onChange={(nextEvidence) => set({ nextEvidence })}
                    options={NEXT_EVIDENCE}
                  />
                )
              ) : null}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={!noteReady}
          onClick={onComplete}
          className={BTN}
        >
          {noteReady ? "Continue to the boundary" : "Answer all three questions"}
        </button>
      </div>
    );
  };

  const renderBoundary = (onComplete: () => void) => {
    void onComplete;
    return (
      <div className="space-y-4">
        <div className="ops-definition-card p-5">
          <h3 className="ops-body-strong text-[16px] text-white">
            Do you have enough to state a market belief?
          </h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-300">
            Three cases is not a sample. Saying so is the most evidence-literate
            answer available to you here, and Mission 9 is where a belief gets
            built once you can test one.
          </p>
          <div className="mt-3">
            <ChoiceGroup
              label="Whether three cases support a market belief"
              className="grid gap-2 sm:grid-cols-2"
              value={declined ? "no" : ""}
              onChange={() => setDeclined(true)}
              options={[
                {
                  id: "no",
                  label: "Not yet — three cases cannot support a belief",
                  hint: "A finding, not indecision.",
                },
              ]}
            />
          </div>
        </div>

        <p className="text-[13px] leading-6 text-slate-400">
          Saved in this browser. Educational material, not investment advice.
        </p>

        <button
          type="button"
          disabled={saved || !noteReady || !declined}
          onClick={() => {
            saveObservationNote({ ...note, declinedToGeneralise: declined });
            setSaved(true);
          }}
          className={BTN}
        >
          {saved ? "Observation note saved ✓" : "Save the observation note"}
        </button>
        {!saved && (!noteReady || !declined) ? (
          <p className="text-[14px] leading-6 text-slate-400">
            Choose a case, answer all three questions about it, and say whether
            three cases are enough.
          </p>
        ) : null}
      </div>
    );
  };

  const restored = Boolean(observationNote?.updatedAt) || saved;

  return (
    <ValuationJourneyShell
      key={restored ? observationNote?.updatedAt || "saved" : "fresh"}
      initialCompleted={restored ? STAGES.map(() => true) : undefined}
      initialStage={restored ? STAGES.length - 1 : undefined}
      lessonSlug={LESSON_SLUG}
      ariaLabel="Observe the market before forming a belief"
      labLabel="Guided evidence desk"
      savedArtifactLabel="Market Observation Note"
      stages={STAGES}
      renderStage={renderStage}
    />
  );
}
