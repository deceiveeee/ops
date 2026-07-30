"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  Feedback,
} from "./shared";

type Level = "Low" | "Medium" | "High";

type Category = {
  id: string;
  name: string;
  issuer: string;
  cashFlows: string;
  buyers: string;
  risk: string;
  translation: string;
  liquidity: Level;
  complexity: Level;
  defaultSensitivity: Level;
  bucket: "Government" | "Company" | "Local Government" | "Mortgage Pool" | "Structured Product";
};

const CATEGORIES: Category[] = [
  {
    id: "treasury",
    name: "Treasury Securities",
    issuer: "National governments.",
    cashFlows: "Bills pay once at maturity; notes/bonds usually pay coupons plus principal.",
    buyers: "Individuals, banks, funds, foreign institutions, central banks.",
    risk: "Usually treated as very low default risk but still exposed to inflation and interest-rate risk.",
    translation: "Government IOUs.",
    liquidity: "High",
    complexity: "Low",
    defaultSensitivity: "Low",
    bucket: "Government",
  },
  {
    id: "agency",
    name: "Federal Agency Securities",
    issuer: "Agencies or government-sponsored entities.",
    cashFlows: "Usually bond-like interest and principal.",
    buyers: "Banks, funds, insurers, institutions.",
    risk: "Agency support varies; do not assume identical to Treasuries.",
    translation: "Agency-related borrowing.",
    liquidity: "Medium",
    complexity: "Medium",
    defaultSensitivity: "Low",
    bucket: "Government",
  },
  {
    id: "corporate",
    name: "Corporate Securities",
    issuer: "Companies.",
    cashFlows: "Commercial paper is short-term; bonds/MTNs may pay coupons.",
    buyers: "Mutual funds, pension funds, insurers, banks, individuals.",
    risk: "Credit/default risk matters.",
    translation: "Company IOUs.",
    liquidity: "Medium",
    complexity: "Medium",
    defaultSensitivity: "Medium",
    bucket: "Company",
  },
  {
    id: "municipal",
    name: "Municipal Securities",
    issuer: "States, cities, counties, public authorities.",
    cashFlows: "Often coupon bonds.",
    buyers: "Individuals, municipal funds, institutions.",
    risk: "Credit quality and tax treatment vary.",
    translation: "Local-government IOUs.",
    liquidity: "Medium",
    complexity: "Medium",
    defaultSensitivity: "Medium",
    bucket: "Local Government",
  },
  {
    id: "mbs",
    name: "Mortgage-Backed Securities",
    issuer: "Pools/vehicles backed by mortgages.",
    cashFlows: "Payments depend on mortgage borrowers' principal and interest payments.",
    buyers: "Funds, banks, insurers, institutional investors.",
    risk: "Prepayment, credit, liquidity, and structure risk.",
    translation: "Claims on a pool of mortgages.",
    liquidity: "Medium",
    complexity: "High",
    defaultSensitivity: "Medium",
    bucket: "Mortgage Pool",
  },
  {
    id: "derivatives",
    name: "Derivatives / Structured Credit",
    issuer: "Financial institutions or structured vehicles.",
    cashFlows: "Depend on reference assets, tranches, or credit events.",
    buyers: "Institutions, hedge funds, banks.",
    risk: "Complex payoff and liquidity risk.",
    translation: "Engineered claims built on debt or credit risk.",
    liquidity: "Low",
    complexity: "High",
    defaultSensitivity: "High",
    bucket: "Structured Product",
  },
];

const SUPPLEMENTAL: { term: string; def: string }[] = [
  { term: "Treasury bill", def: "Short-term, 4–52 weeks, sold at discount or par, pays face at maturity." },
  { term: "Treasury note", def: "2, 3, 5, 7, 10-year; pays interest every six months." },
  { term: "Treasury bond", def: "20 or 30-year; pays interest every six months." },
  {
    term: "STRIPS",
    def: "Separated interest and principal from eligible Treasury notes/bonds/TIPS; each piece is its own zero-coupon security. Bills and FRNs are not stripped.",
  },
];

const BUCKETS = ["Government", "Company", "Local Government", "Mortgage Pool", "Structured Product"] as const;

const LEVEL_TONE: Record<Level, string> = {
  Low: "text-accent-green",
  Medium: "text-accent-amber",
  High: "text-accent-red",
};

/**
 * Section 4 — Bond market explorer + "Build the market" placement activity.
 */
export default function BondMarketExplorer() {
  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Bond market explorer
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Six families of fixed income
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Classifying the bond market
      </h3>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        The bond market is not one market. It is several markets grouped by
        issuer and structure. Expand a card to see who issues it, what cash flows
        it promises, who buys it, and where the risk sits.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.id} cat={c} />
        ))}
      </div>

      {/* Supplemental Treasury definitions */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
        <div className="ops-caption text-[11px] text-accent-purple">
          Treasury building blocks
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUPPLEMENTAL.map((s) => (
            <div key={s.term} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="font-sans text-[12px] text-accent-cyan">{s.term}</div>
              <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-300">{s.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Build the market */}
      <div className="mt-8">
        <BuildTheMarket />
      </div>
    </InteractiveFrame>
  );
}

function CategoryCard({ cat }: { cat: Category }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white/[0.03] p-5 transition-colors",
        open ? "border-accent-purple/50" : "border-white/10",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="ops-caption font-sans text-[11px] text-accent-purple">
          {cat.id.toUpperCase()}
        </span>
        <div className="flex gap-3 font-sans text-[10px] uppercase tracking-[0.14em]">
          <Micro label="liq" value={cat.liquidity} />
          <Micro label="cx" value={cat.complexity} />
          <Micro label="def" value={cat.defaultSensitivity} />
        </div>
      </div>

      <h4 className="ops-interactive-title mt-3 text-lg text-white">{cat.name}</h4>
      <p className="ops-caption mt-1 text-[12px] italic text-slate-400">
        &ldquo;{cat.translation}&rdquo;
      </p>

      <button
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "Hide" : "Show"} details for ${cat.name}`}
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium text-slate-100 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
      >
        {open ? "Hide details" : "Show details"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <DetailRow label="Issuer" value={cat.issuer} />
              <DetailRow label="Cash flows" value={cat.cashFlows} />
              <DetailRow label="Buyers" value={cat.buyers} />
              <DetailRow label="Risk" value={cat.risk} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Micro({ label, value }: { label: string; value: Level }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-slate-500">{label}</span>
      <span className={LEVEL_TONE[value]}>{value[0]}</span>
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <p className="ops-body mt-0.5 text-[13px] leading-6 text-slate-200">{value}</p>
    </div>
  );
}

/**
 * Tap-to-place activity: place each category into the correct market bucket.
 */
function BuildTheMarket() {
  const [placed, setPlaced] = useState<Record<string, string>>({});

  const place = (catId: string, bucket: string) =>
    setPlaced((prev) => ({ ...prev, [catId]: bucket }));

  const remove = (catId: string) =>
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });

  const placedCount = Object.keys(placed).length;
  const allCorrect = CATEGORIES.every((c) => placed[c.id] === c.bucket);

  const unplaced = CATEGORIES.filter((c) => !placed[c.id]);

  return (
    <div className="rounded-2xl border border-accent-purple/30 bg-accent-purple/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-purple">
          Build the market
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          {placedCount} / {CATEGORIES.length} placed
        </span>
      </div>
      <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
        Tap a category, then tap a bucket to place it. Tap a placed chip to
        remove it.
      </p>

      {/* Unplaced pool */}
      <div className="mt-4 flex flex-wrap gap-2">
        <AnimatePresence>
          {unplaced.length === 0 ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-sans text-[12px] text-slate-500"
            >
              All categories placed.
            </motion.span>
          ) : (
            unplaced.map((c) => (
              <motion.span
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-full border border-white/20 bg-white/[0.04] px-3 py-1.5 text-[13px] text-slate-100"
              >
                {c.name}
              </motion.span>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Buckets */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUCKETS.map((bucket) => {
          const items = CATEGORIES.filter((c) => placed[c.id] === bucket);
          return (
            <Bucket
              key={bucket}
              bucket={bucket}
              items={items}
              unplaced={unplaced}
              onPlace={(catId) => place(catId, bucket)}
              onRemove={remove}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {placedCount === CATEGORIES.length && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Feedback status={allCorrect ? "correct" : "incorrect"}>
              {allCorrect
                ? "Every category is in the right bucket. The same instrument can sit in different markets depending on its issuer and structure."
                : "Some placements need another look. Re-check the issuer and structure of each category."}
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bucket({
  bucket,
  items,
  unplaced,
  onPlace,
  onRemove,
}: {
  bucket: string;
  items: Category[];
  unplaced: Category[];
  onPlace: (catId: string) => void;
  onRemove: (catId: string) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="ops-caption text-[11px] text-slate-300">{bucket}</div>
      <div className="mt-3 flex min-h-[2.5rem] flex-wrap gap-2">
        {items.length === 0 && (
          <span className="font-sans text-[11px] text-slate-600">empty</span>
        )}
        {items.map((c) => {
          const correct = c.bucket === bucket;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onRemove(c.id)}
              aria-label={`Remove ${c.name} from ${bucket}`}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                correct
                  ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                  : "border-accent-red/50 bg-accent-red/10 text-accent-red",
              )}
            >
              {c.name} ✕
            </button>
          );
        })}
      </div>

      {unplaced.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {unplaced.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPlace(c.id)}
              aria-label={`Place ${c.name} into ${bucket}`}
              className="rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-[11px] text-slate-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              + {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
