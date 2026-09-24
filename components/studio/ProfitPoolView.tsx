"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import industries from "@/lib/studio-project/data/industries.json";
import { longDate } from "@/lib/studio-project/cost-of-capital";
import { POOLS, exampleBlock, type Pool, type PoolBlock } from "@/lib/studio-project/profit-pool";
import { Panel, TableScroll } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";
import { readableName } from "./company-name";
import { StepHeading } from "./workspace/ResearchSteps";

/**
 * Where the money is made in an industry: *Measuring the Moat*'s profit pool.
 *
 * Mauboussin and Callahan, pp. 15-17. Each company is a block whose height is
 * the gap between its return on capital and what that capital costs, and whose
 * width is its share of the capital, so its area is its economic profit. It is
 * the paper's next step after the industry map, drawn the way its Exhibit 11
 * draws one industry by company.
 *
 * Only the five industries Studio has researched have one, and each says how
 * much of its industry it covers and names who it leaves out: the workspace
 * proposal is plain that "a profit-pool view must say which profit measure it
 * uses and what participants it covers". Pages for every claim:
 * docs/source-audits/studio-profit-pool.md.
 */

const SICS = industries.industries.map((entry) => entry.sic).filter((sic) => POOLS.has(sic));

const money = (value: number) => {
  const sign = value < 0 ? "−" : "";
  const size = Math.abs(value);
  return size >= 1e12
    ? `${sign}$${(size / 1e12).toFixed(2)}T`
    : size >= 1e9
      ? `${sign}$${(size / 1e9).toFixed(1)}B`
      : `${sign}$${Math.round(size / 1e6)}M`;
};
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const points = (value: number) => `${value < 0 ? "−" : ""}${Math.abs(value * 100).toFixed(1)} points`;

/** A company as a sentence would name it: no "Inc." or "Corp" trailing it. */
function shortName(raw: string): string {
  return readableName(raw)
    .replace(/ /g, " ")
    .replace(/,?\s+(Inc\.?|Corp\.?|Corporation|Co\.?|Ltd\.?|LLC|N\.V\.|Limited|Holdings,? Inc\.?|Industries Limited)$/i, "")
    .replace(/,?\s+(Inc\.?|Corp\.?|Corporation)$/i, "")
    .trim();
}

/** Tick spacing in percentage points that gives four or five lines. */
function niceStep(rangePoints: number): number {
  for (const step of [1, 2, 2.5, 5, 10, 20, 25, 50, 100]) if (rangePoints / step <= 5) return step;
  return 200;
}

/** One side of a block rounded, the side away from the zero line. */
function blockPath(left: number, right: number, zero: number, end: number): string {
  const width = right - left;
  const height = Math.abs(end - zero);
  const r = Math.max(0, Math.min(4, width / 2, height));
  if (end <= zero) {
    return `M${left},${zero}V${end + r}Q${left},${end} ${left + r},${end}H${right - r}Q${right},${end} ${right},${end + r}V${zero}Z`;
  }
  return `M${left},${zero}V${end - r}Q${left},${end} ${left + r},${end}H${right - r}Q${right},${end} ${right},${end - r}V${zero}Z`;
}

/** The chart's own width, so its text stays legible at every screen size rather than scaling down with it. */
function useWidth(initial: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function PoolChart({
  pool, shown, own, onSelect, onPreview,
}: {
  pool: Pool;
  shown: number | null;
  own: ReadonlySet<number>;
  onSelect: (cik: number) => void;
  onPreview: (cik: number | null) => void;
}) {
  const [ref, width] = useWidth(640);
  const height = 180;
  const pad = { left: 40, right: 8, top: 10, bottom: 28 };
  const plotWidth = Math.max(120, width - pad.left - pad.right);
  const plotBottom = height - pad.bottom;

  const spreads = pool.blocks.map((block) => block.spread * 100);
  const step = niceStep(Math.max(...spreads, 0) - Math.min(...spreads, 0));
  const top = Math.ceil(Math.max(...spreads, 0) / step) * step;
  const bottom = Math.floor(Math.min(...spreads, 0) / step) * step;
  const y = (pointsValue: number) => pad.top + ((top - pointsValue) / (top - bottom || 1)) * (plotBottom - pad.top);
  const ticks: number[] = [];
  for (let tick = bottom; tick <= top + 1e-9; tick += step) ticks.push(Math.round(tick * 10) / 10);

  let cumulative = 0;
  const placed = pool.blocks.map((block, index) => {
    const x0 = pad.left + cumulative * plotWidth;
    cumulative += block.capitalShare;
    const x1 = pad.left + cumulative * plotWidth;
    // The 2px surface gap between touching blocks, taken half from each side.
    const left = x0 + (index > 0 ? 1 : 0);
    const right = Math.max(left + 1, x1 - (index < pool.blocks.length - 1 ? 1 : 0));
    return { block, x0, x1, left, right };
  });

  return (
    <div ref={ref} className="mt-3">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block max-w-full"
        role="group"
        aria-label={`Profit pool for ${pool.label.toLowerCase()}: ${pool.blocks.length} companies, each a block whose height is its return less its cost of capital and whose width is its share of the capital`}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={pad.left + plotWidth}
              y1={y(tick)}
              y2={y(tick)}
              stroke={tick === 0 ? "var(--st-bound)" : "var(--st-hair)"}
              strokeWidth={1}
            />
            <text x={pad.left - 6} y={y(tick) + 4} textAnchor="end" className="fill-[var(--st-muted)] text-[11px] tabular-nums">
              {tick > 0 ? `+${tick}` : tick === 0 ? "0" : `−${Math.abs(tick)}`}
            </text>
          </g>
        ))}

        {placed.map(({ block, left, right }) => {
          const active = shown === block.cik;
          const end = y(block.spread * 100);
          return (
            <path
              key={block.cik}
              d={blockPath(left, right, y(0), end)}
              fill={block.spread >= 0 ? "var(--st-blue-edge)" : "var(--st-bad-edge)"}
              opacity={shown === null || active ? 1 : 0.62}
            />
          );
        })}

        {/* The company the learner investigated, marked on its block. */}
        {placed
          .filter(({ block }) => own.has(block.cik))
          .map(({ block, left, right }) => {
            const cx = (left + right) / 2;
            const edge = y(block.spread * 100);
            const cy = block.spread >= 0 ? edge - 9 : edge + 9;
            return <circle key={`own-${block.cik}`} cx={cx} cy={cy} r={4} fill="var(--st-ink)" stroke="var(--st-paper)" strokeWidth={2} />;
          })}

        {/* Names where there is room for them. The rest are in the readout and the table. */}
        {placed.map(({ block, left, right }) => {
          // The whole name or none: "Advanced" names nothing, and the readout
          // and the table carry every company whatever its width.
          const label = shortName(block.name);
          if (label.length * 6.2 > right - left - 6) return null;
          return (
            <text
              key={`name-${block.cik}`}
              x={(left + right) / 2}
              y={plotBottom + 18}
              textAnchor="middle"
              className="fill-[var(--st-sub)] text-[11px]"
            >
              {label}
            </text>
          );
        })}

        {/* Hit areas: the full height of each block's column, so a thin block
            can still be found, and every one reachable from the keyboard. */}
        {placed.map(({ block, x0, x1 }) => (
          <rect
            key={`hit-${block.cik}`}
            x={x0}
            y={pad.top}
            width={Math.max(1, x1 - x0)}
            height={plotBottom - pad.top + 24}
            fill="transparent"
            role="button"
            tabIndex={0}
            aria-pressed={shown === block.cik}
            aria-label={`${shortName(block.name)}: ${points(Math.abs(block.spread))} ${block.spread >= 0 ? "above" : "below"} its cost of capital, on ${pct(block.capitalShare)} of the capital. Economic profit ${money(block.economicProfit)}.`}
            className="cursor-pointer outline-none focus-visible:stroke-[var(--st-ink)] focus-visible:[stroke-width:2]"
            onClick={() => onSelect(block.cik)}
            onFocus={() => onSelect(block.cik)}
            onMouseEnter={() => onPreview(block.cik)}
            onMouseLeave={() => onPreview(null)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(block.cik);
              }
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/** The worked arithmetic for one block, which is the example the page teaches from. */
function Readout({ block, own }: { block: PoolBlock; own: boolean }) {
  const name = shortName(block.name);
  const above = block.spread >= 0;
  const flags = [
    block.taxRateAssumed ? "No tax rate could be read from its filings, so the 21% US federal rate stands in." : null,
    block.debtAssumedZero ? "It reports no borrowings, so its debt is taken as zero." : null,
    block.leasesExcluded ? `${money(block.leasesExcluded)} of lease commitments sit outside its capital.` : null,
  ].filter(Boolean);
  return (
    <div role="status" aria-label="The arithmetic for one block" className="mt-3 rounded-xl border border-st-hair bg-st-side/60 px-4 py-3 text-[13px] leading-6 text-st-body">
      <p>
        <strong className="font-semibold text-st-ink">{name}</strong>
        {own ? <span className="text-st-muted"> (the company you investigated)</span> : null}
        <span className="text-st-muted">, year to {block.period ? longDate(block.period) : "its latest year end"}.</span>{" "}
        It earned {pct(block.roic)} on {money(block.investedCapital)} of capital, and capital in this industry costs{" "}
        {pct(block.wacc)}. That is {points(Math.abs(block.spread))} {above ? "more" : "less"} than it costs, and{" "}
        {points(Math.abs(block.spread))} of {money(block.investedCapital)} is{" "}
        <strong className="font-semibold text-st-ink">{money(Math.abs(block.economicProfit))}</strong>{" "}
        {above ? "of economic profit a year" : "a year short of what its capital costs"}: the block&rsquo;s area, on{" "}
        {pct(block.capitalShare)} of the capital here.
        {flags.length ? <span className="text-[12px] text-st-muted"> {flags.join(" ")}</span> : null}
      </p>
    </div>
  );
}

export default function ProfitPoolView() {
  const { project } = useWorkspace();

  // Companies the learner filled from the SEC, by the SEC's own number: the one
  // link to a block that does not depend on how anybody spells a name.
  const own = useMemo(
    () =>
      new Set(
        (project?.investigations ?? [])
          .map((item) => (item.source?.cik ? Number(item.source.cik) : NaN))
          .filter((cik) => Number.isFinite(cik)),
      ),
    [project],
  );
  const ownSic = useMemo(() => SICS.find((sic) => POOLS.get(sic)!.blocks.some((block) => own.has(block.cik))), [own]);

  const [sic, setSic] = useState<string | null>(null);
  const current = sic ?? ownSic ?? SICS[0];
  const pool = POOLS.get(current)!;

  const [selected, setSelected] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const starting = pool.blocks.find((block) => own.has(block.cik)) ?? exampleBlock(pool);
  const chosen = pool.blocks.find((block) => block.cik === selected) ?? starting;
  const shownBlock = pool.blocks.find((block) => block.cik === preview) ?? chosen;

  const thin = pool.revenueCovered < 0.5;
  const hasOwn = pool.blocks.some((block) => own.has(block.cik));

  const sources = (
    <>
      <p>
        Mauboussin and Callahan, <em>Measuring the Moat</em>, Counterpoint Global, Morgan Stanley, 15 October 2024,
        pp. 15-17. The paper calls this a profit pool, and calls the cost of capital WACC.
      </p>
      <p className="mt-2">
        Returns and capital come from each company&rsquo;s latest annual report filed with the SEC, read on{" "}
        {longDate(industries.builtOn)}. Capital is borrowings plus equity less cash, with leases outside it.
      </p>
      <p className="mt-2">
        The cost of capital, {pct(pool.cost.costOfCapital)}, is the industry&rsquo;s, the same figure Investigate uses, and
        every company here is measured against it.
      </p>
      <details className="group mt-2">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[13px] font-semibold text-st-body">
          How it is built
          <span className="ml-2 text-[12px] font-normal text-st-muted group-open:hidden">Show</span>
          <span className="ml-2 hidden text-[12px] font-normal text-st-muted group-open:inline">Hide</span>
        </summary>
        {pool.cost.provenance.map((line) => (
          <p key={line} className="mt-2">
            {line}
          </p>
        ))}
        <p className="mt-2">
          Figures in another currency are found by comparing the revenue behind each return with the revenue the SEC
          records in dollars. A currency worth about as much as the dollar would not show up that way.
        </p>
      </details>
    </>
  );

  return (
    <div className="space-y-4">
      <StepHeading step="pool" />

      {/* Wrapped from sm up, where two rows at most fit the budget. On a phone
          the five took three rows, so there they scroll in one, as the map's
          company row does. */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label="Industry">
        {SICS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              setSic(entry);
              setSelected(null);
              setPreview(null);
            }}
            aria-pressed={entry === current}
            className={cn(
              "inline-flex min-h-11 flex-shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-[13px] transition-colors",
              entry === current
                ? "border-st-blue-edge bg-st-select text-st-ink"
                : "border-st-hair bg-st-paper text-st-muted hover:border-st-bound hover:text-st-body",
            )}
          >
            {POOLS.get(entry)!.label}
          </button>
        ))}
      </div>

      <Panel>
        {/* The definition before the picture that uses it. */}
        <p className="text-[13px] leading-6 text-st-muted">
          A company&rsquo;s <strong className="font-semibold text-st-body">return on capital</strong> is its operating
          profit after tax as a share of the money invested in it. That money has a cost, since lenders and shareholders
          could have put it elsewhere. The return less that cost, times the capital, is its{" "}
          <strong className="font-semibold text-st-body">economic profit</strong>: what it made beyond that cost. Each
          block is a company. Its height is that gap in percentage points and its width is its capital, so its area is
          its economic profit. <em>Measuring the Moat</em> calls this picture a profit pool.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-st-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-3.5 rounded-sm bg-[var(--st-blue-edge)]" />
            Earns more than its capital costs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-2.5 w-3.5 rounded-sm bg-[var(--st-bad-edge)]" />
            Earns less
          </span>
          {hasOwn ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-[var(--st-ink)]" />
              The company you investigated
            </span>
          ) : null}
        </div>

        <PoolChart
          pool={pool}
          shown={shownBlock?.cik ?? null}
          own={own}
          onSelect={(cik) => {
            setSelected(cik);
            setPreview(null);
          }}
          onPreview={setPreview}
        />

        {shownBlock ? <Readout block={shownBlock} own={own.has(shownBlock.cik)} /> : null}

        <p className="mt-3 text-[13px] leading-6 text-st-body">
          Together these {pool.blocks.length} companies made{" "}
          <strong className="font-semibold text-st-ink">{money(pool.totalEconomicProfit)}</strong> of economic profit on{" "}
          {money(pool.totalInvestedCapital)} of capital.{" "}
          <span className={cn(thin && "font-semibold text-st-warn")}>
            They made {Math.round(pool.revenueCovered * 100)}% of this industry&rsquo;s revenue counted for{" "}
            {industries.years[1]}
            {thin ? ": most of it is not here." : "."}
          </span>{" "}
          A large pool draws challengers, the paper warns: &ldquo;your margin is my opportunity&rdquo; (see{" "}
          <Link href="/studio/competition" className="text-accent-cyan hover:underline">
            the threat of new entrants
          </Link>
          ).
        </p>

        <div className="mt-2 border-t border-st-hair">
          <details className="group border-b border-st-hair">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-[14px] font-semibold text-st-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
              Every company, and who is not drawn
              <span className="text-[12px] font-normal text-st-muted group-open:hidden">
                {pool.blocks.length} drawn, {pool.leftOut.length} not
              </span>
              <span className="hidden text-[12px] font-normal text-st-muted group-open:inline">Hide</span>
            </summary>
            <TableScroll>
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead className="text-[12px] text-st-muted">
                  <tr>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 text-right font-medium">Return</th>
                    <th className="pb-2 text-right font-medium">Less its cost</th>
                    <th className="pb-2 text-right font-medium">Capital</th>
                    <th className="pb-2 text-right font-medium">Economic profit</th>
                  </tr>
                </thead>
                <tbody>
                  {pool.blocks.map((block) => (
                    <tr key={block.cik} className="border-t border-st-hair">
                      <td className="py-2 pr-3 text-st-body">
                        {shortName(block.name)}
                        {own.has(block.cik) ? <span className="ml-1 text-[12px] text-st-muted">yours</span> : null}
                      </td>
                      <td className="py-2 text-right tabular-nums text-st-sub">{pct(block.roic)}</td>
                      <td className="py-2 text-right tabular-nums text-st-sub">{points(block.spread)}</td>
                      <td className="py-2 text-right tabular-nums text-st-sub">{money(block.investedCapital)}</td>
                      <td className="py-2 text-right tabular-nums text-st-body">{money(block.economicProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <ul className="mb-3 mt-3 space-y-2">
              {pool.leftOut.map((entry) => (
                <li key={entry.name} className="text-[13px] leading-6 text-st-muted">
                  <span className="font-semibold text-st-body">Not drawn: {shortName(entry.name)}.</span> {entry.says}
                </li>
              ))}
              <li className="text-[13px] leading-6 text-st-muted">
                Only companies filing with the SEC under this industry&rsquo;s code are counted at all, so a private or
                foreign competitor is missing too.
              </li>
            </ul>
          </details>

          {/* The paper's own cautions, p. 15, and the one its exhibits' notes add. */}
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-[14px] font-semibold text-st-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
              What this cannot tell you
              <span className="text-[12px] font-normal text-st-muted group-open:hidden">4 things</span>
              <span className="hidden text-[12px] font-normal text-st-muted group-open:inline">Hide</span>
            </summary>
            <ul className="mb-1 space-y-2">
              <li className="text-[13px] leading-6 text-st-muted">
                One year is not a business cycle. The paper looks across a whole cycle to reduce the effect of short-term or
                cyclical factors; this is each company&rsquo;s latest year
                {pool.periods
                  ? pool.periods.from === pool.periods.to
                    ? `, ending ${longDate(pool.periods.to)}`
                    : `, ending between ${longDate(pool.periods.from)} and ${longDate(pool.periods.to)}`
                  : ""}
                .
              </li>
              <li className="text-[13px] leading-6 text-st-muted">
                One picture is not a story. The paper compares pools years apart to see how the money moved between
                companies. Studio has one year, so it cannot say how this pool has changed.
              </li>
              <li className="text-[13px] leading-6 text-st-muted">
                The paper&rsquo;s returns are adjusted for intangible investments, such as software a company builds for
                itself, which accounts record as an expense. These are not. The paper finds the adjustment pulls the very
                highest and lowest returns toward the middle, so read the tallest and deepest blocks with that in mind.
              </li>
              <li className="text-[13px] leading-6 text-st-muted">
                Every company is measured against its industry&rsquo;s cost of capital, {pct(pool.cost.costOfCapital)}.
                A company&rsquo;s own differs with its own risk and borrowing, and moves every block&rsquo;s height with it.
              </li>
            </ul>
          </details>
        </div>
      </Panel>

      <StudioAside
        inline={
          <details className="group rounded-xl border border-st-hair bg-st-paper p-4">
            <summary className="cursor-pointer text-[13px] text-st-body">Where these numbers come from</summary>
            <div className="mt-2 text-[13px] leading-6 text-st-muted">{sources}</div>
          </details>
        }
        beside={
          <Panel>
            <h2 className="text-[14px] font-semibold text-st-ink">Where these numbers come from</h2>
            <div className="mt-2 text-[13px] leading-6 text-st-muted">{sources}</div>
          </Panel>
        }
      />
    </div>
  );
}
