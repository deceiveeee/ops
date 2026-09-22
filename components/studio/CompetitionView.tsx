"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  EFFECTS,
  FORCES,
  FORCE_BY_KEY,
  WEIGHTING,
  coverage,
  whatIsMissing,
  type ForceEffect,
  type ForceFinding,
  type ForceKey,
  type ForceStanding,
} from "@/lib/studio-project/five-forces";
import { recordForceFinding, removeForceFinding } from "@/lib/studio-project/operations";
import { latestInvestigation, type FigureInvestigation, type KeptPassage } from "@/lib/studio-project/schema";
import { sectionLabel as labelForSection } from "@/lib/filings/sections";
import { Field, Panel, StageHeading } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * What competition does to a business, read the way *Measuring the Moat* reads
 * it.
 *
 * The paper's fifth caution about this framework (p. 22) decides the whole
 * surface: "Much of what is put forth as analysis of industry structure is
 * simply listing pluses and minuses for each of the forces. The objective is to
 * go beyond the superficial to get a complete view of the drivers of profit."
 *
 * So there is no high/medium/low picker and no score. A learner picks one of the
 * paper's own questions, says in their own words how it works, says which of
 * prices, costs, capital or opportunities it moves — the paper's own framing,
 * p. 22 — says whether it looks structural or passing, may attach a passage they
 * kept from the company's filings, and writes what would change their mind.
 * Until those are there it is not a finding and the surface says which part is
 * missing.
 *
 * Sources and page numbers: docs/source-audits/studio-five-forces.md.
 */

const STANDINGS: { key: ForceStanding; label: string; hint: string }[] = [
  { key: "structural", label: "Built into the business", hint: "It would still be true in a good year and a bad one." },
  { key: "temporary", label: "Passing or cyclical", hint: "It goes with the cycle, or with something that will change." },
];

export default function CompetitionView() {
  const { session, project } = useWorkspace();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [force, setForce] = useState<ForceKey>("entrants");
  const [question, setQuestion] = useState<string | null>(null);
  const [mechanism, setMechanism] = useState("");
  const [effect, setEffect] = useState<ForceEffect | null>(null);
  const [standing, setStanding] = useState<ForceStanding | null>(null);
  const [cited, setCited] = useState<string[]>([]);
  const [wouldChangeIt, setWouldChangeIt] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [showMissing, setShowMissing] = useState(false);

  const investigations = useMemo(
    () => [...(project?.investigations ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [project],
  );

  /* The company last worked on, until the learner picks another. */
  useEffect(() => {
    if (investigationId || !project) return;
    const opening = latestInvestigation(project);
    if (opening) setInvestigationId(opening.id);
  }, [project, investigationId]);

  const open: FigureInvestigation | undefined = investigations.find((item) => item.id === investigationId);
  const findings: ForceFinding[] = open?.forces ?? [];
  const passages: KeptPassage[] = open?.passages ?? [];
  const current = FORCE_BY_KEY.get(force)!;
  const seen = coverage(findings);

  const blank = useCallback(() => {
    setQuestion(null);
    setMechanism("");
    setEffect(null);
    setStanding(null);
    setCited([]);
    setWouldChangeIt("");
    setShowMissing(false);
  }, []);

  const missing = whatIsMissing({
    force,
    question: question ?? undefined,
    mechanism,
    effect: effect ?? undefined,
    standing: standing ?? undefined,
    passageIds: cited,
    wouldChangeIt,
  });

  const record = async () => {
    if (!open) return;
    if (missing.length) {
      setShowMissing(true);
      return;
    }
    setNote(null);
    const result = await sessionRef.current.update((currentProject) =>
      recordForceFinding(currentProject, open.id, {
        force,
        question: question!,
        mechanism: mechanism.trim(),
        effect: effect!,
        standing: standing!,
        passageIds: cited,
        wouldChangeIt: wouldChangeIt.trim(),
      }),
    );
    if (result.ok) blank();
    else setNote(`Not saved: ${result.error}`);
  };

  const drop = async (findingId: string) => {
    if (!open) return;
    const result = await sessionRef.current.update((currentProject) =>
      removeForceFinding(currentProject, open.id, findingId),
    );
    if (!result.ok) setNote(`Not removed: ${result.error}`);
  };

  /*
   * Nothing to investigate yet. Said as the one thing to do next rather than as
   * an empty version of the page, because every part of this surface hangs off a
   * company the learner has started on.
   */
  if (project && investigations.length === 0) {
    return (
      <div className="space-y-4">
        <Heading />
        <Panel>
          <p className="text-[15px] leading-7 text-st-sub">
            This reads the competition around a company you are investigating, and you have not started
            one yet.{" "}
            <Link href="/studio/investigate" className="text-accent-cyan hover:underline">
              Start with a company&rsquo;s figures
            </Link>
            , then come back.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Heading />

      {/* Whose competition. One row, scrolling sideways, as Investigate's is. */}
      {investigations.length > 1 ? (
        <nav aria-label="Companies you have looked at" className="-mx-1 overflow-x-auto px-1 pb-1">
          <ul className="flex items-center gap-2">
            {investigations.map((item) => {
              const active = item.id === investigationId;
              const count = item.forces?.length ?? 0;
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

      {/* The five, in the paper's order. One is open at a time: five open at
          once is the wall of boxes the paper warns against, and five times the
          height. */}
      <nav aria-label="The five forces" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex items-center gap-2">
          {FORCES.map((option) => {
            const active = option.key === force;
            const made = findings.filter((finding) => finding.force === option.key).length;
            return (
              <li key={option.key} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setForce(option.key);
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
                  {option.label}
                  {made ? <span className="ml-2 text-[11px] text-slate-500">{made}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/*
        * Two states, not one page that does both.
        *
        * Before a question is picked, choosing one is the whole job, so the
        * force takes the full width and its questions sit in two columns: the
        * threat of new entrants has eleven of them, and down one narrow column
        * that alone ran the page to 1.96 screens. Once a question is picked the
        * job is writing the answer, so the other ten get out of the way and the
        * form takes the wider half.
        */}
      <div className={cn("grid gap-4", question !== null && "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]")}>
        {/* ------------------------------------------------- the force itself */}
        <Panel>
          <h2 className="text-[15px] font-semibold text-white">{current.label}</h2>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            The paper calls this {current.sourceLabel.toLowerCase()}.
          </p>
          <p className="mt-3 text-[13px] leading-6 text-slate-300">{current.whatItIs}</p>

          {/* Exhibit 17's two lines for this force, verbatim. */}
          <dl className="mt-3 space-y-1 border-t border-st-hair pt-2 text-[12px] leading-5">
            <div>
              <dt className="inline text-slate-500">Risk: </dt>
              <dd className="inline text-slate-300">{current.risk}</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">What answers it: </dt>
              <dd className="inline text-slate-300">{current.mitigant}</dd>
            </div>
          </dl>

          {/* The model, before the learner is asked for anything: somebody
              else's finished answer, on a business nobody here is holding. */}
          {current.airline ? (
            <details className="group mt-3 border-t border-st-hair pt-2">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-[13px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
                How Porter read this for airlines
                <span className="text-[12px] font-normal text-slate-500 group-open:hidden">{current.airline.verdict}</span>
                <span className="hidden text-[12px] font-normal text-slate-500 group-open:inline">Hide</span>
              </summary>
              <p className="mt-1 text-[12px] leading-5 text-slate-400">
                <span className="text-slate-300">{current.airline.verdict}</span>, because {current.airline.because}.
              </p>
              <p className="mt-2 text-[12px] leading-5 text-slate-500">
                Porter&rsquo;s reading of the airline industry, as the paper reports it. Not a verdict on your
                company, and not one you have to reach.
              </p>
            </details>
          ) : (
            <p className="mt-3 border-t border-st-hair pt-2 text-[12px] leading-5 text-slate-500">
              The paper gives no airline verdict for this one, so there is no worked example here.
            </p>
          )}

          {/* The questions. Picking one is what opens the form: a learner who
              is handed five empty boxes writes five empty boxes. */}
          <h3 className="mt-4 text-[13px] font-semibold text-white">
            {question === null ? "Questions the paper asks about it" : "The question you are answering"}
          </h3>
          <ul className={cn("mt-2", question === null ? "grid gap-1 sm:grid-cols-2" : "space-y-1")}>
            {current.questions.filter((item) => question === null || item.id === question).map((item) => {
              const chosen = question === item.id;
              const answered = findings.filter((finding) => finding.force === force && finding.question === item.id).length;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestion(chosen ? null : item.id);
                      setShowMissing(false);
                    }}
                    aria-expanded={chosen}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-[13px] leading-5 transition-colors",
                      chosen
                        ? "border-accent-cyan/40 bg-accent-cyan/[0.07] text-white"
                        : "border-transparent text-slate-300 hover:border-white/15 hover:text-white",
                    )}
                  >
                    {item.ask}
                    {answered ? <span className="ml-2 text-[11px] text-slate-500">answered</span> : null}
                    {chosen ? <span className="mt-1 block text-[11px] text-slate-500">{item.from}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {question !== null ? (
            <button
              type="button"
              onClick={blank}
              className="mt-2 inline-flex min-h-11 items-center text-[13px] text-accent-cyan hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
            >
              Choose another question
            </button>
          ) : null}
        </Panel>

        {/* ------------------------------------------------------ the finding */}
        <div className="space-y-4">
          {question === null ? null : (
          <Panel>
            {(
              <>
                <h2 className="text-[15px] font-semibold text-white">
                  {current.questions.find((item) => item.id === question)?.ask}
                </h2>
                <div className="mt-3 space-y-3">
                  <Field
                    label="How it works"
                    hint="What happens, in the order it happens — not whether it is good or bad."
                    value={mechanism}
                    onChange={setMechanism}
                    placeholder="Two suppliers make the part it needs, so a price rise reaches its costs within a quarter."
                    multiline
                  />

                  <fieldset>
                    <legend className="text-[13px] font-semibold text-white">What does it move?</legend>
                    <p className="mt-1 text-[12px] leading-5 text-slate-500">
                      The paper reads every force for what it does to prices and costs.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {EFFECTS.map((option) => (
                        <label
                          key={option.key}
                          title={option.meaning}
                          className={cn(
                            "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-[13px] transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/40",
                            effect === option.key
                              ? "border-accent-cyan/40 bg-accent-cyan/10 text-white"
                              : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                          )}
                        >
                          <input
                            type="radio"
                            name="force-effect"
                            value={option.key}
                            checked={effect === option.key}
                            onChange={() => setEffect(option.key)}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-[13px] font-semibold text-white">Is it built in, or passing?</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {STANDINGS.map((option) => (
                        <label
                          key={option.key}
                          title={option.hint}
                          className={cn(
                            "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-[13px] transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/40",
                            standing === option.key
                              ? "border-accent-cyan/40 bg-accent-cyan/10 text-white"
                              : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                          )}
                        >
                          <input
                            type="radio"
                            name="force-standing"
                            value={option.key}
                            checked={standing === option.key}
                            onChange={() => setStanding(option.key)}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Evidence, from what this learner already kept while reading
                      this company's own filings. Optional on purpose: seeing how
                      something works before finding the paragraph that shows it
                      is ordinary, and refusing the thought would lose it. */}
                  {passages.length ? (
                    <fieldset>
                      <legend className="text-[13px] font-semibold text-white">
                        Anything you kept that shows it{" "}
                        <span className="font-normal text-slate-500">optional</span>
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
                                    now.includes(passage.id)
                                      ? now.filter((id) => id !== passage.id)
                                      : [...now, passage.id],
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
                    placeholder="A third supplier qualifying, or the company designing the part out."
                    multiline
                  />
                </div>

                {showMissing && missing.length ? (
                  <p role="alert" className="mt-3 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-3 text-[13px] leading-6 text-slate-300">
                    Still needs {missing.join(", ")}.
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void record()}
                    className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 text-[13px] font-semibold text-white transition-colors hover:border-accent-cyan/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                  >
                    Record this finding
                  </button>
                  <button
                    type="button"
                    onClick={blank}
                    className="inline-flex min-h-11 items-center px-2 text-[13px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
            {note ? (
              <p role="alert" className="mt-2 text-[13px] leading-6 text-accent-amber">
                {note}
              </p>
            ) : null}
          </Panel>
          )}

          {findings.length ? (
            <Panel>
              <h2 className="text-[15px] font-semibold text-white">
                What you have found <span className="font-normal text-slate-500">({findings.length})</span>
              </h2>
              <ul className="mt-3 space-y-3">
                {findings.map((finding) => {
                  const its = FORCE_BY_KEY.get(finding.force);
                  const asked = its?.questions.find((item) => item.id === finding.question)?.ask;
                  const moves = EFFECTS.find((item) => item.key === finding.effect)?.label;
                  return (
                    <li key={finding.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <p className="text-[12px] leading-5 text-slate-500">
                        {its?.label}
                        {asked ? ` · ${asked}` : null}
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-slate-200">{finding.mechanism}</p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-400">
                        Moves {moves?.toLowerCase()} ·{" "}
                        {finding.standing === "structural" ? "built into the business" : "passing or cyclical"}
                        {finding.passageIds.length
                          ? ` · ${finding.passageIds.length} passage${finding.passageIds.length === 1 ? "" : "s"} behind it`
                          : " · nothing kept behind it yet"}
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-500">
                        Would change it: {finding.wouldChangeIt}
                      </p>
                      <button
                        type="button"
                        onClick={() => void drop(finding.id)}
                        className="mt-2 inline-flex min-h-11 items-center text-[13px] text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
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

      {/* What is left, as a count of what has been looked at and never as a
          score: the paper is explicit that structure does not settle a
          company's fate. */}
      <p className="text-[12px] leading-5 text-slate-600">
        {seen.forcesExamined === 0
          ? "Nothing found yet. Any one of the five is a reasonable place to start."
          : `${seen.findings} finding${seen.findings === 1 ? "" : "s"} across ${seen.forcesExamined} of the five${
              seen.untouched.length ? `; ${seen.untouched.length} not looked at yet` : ", every one of them"
            }.`}
      </p>

      <StudioAside
        inline={null}
        beside={
          <Panel>
            <h2 className="text-[14px] font-semibold text-white">Where this framework comes from</h2>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              Michael J. Mauboussin and Dan Callahan, <em>Measuring the Moat</em>, Counterpoint Global,
              Morgan Stanley, 15 October 2024, pp. 22-32 and the checklist on pp. 67-68.
            </p>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              The paper builds on Michael E. Porter, <em>Competitive Strategy</em> (New York: Free Press,
              1980).
            </p>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">{WEIGHTING}</p>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              Studio is not endorsed by Morgan Stanley, and the questions above are put in plainer words
              than the paper uses. Where each one comes from is shown as you open it.
            </p>
          </Panel>
        }
      />
    </div>
  );
}

function Heading() {
  return (
    <>
      {/* Below 1024px the sections live in a menu, so this is the only way back
          to Research. From 1024 the sidebar already says where you are. */}
      <nav aria-label="Breadcrumb" className="text-[13px] text-slate-500 lg:hidden">
        <Link href="/studio/research" className="text-accent-cyan hover:underline">
          Research
        </Link>
        <span aria-hidden="true"> › </span>
        <span>Competition</span>
      </nav>
      <StageHeading as="h1" title="What competition does to this business">
        Five things press on what any business can earn — Porter&rsquo;s five forces, as{" "}
        <em>Measuring the Moat</em> sets them out. One question at a time.
      </StageHeading>
    </>
  );
}
