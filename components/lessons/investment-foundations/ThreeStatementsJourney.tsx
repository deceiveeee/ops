"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";
import StatementInvestigationShell, {
  DefinitionStrip,
  StatementChoice,
  StatementFeedback,
  StatementPanel,
  type StatementInvestigationStep,
  type StatementSceneProps,
} from "./StatementInvestigationShell";

const SLUG = "if-4-1-the-three-financial-statements";

const STEPS: readonly StatementInvestigationStep[] = [
  {
    label: "Open the filing",
    title: "Three statements, three views of one company",
    guide: "Start with what each statement measures and the time window it covers. The labels are not interchangeable.",
    instruction: "Open all three statement tabs.",
    next: "Trace one sale",
  },
  {
    label: "Trace a credit sale",
    title: "Revenue can arrive before cash",
    guide: "A credit sale creates revenue now, a receivable at the reporting date, and cash only when the customer pays.",
    instruction: "Run both events in order.",
    next: "Match the question",
  },
  {
    label: "Choose the evidence",
    title: "Ask the statement that can answer",
    guide: "An investor question should point to a statement and a time lens before it points to a number.",
    instruction: "Match every question to its strongest starting statement.",
    next: "File the evidence map",
  },
  {
    label: "Evidence map",
    title: "Build the three-statement evidence map",
    guide: "Now distinguish a period result from a year-end position without relying on memorized labels.",
    instruction: "Answer the independent check and save the map.",
    next: "Open Lesson 4.2",
  },
];

export default function ThreeStatementsJourney() {
  return (
    <StatementInvestigationShell
      lessonSlug={SLUG}
      ariaLabel="Three financial statements investigation"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <StatementTabs onComplete={onComplete} />;
        if (step === 1) return <CreditSaleTrace onComplete={onComplete} />;
        if (step === 2) return <QuestionMatcher onComplete={onComplete} />;
        return <EvidenceMap onComplete={onComplete} />;
      }}
      nextLesson={{ href: "/lessons/if-4-2-read-the-balance-sheet", label: "Continue to the balance-sheet X-ray" }}
    />
  );
}

const STATEMENTS = [
  {
    id: "balance",
    name: "Balance sheet",
    scope: "A point in time",
    question: "What does Cedar Works control, and who has claims on it at year-end?",
    definition: "A balance sheet reports recognized assets, liabilities, and shareholders' equity at a specified date.",
    tone: "amber" as const,
  },
  {
    id: "income",
    name: "Income statement",
    scope: "A period",
    question: "How did revenue become operating income and net income during the year?",
    definition: "An income statement reports recognized revenue, expenses, and profit over a period.",
    tone: "cyan" as const,
  },
  {
    id: "cash",
    name: "Statement of cash flows",
    scope: "A period",
    question: "Why did cash change during the year?",
    definition: "A statement of cash flows groups cash receipts and payments into operating, investing, and financing activities over a period.",
    tone: "green" as const,
  },
];

function StatementTabs({ onComplete }: StatementSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState(STATEMENTS[0].id);
  const item = STATEMENTS.find((statement) => statement.id === active) ?? STATEMENTS[0];

  const open = (id: string) => {
    setActive(id);
    setOpened((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <div>
      <DefinitionStrip term="financial statement">
        A structured report that records one view of a company&apos;s financial position or activity. No single statement answers every investor question.
      </DefinitionStrip>
      <div className="mt-5 grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Cedar Works statements">
        {STATEMENTS.map((statement) => (
          <button
            key={statement.id}
            type="button"
            role="tab"
            aria-selected={active === statement.id}
            onClick={() => open(statement.id)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${active === statement.id ? "border-accent-amber/40 bg-accent-amber/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
          >
            <span className="ops-caption text-[12px] text-slate-500">{statement.scope}</span>
            <span className="mt-1 block text-sm font-semibold text-white">{statement.name}</span>
          </button>
        ))}
      </div>
      <StatementPanel className="mt-4 min-h-48">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="ops-caption text-[12px] text-slate-500">Cedar Works · FY 2026</div>
            <div className="mt-1 text-lg font-semibold text-white">{item.name}</div>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-accent-amber">{item.scope}</span>
        </div>
        <p className="ops-body mt-4 text-[15px] text-slate-200">{item.definition}</p>
        <div className="mt-4 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.06] p-4 text-sm leading-6 text-slate-200">
          <span className="font-semibold text-accent-cyan">Investor question: </span>{item.question}
        </div>
      </StatementPanel>
      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-400">{opened.length} of 3 statement views opened</span>
        <button
          type="button"
          disabled={opened.length < 3}
          onClick={onComplete}
          className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green disabled:cursor-not-allowed disabled:opacity-40"
        >
          Verify statement map
        </button>
      </div>
    </div>
  );
}

/*
 * One credit sale drawn as a step diagram: two events the learner runs (delivery,
 * then collection) and the two statement entries the first one creates. Each step
 * carries one label, one line and one value, so the picture reads at a glance; the
 * explanation lives in the feedback underneath, not inside the steps.
 */
type TraceTone = "blue" | "cyan" | "amber" | "green";

const TRACE_TONES: Record<TraceTone, string> = {
  blue: "bg-st-blue-soft text-st-blue",
  cyan: "bg-accent-cyan/10 text-accent-cyan",
  amber: "bg-accent-amber/10 text-accent-amber",
  green: "bg-accent-green/10 text-accent-green",
};
const TRACE_OFF = "bg-white/[0.03] text-slate-500";

function CreditSaleTrace({ onComplete }: StatementSceneProps) {
  const [stage, setStage] = useState(0);
  const delivered = stage >= 1;
  const collected = stage >= 2;
  return (
    <div>
      <DefinitionStrip term="accrual accounting">
        Accrual accounting recognizes economic activity when the recognition criteria are met, even when the related cash arrives earlier or later.
      </DefinitionStrip>
      <p className="ops-body mt-5 text-[15px] text-slate-300">
        Cedar Works delivers $12m of products on December 20 and lets the customer pay in January. Run the events in order.
      </p>

      {/* Top to bottom at every width, like a printed step graphic: the lesson
          column is ~620px beside its file list, too narrow for four steps abreast. */}
      <div className="mt-5 [container-type:inline-size]" aria-live="polite">
        <ol className="flex flex-col" aria-label="One credit sale, step by step">
          <li>
            <TraceEvent done={delivered} onRun={() => setStage((current) => Math.max(current, 1))} label="Run December 20: deliver products on credit">
              <TraceStep tone="blue" lit={delivered} icon={<DeliveryIcon />} where="December 20" what="Deliver products on credit" value="$12m of products">
                {!delivered && <RunPill />}
              </TraceStep>
            </TraceEvent>
          </li>
          <TraceLink lit={delivered} kind="arrow" />
          <li>
            <TraceStep tone="cyan" lit={delivered} delay={0.1} icon={<LedgerIcon />} where="Income statement" what="Revenue is recorded" value={delivered ? "+$12m revenue" : "No event yet"} />
          </li>
          <TraceLink lit={delivered} kind="plus" tag="Same day" delay={0.1} />
          <li>
            <TraceStep tone="amber" lit={delivered} delay={0.2} icon={<ReceivableIcon />} where="Balance sheet at Dec. 31" what="The customer owes the money" value={delivered ? "+$12m receivable" : "No event yet"} />
          </li>
          <TraceLink lit={collected} kind="arrow" />
          <li>
            <TraceEvent done={collected} disabled={!delivered} onRun={() => setStage(2)} label="Run January 15: collect the customer's cash">
              <TraceStep tone="green" lit={collected} icon={<CashIcon />} where="January 15" what="Collect the customer's cash" value={collected ? "$12m receivable → cash" : "$0 in December"}>
                {!collected && <RunPill disabled={!delivered} />}
              </TraceStep>
            </TraceEvent>
          </li>
        </ol>
      </div>

      {stage === 2 && (
        <div className="mt-5">
          <StatementFeedback correct>
            The December income statement records revenue, the December 31 balance sheet carries a receivable, and January cash collection moves value from receivable to cash without creating the revenue again.
          </StatementFeedback>
          <button type="button" onClick={onComplete} className="mt-4 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">Save the trace</button>
        </div>
      )}
    </div>
  );
}

function TraceStep({
  tone,
  lit,
  icon,
  where,
  what,
  value,
  delay = 0,
  children,
}: {
  tone: TraceTone;
  lit: boolean;
  icon: ReactNode;
  where: string;
  what: string;
  value: string;
  delay?: number;
  children?: ReactNode;
}) {
  const colour = cn("transition-colors duration-300 motion-reduce:transition-none", lit ? TRACE_TONES[tone] : TRACE_OFF);
  const style = { transitionDelay: lit ? `${delay}s` : "0s" };
  return (
    <span className="flex items-start gap-3.5 [@container(min-width:30rem)]:items-center">
      <span aria-hidden style={style} className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full", colour)}>
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 [@container(min-width:30rem)]:flex-row [@container(min-width:30rem)]:items-center [@container(min-width:30rem)]:justify-between [@container(min-width:30rem)]:gap-4">
        <span className="block min-w-0">
          <span className="ops-caption block text-[12px] text-slate-500">{where}</span>
          <span className="mt-0.5 block text-[15px] font-semibold leading-5 text-white">{what}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2 [@container(min-width:30rem)]:flex-shrink-0 [@container(min-width:30rem)]:justify-end">
          <span style={style} className={cn("rounded-full px-2.5 py-0.5 text-[14px] font-semibold tabular-nums", colour)}>
            {value}
          </span>
          {children}
        </span>
      </span>
    </span>
  );
}

/*
 * An event the learner runs is a button until it has run, then plain content.
 * Leaving it as a disabled button would fade the finished step: the light theme
 * dims every `button[disabled]` to 0.55, and a utility cannot outrank that rule.
 */
function TraceEvent({
  done,
  disabled = false,
  onRun,
  label,
  children,
}: {
  done: boolean;
  disabled?: boolean;
  onRun: () => void;
  label: string;
  children: ReactNode;
}) {
  if (done) return <div>{children}</div>;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onRun}
      aria-label={label}
      className="w-full rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-st-blue"
    >
      {children}
    </button>
  );
}

function RunPill({ disabled = false }: { disabled?: boolean }) {
  return (
    <span
      className={cn(
        "flex w-max items-center rounded-full border px-3.5 py-1 text-[14px] font-semibold",
        disabled ? "border-white/10 bg-white/[0.03] text-slate-500" : "border-st-blue bg-st-blue-soft text-st-blue",
      )}
    >
      Run this event
    </span>
  );
}

function TraceLink({ lit, kind, tag, delay = 0 }: { lit: boolean; kind: "arrow" | "plus"; tag?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const paths = kind === "arrow" ? ["M3 8h20", "M18 3l5 5-5 5"] : ["M7 8h12", "M13 2v12"];
  return (
    <li aria-hidden className="flex h-6 items-center gap-3.5">
      <span className="flex w-12 justify-center">
        <svg viewBox="0 0 26 16" className={cn("h-4 w-[26px]", kind === "arrow" && "rotate-90")} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {paths.map((d) => (
            <path key={d} d={d} className="stroke-slate-300" stroke="currentColor" />
          ))}
          {paths.map((d) => (
            <motion.path
              key={`ink-${d}`}
              d={d}
              className="text-white"
              stroke="currentColor"
              initial={false}
              animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion || !lit ? 0 : delay }}
            />
          ))}
        </svg>
      </span>
      {tag && <span className="text-[12px] text-slate-500">{tag}</span>}
    </li>
  );
}

const TRACE_ICON = "h-6 w-6";

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" className={TRACE_ICON} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 7.5 12 3.2l8.5 4.3v9L12 20.8l-8.5-4.3z" />
      <path d="M3.5 7.5 12 11.8l8.5-4.3" />
      <path d="M12 11.8v9" />
      <path d="m7.7 5.3 8.6 4.4" />
    </svg>
  );
}

function LedgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className={TRACE_ICON} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <path d="M8 8h8M8 11.5h5" />
      <path d="M14.5 16.5h3.5M16.25 14.75v3.5" />
    </svg>
  );
}

function ReceivableIcon() {
  return (
    <svg viewBox="0 0 24 24" className={TRACE_ICON} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 3h9l4 4v6" />
      <path d="M14.5 3v4h4" />
      <path d="M5.5 3v18h7" />
      <path d="M8.5 9h5M8.5 12.5h4" />
      <circle cx="17" cy="17.5" r="3.6" />
      <path d="M17 15.6v2l1.3 1" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" className={TRACE_ICON} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6.5" width="19" height="11" rx="1.6" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 10v4M18 10v4" />
    </svg>
  );
}

const MATCHES = [
  { prompt: "What did Cedar Works own and owe on December 31?", answer: "balance" },
  { prompt: "How much profit did Cedar Works earn during 2026?", answer: "income" },
  { prompt: "Why did the company's cash balance rise by $5m during 2026?", answer: "cash" },
  { prompt: "How much customer receivable remained uncollected at year-end?", answer: "balance" },
];

function QuestionMatcher({ onComplete }: StatementSceneProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const match = MATCHES[index];
  const correct = selected === match.answer;

  const choose = (id: string) => {
    if (selected) return;
    setSelected(id);
    if (id === match.answer) setCorrectCount((count) => count + 1);
  };

  const advance = () => {
    if (index === MATCHES.length - 1) {
      onComplete();
      return;
    }
    setIndex((current) => current + 1);
    setSelected("");
  };

  return (
    <div>
      <div className="ops-caption text-[12px] text-slate-500">Question {index + 1} of {MATCHES.length}</div>
      <p className="ops-body-strong mt-2 text-lg text-white">{match.prompt}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {STATEMENTS.map((statement) => (
          <StatementChoice key={statement.id} onClick={() => choose(statement.id)} disabled={Boolean(selected)} selected={selected === statement.id} correct={Boolean(selected) && statement.id === match.answer} incorrect={selected === statement.id && !correct}>
            <span className="font-semibold">{statement.name}</span>
            <span className="mt-1 block text-xs text-slate-400">{statement.scope}</span>
          </StatementChoice>
        ))}
      </div>
      {selected && (
        <>
          <StatementFeedback correct={correct}>
            {correct ? "The question's wording and time frame point to the right starting statement." : `Start with the ${STATEMENTS.find((statement) => statement.id === match.answer)?.name.toLowerCase()} because of the question's time frame and subject.`}
          </StatementFeedback>
          <button type="button" onClick={advance} className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber">
            {index === MATCHES.length - 1 ? `Finish with ${correctCount + (correct ? 0 : 0)} verified matches` : "Next question"}
          </button>
        </>
      )}
    </div>
  );
}

function EvidenceMap({ onComplete }: StatementSceneProps) {
  const { statementBrief, saveStatementBrief } = useIFProgress();
  const [selected, setSelected] = useState("");
  const correct = selected === "receivable";

  const finish = () => {
    saveStatementBrief({
      ...statementBrief,
      statementMap: "Balance sheet = year-end position; income statement and cash-flow statement = period activity. A credit sale can create revenue and a receivable before cash arrives.",
    });
    onComplete();
  };

  return (
    <div>
      <StatementPanel>
        <div className="ops-caption text-[12px] text-accent-amber">Independent application</div>
        <p className="ops-body-strong mt-2 text-lg text-white">
          Cedar Works reports $30m of accounts receivable on December 31. What does that number establish?
        </p>
        <div className="mt-4 space-y-3">
          <StatementChoice onClick={() => setSelected("cash")} disabled={Boolean(selected)} correct={selected === "cash" && false} incorrect={selected === "cash"}>The company collected $30m of cash during the year.</StatementChoice>
          <StatementChoice onClick={() => setSelected("receivable")} disabled={Boolean(selected)} correct={selected === "receivable"} incorrect={false}>At year-end, customers owed the company $30m on recognized invoices.</StatementChoice>
          <StatementChoice onClick={() => setSelected("profit")} disabled={Boolean(selected)} incorrect={selected === "profit"}>The company earned exactly $30m of profit during the year.</StatementChoice>
        </div>
      </StatementPanel>
      {selected && (
        <>
          <StatementFeedback correct={correct}>
            {correct ? "Accounts receivable is a point-in-time asset. It does not state the year's cash collections or total profit." : "The line item is a balance-sheet position at a date. It is not a period cash-flow or profit total."}
          </StatementFeedback>
          <button type="button" onClick={finish} className="mt-4 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">Save evidence map</button>
        </>
      )}
    </div>
  );
}
