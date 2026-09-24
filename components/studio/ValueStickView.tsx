"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  EXAMPLE,
  LEVERS,
  LEVER_BY_ID,
  MARKS,
  bands,
  pull,
  sideSuggested,
  whatIsMissing,
  whatIsWrong,
  type Side,
  type Stick,
  type ValueClaim,
} from "@/lib/studio-project/value-stick";
import { recordValueClaim, removeValueClaim } from "@/lib/studio-project/operations";
import { latestInvestigation, type FigureInvestigation, type KeptPassage } from "@/lib/studio-project/schema";
import { readInvestigation } from "@/lib/studio-project/investigate-read";
import { sectionLabel as labelForSection } from "@/lib/filings/sections";
import { Field, Panel } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";
import { NeedsCompany, StepHeading } from "./workspace/ResearchSteps";

/**
 * Where a business's value comes from, read on the value stick.
 *
 * Mauboussin and Callahan, *Measuring the Moat*, pp. 40-55; the model is
 * Brandenburger and Stuart's and the picture Oberholzer-Gee's, both reaching
 * this surface through that paper. Pages for every claim:
 * docs/source-audits/studio-value-stick.md.
 *
 * Two of the stick's four marks cannot be measured for a real company, so the
 * page is in two halves that never mix. The worked example carries numbers and
 * says on its face that Studio invented them; the company half carries none, and
 * asks instead which lever is at work, how it works, what in the filings shows
 * it, and what would say it was not there.
 */

const BAND_TONE: Record<string, string> = {
  consumer: "bg-accent-cyan/25 border-accent-cyan/40",
  firm: "bg-accent-green/25 border-accent-green/40",
  supplier: "bg-accent-amber/20 border-accent-amber/35",
};

export default function ValueStickView() {
  const { session, project } = useWorkspace();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [pulled, setPulled] = useState<string[]>([]);
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [lever, setLever] = useState<string | null>(null);
  const [mechanism, setMechanism] = useState("");
  const [cited, setCited] = useState<string[]>([]);
  const [wouldChangeIt, setWouldChangeIt] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [showMissing, setShowMissing] = useState(false);

  const investigations = useMemo(
    () => [...(project?.investigations ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [project],
  );

  useEffect(() => {
    if (investigationId || !project) return;
    const opening = latestInvestigation(project);
    if (opening) setInvestigationId(opening.id);
  }, [project, investigationId]);

  const open: FigureInvestigation | undefined = investigations.find((item) => item.id === investigationId);
  const claims: ValueClaim[] = open?.valueClaims ?? [];
  const passages: KeptPassage[] = open?.passages ?? [];

  /*
   * What the seven figures already say about which end of the stick to look at.
   * The checklist asks exactly this on p. 68 and `readAdvantage` already answers
   * it, so the answer is read rather than asked for a second time.
   */
  const suggestion = useMemo(() => {
    if (!open) return sideSuggested(null);
    const reading = readInvestigation(open);
    return sideSuggested("blocked" in reading ? null : reading.howEarned);
  }, [open]);

  const blank = useCallback(() => {
    setLever(null);
    setMechanism("");
    setCited([]);
    setWouldChangeIt("");
    setShowMissing(false);
  }, []);

  const missing = whatIsMissing({ lever: lever ?? undefined, mechanism, passageIds: cited, wouldChangeIt });

  const record = async () => {
    if (!open) return;
    if (missing.length) {
      setShowMissing(true);
      return;
    }
    setNote(null);
    const result = await sessionRef.current.update((current) =>
      recordValueClaim(current, open.id, {
        lever: lever!,
        mechanism: mechanism.trim(),
        passageIds: cited,
        wouldChangeIt: wouldChangeIt.trim(),
      }),
    );
    if (result.ok) blank();
    else setNote(`Not saved: ${result.error}`);
  };

  const drop = async (claimId: string) => {
    if (!open) return;
    const result = await sessionRef.current.update((current) => removeValueClaim(current, open.id, claimId));
    if (!result.ok) setNote(`Not removed: ${result.error}`);
  };

  const stick = pull(EXAMPLE.start, pulled);

  return (
    <div className="space-y-3">
      <Heading />

      {investigations.length > 1 ? (
        <nav aria-label="Companies you have looked at" className="-mx-1 overflow-x-auto px-1 pb-1">
          <ul className="flex items-center gap-2">
            {investigations.map((item) => {
              const active = item.id === investigationId;
              const count = item.valueClaims?.length ?? 0;
              return (
                <li key={item.id} className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setInvestigationId(item.id);
                      blank();
                    }}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3.5 text-[13px] transition-colors",
                      active
                        ? "border-accent-cyan/40 bg-accent-cyan/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white",
                    )}
                  >
                    {item.company.trim() || "Unnamed company"}
                    {count ? <span className="ml-2 text-[11px] text-slate-500">{count}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------- the worked example */}
        <Panel>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-[15px] font-semibold text-white">{EXAMPLE.what}</h2>
            <p className="text-[12px] text-slate-500">Made up, on purpose</p>
          </div>
          <StickDrawing stick={stick} unit={EXAMPLE.unit} />

          {/* A control that visibly changes a financial relationship, which is
              the only kind this project allows. Pulling one moves what somebody
              is willing to do; the price and the cost stay where they were,
              because what the company then charges is its own decision. */}
          <h3 className="mt-3 text-[13px] font-semibold text-white">Pull a lever and watch the stick</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEVERS.map((option) => {
              const on = pulled.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPulled((now) => (on ? now.filter((id) => id !== option.id) : [...now, option.id]))}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-3 text-[12px] transition-colors",
                    on
                      ? option.side === "wtp"
                        ? "border-accent-cyan/50 bg-accent-cyan/15 text-white"
                        : "border-accent-amber/50 bg-accent-amber/15 text-white"
                      : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                  )}
                >
                  {option.sourceLabel}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] leading-5 text-slate-500">
            {pulled.length === 0
              ? "The three on the left raise what a customer will pay. The three on the right lower what a supplier will accept."
              : "Neither the price nor the cost moved. The gain is sitting with the customer and the supplier until the bakery decides to take some of it."}
          </p>
          <p className="mt-2 border-t border-st-hair pt-2 text-[12px] leading-5 text-slate-600">{EXAMPLE.disclaimer}</p>
        </Panel>

        {/* --------------------------------------------------- the real company */}
        <div className="space-y-3">
          <Panel>
            <h2 className="text-[15px] font-semibold text-white">
              {open?.company.trim() || "Your company"}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-300">{suggestion.says}</p>
            {!open ? (
              <div className="mt-3">
                <NeedsCompany>The example on the left works without one.</NeedsCompany>
              </div>
            ) : lever === null ? (
              <>
                <h3 className="mt-3 text-[13px] font-semibold text-white">Which lever is at work here?</h3>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {LEVERS.map((option) => {
                    const claimed = claims.filter((claim) => claim.lever === option.id).length;
                    const suggested =
                      suggestion.side === "both" || (suggestion.side !== null && suggestion.side === option.side);
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setLever(option.id);
                            setShowMissing(false);
                          }}
                          className={cn(
                            "w-full rounded-lg border px-3 py-2 text-left text-[13px] leading-5 transition-colors",
                            suggested
                              ? "border-white/15 text-slate-200 hover:border-accent-cyan/40 hover:text-white"
                              : "border-transparent text-slate-400 hover:border-white/15 hover:text-white",
                          )}
                        >
                          {option.label}
                          <span className="mt-0.5 block text-[11px] text-slate-500">
                            {option.sourceLabel}
                            {claimed ? " · argued" : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <ClaimForm
                leverId={lever}
                company={open.company}
                mechanism={mechanism}
                setMechanism={setMechanism}
                wouldChangeIt={wouldChangeIt}
                setWouldChangeIt={setWouldChangeIt}
                passages={passages}
                cited={cited}
                setCited={setCited}
                missing={showMissing ? missing : []}
                onRecord={() => void record()}
                onCancel={blank}
              />
            )}
            {note ? (
              <p role="alert" className="mt-2 text-[13px] leading-6 text-accent-amber">
                {note}
              </p>
            ) : null}
          </Panel>

          {claims.length ? (
            <Panel>
              <h2 className="text-[15px] font-semibold text-white">
                What you have argued <span className="font-normal text-slate-500">({claims.length})</span>
              </h2>
              <ul className="mt-2 space-y-3">
                {claims.map((claim) => {
                  const its = LEVER_BY_ID.get(claim.lever);
                  return (
                    <li key={claim.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <p className="text-[12px] leading-5 text-slate-500">
                        {its?.sourceLabel} · {its?.side === "wtp" ? "raises what a customer will pay" : "lowers what a supplier will accept"}
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-slate-200">{claim.mechanism}</p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-500">
                        Would change it: {claim.wouldChangeIt}
                        {claim.passageIds.length
                          ? ` · ${claim.passageIds.length} passage${claim.passageIds.length === 1 ? "" : "s"} behind it`
                          : " · nothing kept behind it yet"}
                      </p>
                      <button
                        type="button"
                        onClick={() => void drop(claim.id)}
                        className="mt-1 inline-flex min-h-11 items-center text-[13px] text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>

      <StudioAside
        inline={null}
        beside={
          <Panel>
            <h2 className="text-[14px] font-semibold text-white">Where this framework comes from</h2>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              Michael J. Mauboussin and Dan Callahan, <em>Measuring the Moat</em>, Counterpoint Global,
              Morgan Stanley, 15 October 2024, pp. 40-55 and the checklist on p. 68.
            </p>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              The model is Adam Brandenburger and Harborne Stuart&rsquo;s. The picture is the one Felix
              Oberholzer-Gee popularized in <em>Better, Simpler Strategy</em> (Harvard Business Review
              Press, 2021), which the paper&rsquo;s exhibits are based on. Studio has read the paper, not
              the book.
            </p>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              Nothing here asks what a customer would pay or a supplier would accept for a real company.
              The paper gives no way to measure either, and a box asking for one would collect a guess
              that looked like evidence.
            </p>
          </Panel>
        }
      />
    </div>
  );
}

/**
 * The stick itself.
 *
 * Bands are drawn in proportion to what they are worth, so moving a lever moves
 * the picture, not just a number. A band that has gone negative is not drawn at
 * all — it is said in words underneath instead, because a bar of negative height
 * would be a picture of something that cannot happen.
 */
function StickDrawing({ stick, unit }: { stick: Stick; unit: string }) {
  const cut = bands(stick);
  const wrong = whatIsWrong(stick);
  const amount = (value: number) => `${unit}${value.toFixed(0)}`;

  /*
   * Exhibit 27's own arrangement: the four marks are lines, and the three bands
   * are the space between them. Drawn as two columns instead, the marks sat at
   * even thirds while the bands were 8, 8 and 5 — so the label for the price
   * pointed at the middle of a band rather than at its edge, which is the one
   * thing this picture exists to show.
   *
   * Bands grow in proportion to what they are worth. A band worth nothing or
   * less takes no height at all and is said in words underneath: a bar of
   * negative height would be a picture of something that cannot happen.
   */
  const band = (key: keyof typeof BAND_TONE, label: string, value: number) => (
    <div
      key={key}
      style={{ flexGrow: Math.max(0, value), flexBasis: 0 }}
      className={cn(
        "flex min-h-0 items-center justify-between gap-2 overflow-hidden px-3 text-[12px] leading-4 motion-safe:transition-[flex-grow] motion-safe:duration-300",
        BAND_TONE[key],
      )}
    >
      <span className="min-w-0 truncate text-slate-100">{label}</span>
      <span className="shrink-0 tabular-nums text-slate-100">{amount(value)}</span>
    </div>
  );

  const mark = (key: string, label: string, value: number) => (
    <div key={key} className="flex items-baseline justify-between gap-2 border-y border-white/25 bg-white/[0.04] px-3 py-1 text-[12px] leading-4">
      <span className="min-w-0 truncate text-slate-300">{label}</span>
      <span className="shrink-0 tabular-nums font-semibold text-white">{amount(value)}</span>
    </div>
  );

  return (
    <div className="mt-3">
      <div className="flex h-64 flex-col overflow-hidden rounded-xl border border-white/10">
        {mark("wtp", MARKS[0].sourceLabel, stick.wtp)}
        {band("consumer", "The customer\u2019s share", cut.consumerSurplus)}
        {mark("price", MARKS[1].sourceLabel, stick.price)}
        {band("firm", "The business\u2019s share", cut.firmValue)}
        {mark("cost", MARKS[2].sourceLabel, stick.cost)}
        {band("supplier", "The supplier\u2019s share", cut.supplierSurplus)}
        {mark("wts", MARKS[3].sourceLabel, stick.wts)}
      </div>
      {wrong.length ? <p className="mt-2 text-[12px] leading-5 text-accent-amber">{wrong[0]}</p> : null}
    </div>
  );
}

function ClaimForm({
  leverId, company, mechanism, setMechanism, wouldChangeIt, setWouldChangeIt,
  passages, cited, setCited, missing, onRecord, onCancel,
}: {
  leverId: string;
  company: string;
  mechanism: string;
  setMechanism: (value: string) => void;
  wouldChangeIt: string;
  setWouldChangeIt: (value: string) => void;
  passages: KeptPassage[];
  cited: string[];
  setCited: (update: (now: string[]) => string[]) => void;
  missing: string[];
  onRecord: () => void;
  onCancel: () => void;
}) {
  const lever = LEVER_BY_ID.get(leverId)!;
  return (
    <>
      <h3 className="mt-3 text-[14px] font-semibold text-white">{lever.label}</h3>
      <p className="mt-1 text-[12px] leading-5 text-slate-500">
        {lever.sourceLabel} · {lever.side === "wtp" ? "raises what a customer will pay" : "lowers what a supplier will accept"}
      </p>
      <p className="mt-2 text-[13px] leading-6 text-slate-400">{lever.whatItIs}</p>
      <p className="mt-1 text-[12px] leading-5 text-slate-500">The checklist asks: {lever.asks}</p>

      <div className="mt-3 space-y-3">
        <Field
          label={`How it works at ${company.trim() || "this company"}`}
          hint="What happens, in the order it happens. Not whether it is impressive."
          value={mechanism}
          onChange={setMechanism}
          multiline
        />
        {passages.length ? (
          <fieldset>
            <legend className="text-[13px] font-semibold text-white">
              Anything you kept that shows it <span className="font-normal text-slate-500">optional</span>
            </legend>
            <ul className="mt-2 space-y-1">
              {passages.map((passage) => (
                <li key={passage.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-[12px] leading-5 text-slate-400 hover:bg-white/[0.03]">
                    <input
                      type="checkbox"
                      checked={cited.includes(passage.id)}
                      onChange={() =>
                        setCited((now) =>
                          now.includes(passage.id) ? now.filter((id) => id !== passage.id) : [...now, passage.id],
                        )
                      }
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <span>
                      <span className="line-clamp-2 text-slate-300">{passage.quote}</span>
                      <span className="text-slate-500">
                        {passage.form || "Report"} · {labelForSection(passage.sectionId, passage.form)}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ) : (
          <p className="text-[12px] leading-5 text-slate-500">
            Nothing kept from its filings yet —{" "}
            <Link href="/studio/filings" className="text-accent-cyan hover:underline">
              its own reports
            </Link>{" "}
            are where the evidence is.
          </p>
        )}
        <Field
          label="What would change your mind"
          hint="What you could watch for that would say this had stopped being true."
          value={wouldChangeIt}
          onChange={setWouldChangeIt}
          multiline
        />
      </div>

      {missing.length ? (
        <p role="alert" className="mt-3 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-3 text-[13px] leading-6 text-slate-300">
          Still needs {missing.join(", ")}.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRecord}
          className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 text-[13px] font-semibold text-white transition-colors hover:border-accent-cyan/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
        >
          Record this
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center px-2 text-[13px] text-slate-400 hover:text-white"
        >
          Choose another lever
        </button>
      </div>
    </>
  );
}

function Heading() {
  return (
    <>
      <StepHeading step="value">
        Between the most a customer would pay and the least a supplier would accept sits everything there
        is to share; <em>Measuring the Moat</em> draws it as a value stick.
      </StepHeading>
    </>
  );
}
