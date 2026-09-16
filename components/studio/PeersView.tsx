"use client";

import Link from "next/link";
import { useState } from "react";
import type { Entries, FigureKey } from "@/lib/studio-project/investigate";
import { measuresFrom, PEER_MEASURES } from "@/lib/studio-project/peer-measures";
import { investigationForCompany } from "@/lib/studio-project/operations";
import type { RoicSector } from "@/lib/studio-project/roic";
import { screen, type ScreenRow } from "@/lib/studio-project/screen";
import type { FilingRef } from "./FilingPassages";
import { Panel } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * The company beside the competitors it names, on the same measures, with the
 * arithmetic that ordered them left where a learner can read it.
 *
 * The method is settled in writing first: docs/source-audits/studio-quantitative-methods.md
 * §1 answers the seven questions the published screen this project studied
 * leaves open — the quantile convention, the winsorization limits, sample
 * standard deviation, zero variance, undefined ratios, weights when a measure
 * is missing, and ties — and `screen.ts` implements exactly that.
 *
 * Three things this surface will not do. It will not fill a gap: a figure the
 * SEC does not hold, a ratio that is not defined, a company whose accounting
 * means something else, each show as a dash with the reason. It will not call
 * the order a verdict: the composite is a ranking device and says so. And it
 * will not hide the group: the peer list is the learner's own, and changing it
 * changes every number here.
 */

const LOOK_FOR =
  "Whether the company you are reading earns more on its capital than the companies it names, and how: by charging more, or by working its capital harder. One year of one company against another is a starting point, not a verdict.";

const link = "text-accent-cyan underline underline-offset-2 hover:text-white";
const button =
  "inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 text-[14px] font-semibold text-white transition-colors hover:border-accent-cyan/70 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40";

/** How many companies the SEC route reads at once, the learner's own included. */
const MOST = 10;

interface CompanyFigures {
  cik: string;
  name?: string;
  sector?: RoicSector;
  periodEnd?: string;
  figures?: { key: FigureKey; value: number; concepts: string[]; addedUp: string | null }[];
  missing?: { key: FigureKey; reason: string }[];
  netProfit?: { value?: number; concept?: string; reason?: string };
  filing?: { accession: string; form: string; filed: string; url: string } | null;
  unavailable?: string;
}

const same = (cik: string, other: string) => Number(cik) === Number(other);

/** "30 Sep 2025", from the SEC's 2025-09-30. */
function readableDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Days before a company's year is too old to sit beside this report's without a word. */
const STALE_AFTER = 370;
const daysBetween = (from: string, to: string) => (Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86_400_000;

const show = (value: number, unit: "percent" | "times") => {
  const written = unit === "percent" ? `${Math.abs(value * 100).toFixed(1)}%` : Math.abs(value).toFixed(2);
  return value < 0 ? `−${written}` : written;
};
const signed = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const spelled = (count: number) => WORDS[count] ?? String(count);

export default function PeersView({
  filing,
  competitorsHref,
  tabs,
}: {
  filing: Omit<FilingRef, "sectionId">;
  /** Where to count competitors, for a learner who has none yet. */
  competitorsHref: string;
  tabs: React.ReactNode;
}) {
  const { session } = useWorkspace();
  const [reading, setReading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [answer, setAnswer] = useState<{ companies: CompanyFigures[]; asked: string[] } | null>(null);

  const project = session.status === "ready" ? session.project : null;
  const investigation = project ? investigationForCompany(project, { cik: filing.cik, name: filing.companyName }) : undefined;
  const peers = investigation?.peers ?? [];
  const withNumber = peers.filter((peer) => peer.cik);
  const withoutNumber = peers.filter((peer) => !peer.cik);

  const wanted = [filing.cik, ...withNumber.map((peer) => peer.cik)].slice(0, MOST);
  const changed = answer ? answer.asked.join() !== wanted.join() : false;

  const readFigures = async () => {
    setReading(true);
    setProblem(null);
    try {
      const response = await fetch(`/api/studio/peer-figures?ciks=${wanted.join(",")}`);
      const body = (await response.json()) as { companies?: CompanyFigures[]; error?: string };
      if (!response.ok || !body.companies) {
        setProblem(body.error ?? "Those figures could not be read just now.");
        return;
      }
      setAnswer({ companies: body.companies, asked: wanted });
    } catch {
      setProblem("Those figures could not be read just now. Try again in a moment.");
    } finally {
      setReading(false);
    }
  };

  // Everything below is worked out in the browser from what the route returned,
  // so the same figures that are shown are the figures that were screened.
  const companies = answer?.companies ?? [];
  const nameFor = (company: CompanyFigures) =>
    same(company.cik, filing.cik)
      ? filing.companyName
      : company.name || peers.find((peer) => peer.cik && same(peer.cik, company.cik))?.name || `SEC ${company.cik}`;

  const usable = companies.filter((company) => !company.unavailable && company.figures);
  const rows: ScreenRow[] = usable.map((company) => {
    const entries: Entries = {};
    for (const figure of company.figures ?? []) entries[figure.key] = figure.value;
    const net = typeof company.netProfit?.value === "number" ? company.netProfit.value : null;
    return { id: company.cik, values: measuresFrom(entries, (company.sector ?? "general") as RoicSector, net) };
  });
  const result = rows.length ? screen(rows, PEER_MEASURES.map((measure) => ({ id: measure.id, direction: measure.direction }))) : null;
  const ordered = result ? result.order.map((id) => ({ row: result.rows.find((entry) => entry.id === id)!, company: usable.find((entry) => entry.cik === id)! })) : [];
  const periods = new Set(usable.map((company) => company.periodEnd));
  // The year this report covers, which the others are read against. A company whose
  // newest tagged year ended long before it is not describing the same world, and
  // ABB — whose US accounting figures stop in 2023 — is the case this exists for.
  const ownPeriod = usable.find((company) => same(company.cik, filing.cik))?.periodEnd ?? "";
  const stale = (company: CompanyFigures) =>
    Boolean(ownPeriod && company.periodEnd && daysBetween(company.periodEnd, ownPeriod) > STALE_AFTER);

  return (
    <>
      {tabs}
      <section aria-labelledby="section-peers" className="space-y-3">
        <h2 id="section-peers" className="text-[17px] font-semibold text-white">
          How they compare on the same figures
        </h2>

        <StudioAside
          inline={
            <p className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-[14px] leading-6 text-slate-300">
              <span className="font-semibold text-white">What to look for. </span>
              {LOOK_FOR}
            </p>
          }
          beside={
            <Panel>
              <h2 className="text-[14px] font-semibold text-white">What to look for here</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{LOOK_FOR}</p>
            </Panel>
          }
        />

        {!withNumber.length ? (
          <p className="text-[14px] leading-6 text-slate-400">
            Nothing to compare yet.{" "}
            <Link href={competitorsHref} className={link}>
              Count the competitors this report names
            </Link>
            , or add companies by ticker, and their figures can be set beside this company&rsquo;s.
            {withoutNumber.length ? ` ${withoutNumber.length} of the companies you counted are not in the SEC's list, so Studio cannot read their figures.` : ""}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <button type="button" onClick={() => void readFigures()} disabled={reading} className={button}>
              {reading ? "Reading the SEC…" : answer ? "Read them again" : `Read the annual figures for these ${wanted.length} companies`}
            </button>
            <p className="text-[13px] leading-5 text-slate-500">
              {answer
                ? changed
                  ? "Your list of competitors has changed since these figures were read."
                  : "Each company's own latest annual figures, from SEC company facts."
                : "Each company's own latest annual figures, straight from the SEC. It takes a few seconds."}
            </p>
          </div>
        )}

        {problem ? (
          <p role="alert" className="text-[13px] leading-6 text-accent-amber">
            {problem}
          </p>
        ) : null}

        {result && ordered.length ? (
          <>
            {/*
             * The table is wider than a phone, and its width has to stay inside this box.
             * `overflow-x: auto` alone does not do that here: measured on 2026-09-15, a 390
             * wide page came out 585 wide, so the page itself scrolled sideways while the
             * table sat still. `contain: paint` keeps the table's width out of the page's.
             */}
            <div className="overflow-x-auto" style={{ contain: "paint" }}>
              <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
                <caption className="sr-only">
                  The company and the competitors it names, on {spelled(PEER_MEASURES.length)} measures, ordered by their combined standard score
                </caption>
                <thead>
                  <tr className="border-b border-white/10 align-bottom text-[12px] text-slate-400">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Company
                    </th>
                    {PEER_MEASURES.map((measure) => (
                      <th key={measure.id} scope="col" className="py-2 pr-3 font-medium">
                        {measure.label}
                        <span className="block text-[11px] text-slate-500">
                          {measure.direction === "higher" ? "counted better higher" : "counted better lower"}
                        </span>
                      </th>
                    ))}
                    <th scope="col" className="py-2 font-medium">
                      Combined
                      <span className="block text-[11px] text-slate-500">order on these {spelled(PEER_MEASURES.length)}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {ordered.map(({ row, company }) => {
                    const own = same(company.cik, filing.cik);
                    return (
                      <tr key={company.cik} className={own ? "bg-white/[0.04]" : undefined}>
                        <th scope="row" className="py-2 pr-3 text-[13px] font-semibold text-white">
                          {nameFor(company)}
                          <span className={`block text-[11px] font-normal ${stale(company) ? "text-accent-amber" : "text-slate-500"}`}>
                            {own ? "this company · " : ""}
                            {company.periodEnd ? `year to ${readableDate(company.periodEnd)}` : "year unknown"}
                            {stale(company) ? " · an older year than this report’s" : ""}
                          </span>
                        </th>
                        {PEER_MEASURES.map((measure) => {
                          const cell = row.cells.find((entry) => entry.measureId === measure.id);
                          const missing = row.missing.find((entry) => entry.measureId === measure.id);
                          return (
                            <td key={measure.id} className="py-2 pr-3 align-top text-slate-200">
                              {cell ? (
                                <>
                                  {show(cell.value, measure.unit)}
                                  <span className="block text-[11px] text-slate-500">score {signed(cell.z)}</span>
                                </>
                              ) : (
                                <>
                                  <span aria-hidden="true">—</span>
                                  <span className="sr-only">{missing?.reason ?? "not measured"}</span>
                                </>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 align-top text-slate-200">
                          {row.composite === null ? (
                            <span className="text-slate-500">not scored</span>
                          ) : (
                            <>
                              <span className="font-semibold text-white">{signed(row.composite)}</span>
                              <span className={`block text-[11px] ${row.scored < row.of ? "text-accent-amber" : "text-slate-500"}`}>
                                on {row.scored} of {row.of} measures
                              </span>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[13px] leading-5 text-slate-400">
              The combined number is the average of a company&rsquo;s scores, and a score says how far above or below this
              group&rsquo;s average it sits, measured in the group&rsquo;s own spread. It ranks these companies against each
              other on these {spelled(PEER_MEASURES.length)} measures for one year. It is not a distance, not a valuation, and not a verdict —
              change who is in the list and every number here changes.
            </p>

            <details className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
              <summary className="cursor-pointer text-[13px] font-semibold text-white">How this order was worked out</summary>
              <ol className="mt-2 space-y-2 text-[13px] leading-5 text-slate-400">
                <li>
                  <span className="font-semibold text-white">1. The figures.</span> Seven figures for each company, from
                  its own latest annual filing, read from the tags the company itself used for that year. A figure the
                  SEC does not hold for that year is left empty rather than guessed.
                </li>
                <li>
                  <span className="font-semibold text-white">2. The measures.</span>{" "}
                  {PEER_MEASURES.map((measure) => measure.label).join(", ")}. A ratio that is not defined — no positive
                  capital, no positive equity, a bank whose accounting means something else — is refused with its reason
                  rather than counted as nothing.
                </li>
                <li>
                  <span className="font-semibold text-white">3. The extremes are pulled in</span> to the 10th and 90th
                  percentiles of this group, so one unusual company cannot set the whole scale — but only where four or
                  more companies hold the measure, since in a group of three every company is an edge.
                  <ul className="mt-1 space-y-1">
                    {result.measures.map((measure) => {
                      const spec = PEER_MEASURES.find((entry) => entry.id === measure.id)!;
                      return (
                        <li key={measure.id} className="text-[12px] text-slate-500">
                          <span className="text-slate-300">{spec.label}:</span>{" "}
                          {measure.counted === 0
                            ? "no company here has this figure."
                            : measure.tooFewToCompare
                              ? "only one company here has this figure, so there is nothing to compare it with."
                              : measure.level
                                ? "every company is the same here, so it puts nobody ahead."
                                : !measure.winsorized
                                  ? `${measure.counted} companies · fewer than four, so nothing was pulled in · average ${show(measure.mean as number, spec.unit)}, spread ${show(measure.standardDeviation as number, spec.unit)}${
                                      measure.counted === 2 ? " · with two companies every score is +0.71 or −0.71, so only the sign means anything" : ""
                                    }`
                                  : `${measure.counted} companies · pulled in to ${show(measure.lowerLimit as number, spec.unit)} and ${show(measure.upperLimit as number, spec.unit)} · ${
                                    measure.pulledIn.length
                                      ? `${measure.pulledIn.map((cik) => nameFor(usable.find((entry) => entry.cik === cik)!)).join(", ")} pulled in`
                                      : "nobody was pulled in"
                                  } · average ${show(measure.mean as number, spec.unit)}, spread ${show(measure.standardDeviation as number, spec.unit)}${
                                    measure.counted === 2 ? " · with two companies every score is +0.71 or −0.71, so only the sign means anything" : ""
                                  }`}
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li>
                  <span className="font-semibold text-white">4. Each measure is scored</span> against this group&rsquo;s
                  average, in units of its spread, and turned round for the one measure counted better when lower. Equal
                  values score the same and share a place; a group that is level on a measure scores zero on it.
                </li>
                <li>
                  <span className="font-semibold text-white">5. The scores are averaged</span>, counting each measure
                  equally, over the measures a company has. A company scored on fewer measures says so beside its
                  number, and is not measured against the others on equal terms.
                </li>
              </ol>
            </details>
          </>
        ) : null}

        {answer && companies.some((company) => company.unavailable) ? (
          <div>
            <h3 className="text-[14px] font-semibold text-white">Not compared</h3>
            <ul className="mt-1 space-y-1 text-[13px] leading-5 text-slate-400">
              {companies
                .filter((company) => company.unavailable)
                .map((company) => (
                  <li key={company.cik}>
                    <span className="font-semibold text-white">{nameFor(company)}</span> — {company.unavailable}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {answer && periods.size > 1 ? (
          <p className="text-[12px] leading-5 text-accent-amber">
            These companies&rsquo; years end on different dates, so they do not cover the same months.
          </p>
        ) : null}

        {withNumber.length > MOST - 1 ? (
          <p className="text-[12px] leading-5 text-slate-500">
            Studio reads {MOST} companies at a time, so the first {MOST - 1} you counted are compared.
          </p>
        ) : null}
      </section>
    </>
  );
}
