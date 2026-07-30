"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CellId = "tl" | "tr" | "bl" | "br";
type Tone = "cyan" | "amber" | "green" | "red";

const toneRing: Record<Tone, string> = {
  cyan: "border-accent-cyan/70 bg-accent-cyan/15",
  amber: "border-accent-amber/70 bg-accent-amber/15",
  green: "border-accent-green/70 bg-accent-green/15",
  red: "border-accent-red/70 bg-accent-red/15",
};

const toneText: Record<Tone, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
  green: "text-accent-green",
  red: "text-accent-red",
};

/**
 * Single labeled 2×2 matrix with readable row/column headers. Cells are
 * arbitrary ReactNode so values or formulas can be placed inside. A subset of
 * cells can be highlighted (with a text label, not color only) to walk through
 * which cell is being filled during a derivation.
 */
export function Matrix2x2({
  rowLabels,
  colLabels,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  highlight = [],
  highlightTone = "cyan",
  title,
  caption,
  centerLabel,
}: {
  rowLabels: [string, string];
  colLabels: [string, string];
  topLeft: ReactNode;
  topRight: ReactNode;
  bottomLeft: ReactNode;
  bottomRight: ReactNode;
  highlight?: CellId[];
  highlightTone?: Tone;
  title?: ReactNode;
  caption?: ReactNode;
  /** Optional label shown in the matrix center (e.g. "Σ"). */
  centerLabel?: ReactNode;
}) {
  const cellBase =
    "relative flex min-h-[92px] items-center justify-center border px-4 py-5 text-center text-[16px] leading-snug text-slate-100";
  const dim = "border-white/10 bg-white/[0.02]";
  const off = "border-white/10 bg-white/[0.015]";
  const lit = cn(toneRing[highlightTone], "shadow-glow");

  const renderCell = (id: CellId, content: ReactNode, kind: "diag" | "off") => {
    const isLit = highlight.includes(id);
    return (
      <div className={cn(cellBase, kind === "diag" ? dim : off, isLit && lit)}>
        {isLit && (
          <span
            className={cn(
              "absolute right-2 top-2 font-sans text-[11px] uppercase tracking-[0.16em]",
              toneText[highlightTone],
            )}
            aria-hidden
          >
            ●
          </span>
        )}
        {content}
      </div>
    );
  };

  return (
    <figure className="w-full">
      {title && (
        <figcaption className="mb-3 font-sans text-[12px] uppercase tracking-[0.18em] text-slate-400">
          {title}
        </figcaption>
      )}
      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          {/* column headers */}
          <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
            <div />
            {colLabels.map((c) => (
              <div
                key={c}
                className="pb-2 text-center font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400"
              >
                {c}
              </div>
            ))}
          </div>
          {/* rows */}
          <div className="grid grid-cols-[auto_1fr_1fr] items-stretch gap-2">
            <div className="flex items-center pr-2 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              {rowLabels[0]}
            </div>
            {renderCell("tl", topLeft, "diag")}
            {renderCell("tr", topRight, "off")}
          </div>
          <div className="mt-2 grid grid-cols-[auto_1fr_1fr] items-stretch gap-2">
            <div className="flex items-center pr-2 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              {rowLabels[1]}
            </div>
            {renderCell("bl", bottomLeft, "off")}
            {renderCell("br", bottomRight, "diag")}
          </div>
        </div>
      </div>
      {centerLabel && (
        <div className="mt-3 text-center font-sans text-[13px] text-slate-500">{centerLabel}</div>
      )}
      {caption && (
        <figcaption className="mt-3 text-[15px] leading-[1.6] text-slate-400">{caption}</figcaption>
      )}
    </figure>
  );
}

/**
 * Side-by-side comparison of the raw covariance matrix and the weighted
 * contribution matrix for a two-asset portfolio. Desktop: raw → weight
 * application → weighted. Mobile: stacked. Makes explicit that the raw matrix
 * describes assets while the weighted matrix describes contributions to THIS
 * portfolio.
 */
export default function PortfolioMatrixVisual({
  rowLabels,
  colLabels,
  rawCells,
  weightedCells,
  sumNote,
}: {
  rowLabels: [string, string];
  colLabels: [string, string];
  rawCells: {
    tl: ReactNode;
    tr: ReactNode;
    bl: ReactNode;
    br: ReactNode;
  };
  weightedCells: {
    tl: ReactNode;
    tr: ReactNode;
    bl: ReactNode;
    br: ReactNode;
  };
  sumNote?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <div>
        <div className="mb-3 font-sans text-[12px] uppercase tracking-[0.18em] text-accent-purple">
          Raw matrix
        </div>
        <p className="mb-4 max-w-sm text-[15px] leading-[1.6] text-slate-400">
          Contains relationships <em>between assets</em>. Do not add these directly.
        </p>
        <Matrix2x2
          rowLabels={rowLabels}
          colLabels={colLabels}
          topLeft={rawCells.tl}
          topRight={rawCells.tr}
          bottomLeft={rawCells.bl}
          bottomRight={rawCells.br}
          centerLabel="Σ — asset relationships"
        />
      </div>

      <div className="flex items-center justify-center lg:flex-col lg:gap-2">
        <div className="flex items-center gap-3 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2 font-sans text-[13px] text-accent-cyan">
          × w<sub>i</sub> w<sub>j</sub>
        </div>
        <div className="hidden h-px w-px lg:block" />
        <div className="font-sans text-[12px] text-slate-500 lg:rotate-0">apply weights</div>
      </div>

      <div>
        <div className="mb-3 font-sans text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
          Weighted matrix
        </div>
        <p className="mb-4 max-w-sm text-[15px] leading-[1.6] text-slate-400">
          Contains contributions to <em>this portfolio</em>. Sum every cell to get σ²_P.
        </p>
        <Matrix2x2
          rowLabels={rowLabels}
          colLabels={colLabels}
          topLeft={weightedCells.tl}
          topRight={weightedCells.tr}
          bottomLeft={weightedCells.bl}
          bottomRight={weightedCells.br}
          highlightTone="green"
          centerLabel="wᵀΣw — portfolio contributions"
        />
      </div>

      {sumNote && (
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.05] px-5 py-4 text-[16px] leading-[1.65] text-slate-100">
            {sumNote}
          </div>
        </div>
      )}
    </div>
  );
}
