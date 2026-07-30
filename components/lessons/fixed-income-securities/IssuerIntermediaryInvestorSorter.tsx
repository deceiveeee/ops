"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, Feedback } from "./shared";

type Role = "Issuer" | "Intermediary" | "Investor";

type Card = {
  id: string;
  text: string;
  role: Role;
  note: string;
};

const CARDS: Card[] = [
  {
    id: "c1",
    text: "A city borrows to build a school.",
    role: "Issuer",
    note: "Municipality borrowing.",
  },
  {
    id: "c2",
    text: "A pension fund buys 10-year corporate bonds to match future retiree payments.",
    role: "Investor",
    note: "Lending capital for future payouts.",
  },
  {
    id: "c3",
    text: "An investment bank helps a company sell new bonds.",
    role: "Intermediary",
    note: "Underwriting / distribution.",
  },
  {
    id: "c4",
    text: "A credit-rating agency assigns a rating to a bond.",
    role: "Intermediary",
    note: "Information / assessment service.",
  },
  {
    id: "c5",
    text: "A hedge fund buys mortgage-backed securities.",
    role: "Investor",
    note: "Lending capital.",
  },
  {
    id: "c6",
    text: "An SPV issues asset-backed securities.",
    role: "Issuer",
    note: "Special-purpose vehicle issuing.",
  },
  {
    id: "c7",
    text: "A liquidity enhancer helps make trading easier.",
    role: "Intermediary",
    note: "Market-making / support.",
  },
  {
    id: "c8",
    text: "An insurance company buys bonds to back future claims.",
    role: "Investor",
    note: "Lending capital.",
  },
];

const ROLES: Role[] = ["Issuer", "Intermediary", "Investor"];

type RoleClasses = { border: string; borderSoft: string; text: string };

const ROLE_TONE: Record<Role, RoleClasses> = {
  Issuer: {
    border: "border-accent-purple/40",
    borderSoft: "border-accent-purple/40",
    text: "text-accent-purple",
  },
  Intermediary: {
    border: "border-accent-amber/40",
    borderSoft: "border-accent-amber/40",
    text: "text-accent-amber",
  },
  Investor: {
    border: "border-accent-cyan/40",
    borderSoft: "border-accent-cyan/40",
    text: "text-accent-cyan",
  },
};

const PARTICIPANTS: { role: Role; items: string[] }[] = [
  {
    role: "Issuer",
    items: [
      "Governments",
      "Corporations",
      "Commercial Banks",
      "States",
      "Municipalities",
      "SPVs",
      "Foreign Institutions",
    ],
  },
  {
    role: "Intermediary",
    items: [
      "Primary Dealers",
      "Other Dealers",
      "Investment Banks",
      "Credit-rating Agencies",
      "Credit Enhancers",
      "Liquidity Enhancers",
    ],
  },
  {
    role: "Investor",
    items: [
      "Governments",
      "Pension Funds",
      "Insurance Companies",
      "Commercial Banks",
      "Mutual Funds",
      "Hedge Funds",
      "Foreign Institutions",
      "Individuals",
    ],
  },
];

/**
 * Section 8 — Participants: Issuer / Intermediary / Investor sorter.
 * Tap-to-place with feedback and a light shake on incorrect placement.
 */
export default function IssuerIntermediaryInvestorSorter() {
  const [placed, setPlaced] = useState<Record<string, Role>>({});

  const place = (id: string, role: Role) =>
    setPlaced((prev) => ({ ...prev, [id]: role }));

  const remove = (id: string) =>
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const placedCount = Object.keys(placed).length;
  const unplaced = CARDS.filter((c) => !placed[c.id]);
  const allDone = placedCount === CARDS.length;
  const allCorrect = allDone && CARDS.every((c) => placed[c.id] === c.role);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Who is doing what?
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          {placedCount} / {CARDS.length} placed
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Issuers, intermediaries, investors
      </h3>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        Three jobs power the bond market: borrowing, lending, and helping the
        market function. Tap a scenario, then tap a role to place it. Some
        institutions can appear in more than one role.
      </p>

      {/* Unplaced pool */}
      <div className="mt-5 flex flex-wrap gap-2">
        <AnimatePresence>
          {unplaced.length === 0 ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-sans text-[12px] text-slate-500"
            >
              All scenarios placed.
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
                {c.text}
              </motion.span>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Three role columns */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {ROLES.map((role) => (
          <RoleColumn
            key={role}
            role={role}
            cards={CARDS.filter((c) => placed[c.id] === role)}
            unplaced={unplaced}
            onPlace={(id) => place(id, role)}
            onRemove={remove}
          />
        ))}
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Feedback status={allCorrect ? "correct" : "incorrect"}>
              {allCorrect
                ? "Every scenario is in the right role. Remember: some institutions can act in more than one role depending on the transaction."
                : "Some placements need another look. Think about whether this party is borrowing, lending, or helping the market function."}
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full participant sets */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
        <div className="ops-caption text-[11px] text-accent-purple">
          Full participant sets
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PARTICIPANTS.map((p) => (
            <div
              key={p.role}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div
                className={cn(
                  "font-sans text-[12px] uppercase tracking-[0.14em]",
                  ROLE_TONE[p.role].text,
                )}
              >
                {p.role}
              </div>
              <ul className="mt-3 space-y-1.5">
                {p.items.map((item) => (
                  <li
                    key={item}
                    className="ops-body flex items-start gap-2 text-[13px] text-slate-300"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-500"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </InteractiveFrame>
  );
}

function RoleColumn({
  role,
  cards,
  unplaced,
  onPlace,
  onRemove,
}: {
  role: Role;
  cards: Card[];
  unplaced: Card[];
  onPlace: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "rounded-2xl border bg-ink-950/40 p-4",
        ROLE_TONE[role].borderSoft,
      )}
    >
      <div
        className={cn(
          "font-sans text-[12px] uppercase tracking-[0.14em]",
          ROLE_TONE[role].text,
        )}
      >
        {role}
      </div>
      <div className="mt-3 space-y-2">
        {cards.length === 0 && (
          <span className="font-sans text-[11px] text-slate-600">empty</span>
        )}
        <AnimatePresence>
          {cards.map((c) => {
            const correct = c.role === role;
            return (
              <motion.div
                key={c.id}
                layout
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                animate={
                  correct
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 1, scale: 1, x: [0, -4, 4, -3, 3, 0] }
                }
                transition={{ duration: reduce ? 0.1 : 0.4 }}
                className={cn(
                  "rounded-lg border p-2.5",
                  correct
                    ? "border-accent-green/40 bg-accent-green/10"
                    : "border-accent-red/40 bg-accent-red/10",
                )}
              >
                <button
                  type="button"
                  onClick={() => onRemove(c.id)}
                  aria-label={`Remove from ${role}`}
                  className="block w-full text-left text-[12px] leading-5 text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                >
                  {c.text}
                  <span className="mt-1 block font-sans text-[10px] text-slate-400">
                    tap to remove ✕
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {unplaced.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {unplaced.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPlace(c.id)}
              aria-label={`Place scenario into ${role}`}
              className="rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-[10px] leading-tight text-slate-400 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              +
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
