"use client";

import { longDate } from "@/lib/studio-project/cost-of-capital";
import {
  fiscalYearAverage,
  fiscalYearMonths,
  formatChange,
  monthsOf,
  rebase,
  yearOnYear,
  type CitedPassage,
  type InputSuggestion,
  type LibrarySeries,
} from "@/lib/studio-project/input-costs";
import {
  investigationForCompany,
  keepPassage,
  keptPassageId,
  linkInput,
  newInvestigationId,
  newPassageId,
  saveInvestigation,
  unlinkInput,
} from "@/lib/studio-project/operations";
import type { StudioProject } from "@/lib/studio-project/schema";
import { useState } from "react";
import type { FilingRef } from "./FilingPassages";
import { Panel } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * What the inputs a company buys have cost, for any company's annual report.
 *
 * The Test explanations step (docs/agent-prompts/studio-research-workspace-handoff.md):
 * a learner weighs a report's explanation of its costs against evidence from
 * outside it. Studio holds a checked library of producer price indexes for
 * inputs companies commonly buy (lib/studio-project/data/input-cost-library.json)
 * and lists the ones this report mentions, with the sentences. A mention is not a
 * purchase — a steelmaker mentions steel because it sells it — so an index is
 * linked only when the learner says a sentence shows the company buys the input,
 * and that sentence is kept as the reason.
 *
 * Replaces a version built for one company, with its indexes chosen by hand (R9,
 * reworked 2026-09-14).
 */

const LOOK_FOR =
  "Whether what the company buys got cheaper or dearer the way its report says its costs did, and where it did not. Link an index only where a sentence shows the company buys the input.";

const PRICE_INDEX =
  "A number that follows what US producers charge for something, set to 100 in a base period: 110 means prices 10% above that period's. Indexes with different base periods can be read against each other only once both are restated against the same stretch of time.";

/** Line colours for the chart and the key beside each index, dark enough to read on the light page. */
const COLORS = ["#0066cc", "#b45309", "#047857", "#7c3aed", "#be123c", "#0f766e"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthName = (month: string) => {
  const [year, number] = month.split("-").map(Number);
  return `${MONTHS[number - 1]} ${year}`;
};

const link = "text-accent-cyan underline underline-offset-2 hover:text-white";
const clip = (text: string, length = 220) => (text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")}…` : text);

export default function InputCostsView({
  filing,
  readerQuery,
  fiscal,
  suggestions,
  library,
  builtOn,
  tabs,
}: {
  filing: Omit<FilingRef, "sectionId">;
  /** "?doc=…&ticker=…", which a link to a passage in this report extends. */
  readerQuery: string;
  /** The fiscal year the report covers, or null when its period end could not be read. */
  fiscal: { fiscalYear: number; endMonth: number } | null;
  suggestions: InputSuggestion[];
  library: LibrarySeries[];
  builtOn: string;
  tabs: React.ReactNode;
}) {
  const { session } = useWorkspace();
  const [problem, setProblem] = useState<string | null>(null);

  const project = session.status === "ready" ? session.project : null;
  const investigation = project ? investigationForCompany(project, { cik: filing.cik, name: filing.companyName }) : undefined;
  const seriesById = new Map(library.map((series) => [series.id, series]));
  const linked = (investigation?.inputs ?? []).flatMap((entry) => {
    const passage = investigation?.passages?.find((kept) => kept.id === entry.passageId);
    const series = seriesById.get(entry.seriesId);
    return passage && series ? [{ entry, passage, series }] : [];
  });
  const years = fiscal ? [fiscal.fiscalYear - 1, fiscal.fiscalYear] : [];
  const passageHref = (passage: { sectionId: string; offset: number; quote: string }) =>
    `${readerQuery}&section=${passage.sectionId}&at=${passage.offset}&len=${passage.quote.length}#passage`;

  /** Change this company's investigation, starting one if there is none, the way keeping a passage does. */
  const change = async (apply: (current: StudioProject, investigationId: string) => StudioProject) => {
    setProblem(null);
    if (session.status !== "ready" || !session.project) {
      setProblem("Your work is still opening. Try again in a moment.");
      return;
    }
    const freshId = newInvestigationId();
    const result = await session.update((current) => {
      const existing = investigationForCompany(current, { cik: filing.cik, name: filing.companyName });
      const id = existing?.id ?? freshId;
      const withTarget = existing
        ? current
        : saveInvestigation(current, { company: filing.companyName, sic: filing.sic, figures: {}, riskFreePct: null, source: null }, freshId);
      return apply(withTarget, id);
    });
    if (!result.ok) setProblem(`Not saved — ${result.error}`);
  };

  const buys = (seriesId: string, passage: CitedPassage) =>
    change((current, id) => {
      const edit = { cik: filing.cik, accession: filing.accession, document: filing.document, form: filing.form, filed: filing.filed, ...passage };
      const passageId = keptPassageId(current, id, edit) ?? newPassageId();
      return linkInput(keepPassage(current, id, edit, passageId), id, { seriesId, passageId });
    });

  const linkedThrough = (seriesId: string, passage: CitedPassage) =>
    linked.some(
      ({ entry, passage: kept }) =>
        entry.seriesId === seriesId && kept.accession === filing.accession && kept.sectionId === passage.sectionId && kept.offset === passage.offset && kept.quote === passage.quote,
    );

  const distinct = [...new Map(linked.map(({ series }) => [series.id, series])).values()];

  return (
    <>
      {tabs}
      <section aria-labelledby="section-inputs" className="space-y-3">
        <h2 id="section-inputs" className="text-[17px] font-semibold text-white">
          What this company&rsquo;s inputs cost
        </h2>

        <StudioAside
          inline={
            <p className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-[14px] leading-6 text-slate-300">
              <span className="font-semibold text-white">What to look for. </span>
              {LOOK_FOR} <span className="text-slate-400">A price index is {PRICE_INDEX.charAt(0).toLowerCase() + PRICE_INDEX.slice(1)}</span>
            </p>
          }
          beside={
            <Panel>
              <h2 className="text-[14px] font-semibold text-white">What to look for here</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{LOOK_FOR}</p>
              <h2 className="mt-4 text-[14px] font-semibold text-white">What a price index is</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{PRICE_INDEX}</p>
            </Panel>
          }
        />

        <div>
          <h3 id="inputs-linked" className="text-[14px] font-semibold text-white">
            Inputs you linked ({linked.length})
          </h3>
          {linked.length ? (
            <>
              <div className="overflow-x-auto">
                <table aria-labelledby="inputs-linked" className="mt-1 w-full border-collapse text-left text-[13px] leading-5">
                  <thead>
                    <tr className="border-b border-white/10 text-[12px] text-slate-500">
                      <th scope="col" className="py-1.5 pr-4 align-bottom font-medium">
                        Price index, and the sentence that shows it buys this
                      </th>
                      {years.map((year) => (
                        <th key={year} scope="col" className="w-[5.5rem] py-1.5 pl-2 text-right align-bottom font-medium sm:w-[10rem] sm:whitespace-nowrap">
                          <span className="block sm:inline">Fiscal {year}</span> <span className="block sm:inline">against {year - 1}</span>
                        </th>
                      ))}
                      <th scope="col" className="w-16 py-1.5 pl-2 align-bottom font-medium">
                        <span className="sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {linked.map(({ entry, passage, series }) => {
                      const months = monthsOf(series);
                      const color = COLORS[distinct.findIndex((item) => item.id === series.id) % COLORS.length];
                      return (
                        <tr key={entry.id} className="border-b border-white/10 align-top">
                          <th scope="row" className="py-1.5 pr-4 font-normal">
                            <span className="flex flex-wrap items-center gap-x-2">
                              <span aria-hidden="true" className="inline-block h-[3px] w-4 shrink-0 rounded-full" style={{ background: color }} />
                              <span className="font-semibold text-white">{series.name}</span>
                              <a href={series.url} target="_blank" rel="noopener noreferrer" className={`text-[12px] ${link}`}>
                                BLS {series.id}: {series.title}
                              </a>
                            </span>
                            {passage.accession === filing.accession ? (
                              <a href={passageHref(passage)} className={`block text-[12px] ${link}`}>
                                &ldquo;{clip(passage.quote, 140)}&rdquo;
                              </a>
                            ) : (
                              <span className="block text-[12px] text-slate-500">&ldquo;{clip(passage.quote, 140)}&rdquo; (from another of its reports)</span>
                            )}
                          </th>
                          {years.map((year) => {
                            const moved = yearOnYear(months, year, fiscal!.endMonth);
                            return (
                              <td key={year} className="py-1.5 pl-2 text-right text-[15px] tabular-nums text-slate-200">
                                {moved ? formatChange(moved.change) : "—"}
                                {moved?.preliminary ? <span className="block text-[11px] text-slate-500">preliminary</span> : null}
                              </td>
                            );
                          })}
                          <td className="py-1.5 pl-2">
                            <button
                              type="button"
                              onClick={() => void change((current, id) => unlinkInput(current, id, entry.id))}
                              aria-label={`Unlink ${series.name}`}
                              className="min-h-9 text-[12px] text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!fiscal ? (
                <p className="text-[12px] leading-5 text-slate-500">The report&rsquo;s period end could not be read, so no fiscal-year change is shown.</p>
              ) : null}
              <p className="text-[13px] leading-5 text-slate-400">
                <span className="font-semibold text-white">Moving the same way is not proof, and moving differently is not disproof.</span>{" "}
                An index follows what producers charge across a whole US market, not what this company paid, when it bought, or on
                what terms.
              </p>
              {fiscal ? <Chart series={distinct} fiscal={fiscal} /> : null}
              <p className="text-[12px] leading-5 text-slate-500">
                Source: US Bureau of Labor Statistics producer price indexes, not seasonally adjusted, fetched {longDate(builtOn)}; BLS may
                revise the last four months.
              </p>
            </>
          ) : (
            <p className="text-[13px] leading-5 text-slate-500">
              None linked yet. Open the materials this report mentions below, and link an index where a sentence shows the
              company buys it.
            </p>
          )}
        </div>

        <div>
          <h3 id="inputs-mentioned" className="text-[14px] font-semibold text-white">
            What the report mentions from Studio&rsquo;s {library.length} price indexes ({suggestions.length})
          </h3>
          {suggestions.length ? (
            <>
              <p className="text-[13px] leading-5 text-slate-400">
                A mention is not a purchase: a company mentions what it sells, too. Sentences about buying come first.
              </p>
              {/*
                * Two columns from 1024px, each row just the input and its count. One column of rows
                * carrying each index's full title took the tab 37px past the budget at 1440 once an
                * index was linked.
                */}
              <ul aria-labelledby="inputs-mentioned" className="mt-1 grid border-t border-white/10 lg:grid-cols-2 lg:gap-x-6">
                {suggestions.map((suggestion) => {
                  const series = seriesById.get(suggestion.seriesId);
                  if (!series) return null;
                  return (
                    <li key={suggestion.seriesId} className="border-b border-white/10">
                      <details className="group py-1">
                        <summary className="flex min-h-9 cursor-pointer list-none items-center gap-x-2 text-[13px] leading-5">
                          <span aria-hidden="true" className="text-slate-500 transition-transform group-open:rotate-90">
                            ›
                          </span>
                          <span className="font-semibold text-white">{series.name}</span>
                          <span className="text-slate-500">
                            {suggestion.count} {suggestion.count === 1 ? "mention" : "mentions"}
                          </span>
                        </summary>
                        <p className="text-[12px] leading-5 text-slate-500">BLS index: {series.title}</p>
                        <ul className="mt-1 space-y-2 pb-1">
                          {suggestion.sentences.map((passage) => {
                            const done = linkedThrough(series.id, passage);
                            return (
                              <li key={`${passage.sectionId}-${passage.offset}`} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 text-[13px] leading-5 text-slate-300">
                                <a href={passageHref(passage)} className="min-w-0 flex-1 basis-72 hover:text-white">
                                  &ldquo;{clip(passage.quote)}&rdquo;
                                </a>
                                <button
                                  type="button"
                                  disabled={done}
                                  onClick={() => void buys(series.id, passage)}
                                  aria-label={done ? `${series.name} is linked through this sentence` : `This sentence shows it buys ${series.name.toLowerCase()}: link the index`}
                                  className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 ${
                                    done ? "border-accent-cyan/40 text-accent-cyan" : "border-white/12 text-slate-300 hover:border-accent-cyan/50 hover:text-accent-cyan"
                                  }`}
                                >
                                  {done ? "Linked" : "It buys this"}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-[13px] leading-5 text-slate-500">
              The sections this reader found mention none of the inputs Studio has a price index for.
            </p>
          )}
        </div>

        {problem ? (
          <p role="alert" className="text-[13px] leading-6 text-accent-amber">
            {problem}
          </p>
        ) : null}
      </section>
    </>
  );
}

/**
 * The linked indexes month by month, each restated so that its average over the
 * fiscal year before the first one compared reads 100, with the compared years
 * shaded and preliminary months dashed. From 34rem down it scrolls inside its
 * frame, which opens on its latest months.
 */
function Chart({ series, fiscal }: { series: LibrarySeries[]; fiscal: { fiscalYear: number; endMonth: number } }) {
  const compared = [fiscal.fiscalYear - 1, fiscal.fiscalYear];
  const baseYear = compared[0] - 1;
  const from = fiscalYearMonths(baseYear, fiscal.endMonth)[0];
  const lines = series.flatMap((entry, index) => {
    const months = monthsOf(entry);
    const base = fiscalYearAverage(months, baseYear, fiscal.endMonth);
    return base ? [{ entry, color: COLORS[index % COLORS.length], points: rebase(months.filter((month) => month.month >= from), base.average) }] : [];
  });
  const months = [...new Set(lines.flatMap((line) => line.points.map((point) => point.month)))].sort();
  if (!lines.length || months.length < 2) return null;

  const width = 720;
  const height = 120;
  const pad = { left: 34, right: 12, top: 8, bottom: 20 };
  const values = lines.flatMap((line) => line.points.map((point) => point.value));
  const lowest = Math.min(...values, 100);
  const highest = Math.max(...values, 100);
  const step = [10, 20, 25, 50, 100, 200].find((candidate) => (highest - lowest) / candidate <= 4) ?? 500;
  const low = Math.floor(lowest / step) * step;
  const high = Math.ceil(highest / step) * step;
  const slot = (width - pad.left - pad.right) / (months.length - 1);
  const x = (month: string) => pad.left + months.indexOf(month) * slot;
  const y = (value: number) => pad.top + (1 - (value - low) / (high - low)) * (height - pad.top - pad.bottom);
  const clamp = (value: number) => Math.max(pad.left, Math.min(width - pad.right, value));
  const ticks: number[] = [];
  for (let value = low; value <= high; value += step) ticks.push(value);

  const yearOf = (month: string) => Number(month.slice(0, 4)) + (Number(month.slice(5)) > fiscal.endMonth ? 1 : 0);
  const years: { year: number; from: number; to: number }[] = [];
  for (let year = yearOf(months[0]); year <= yearOf(months[months.length - 1]); year++) {
    const within = fiscalYearMonths(year, fiscal.endMonth).filter((month) => months.includes(month));
    if (within.length) years.push({ year, from: clamp(x(within[0]) - slot / 2), to: clamp(x(within[within.length - 1]) + slot / 2) });
  }
  const path = (points: { month: string; value: number }[]) =>
    points.map((point, index) => `${index ? "L" : "M"}${x(point.month).toFixed(1)} ${y(point.value).toFixed(1)}`).join(" ");

  return (
    <figure className="space-y-1">
      <figcaption className="flex flex-wrap items-baseline gap-x-4 text-[12px] leading-5 text-slate-500">
        <span className="font-semibold text-slate-300">Month by month, with fiscal {baseYear}&rsquo;s average set to 100</span>
        {lines.map((line) => (
          <span key={line.entry.id} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-[3px] w-4 rounded-full" style={{ background: line.color }} />
            {line.entry.name}
          </span>
        ))}
      </figcaption>
      {/* Laid out right to left, a frame too narrow for the chart opens on its end, the years compared. */}
      <div className="flex flex-row-reverse overflow-x-auto sm:justify-end">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Monthly price indexes from ${monthName(months[0])} to ${monthName(months[months.length - 1])}, each with fiscal ${baseYear}'s average set to 100. The changes by fiscal year are in the table above.`}
          className="block w-full min-w-[34rem] max-w-[720px] shrink-0"
        >
          {years.map(({ year, from: left, to }) => (
            <g key={year}>
              {compared.includes(year) ? (
                <rect x={left} y={pad.top} width={to - left} height={height - pad.top - pad.bottom} fill="#0066cc" fillOpacity={0.07} />
              ) : null}
              <line x1={left} x2={left} y1={pad.top} y2={height - pad.bottom} stroke="currentColor" className="text-slate-600" strokeOpacity={0.25} />
              <text x={(left + to) / 2} y={height - 5} textAnchor="middle" fontSize={11} fill="currentColor" className="text-slate-500">
                {compared.includes(year) ? `Fiscal ${year}` : year}
              </text>
            </g>
          ))}
          {ticks.map((value) => (
            <g key={value}>
              <line x1={pad.left} x2={width - pad.right} y1={y(value)} y2={y(value)} stroke="currentColor" className="text-slate-600" strokeOpacity={value === 100 ? 0.6 : 0.15} />
              <text x={pad.left - 6} y={y(value) + 4} textAnchor="end" fontSize={11} fill="currentColor" className="text-slate-500">
                {value}
              </text>
            </g>
          ))}
          {lines.map((line) => {
            const final = line.points.filter((point) => !point.preliminary);
            const later = line.points.slice(Math.max(0, final.length - 1));
            const end = line.points[line.points.length - 1];
            return (
              <g key={line.entry.id}>
                <path d={path(final)} fill="none" stroke={line.color} strokeWidth={2} strokeLinejoin="round" />
                {later.length > 1 ? <path d={path(later)} fill="none" stroke={line.color} strokeWidth={2} strokeDasharray="4 3" /> : null}
                <circle cx={x(end.month)} cy={y(end.value)} r={3} fill={line.color} />
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
