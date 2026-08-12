"use client";

import { useState } from "react";
import { useIFProgress } from "@/lib/if-progress";
import StatementInvestigationShell, {
  DefinitionStrip,
  StatementChoice,
  StatementFeedback,
  StatementMetric,
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

function CreditSaleTrace({ onComplete }: StatementSceneProps) {
  const [stage, setStage] = useState(0);
  return (
    <div>
      <DefinitionStrip term="accrual accounting">
        Accrual accounting recognizes economic activity when the recognition criteria are met, even when the related cash arrives earlier or later.
      </DefinitionStrip>
      <p className="ops-body mt-5 text-[15px] text-slate-300">
        Cedar Works delivers $12m of products on December 20 and lets the customer pay in January. Run the events in order.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => setStage(Math.max(stage, 1))} className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-4 text-left">
          <span className="ops-caption text-[12px] text-accent-amber">December 20</span>
          <span className="mt-1 block text-sm font-semibold text-white">1. Deliver products on credit</span>
        </button>
        <button type="button" disabled={stage < 1} onClick={() => setStage(2)} className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-4 text-left disabled:cursor-not-allowed disabled:opacity-40">
          <span className="ops-caption text-[12px] text-accent-cyan">January 15</span>
          <span className="mt-1 block text-sm font-semibold text-white">2. Collect the customer&apos;s cash</span>
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-live="polite">
        <StatementMetric label="Income statement" value={stage >= 1 ? "+$12m revenue" : "No event yet"} detail="Recognized when the sale is earned" tone="cyan" />
        <StatementMetric label="Balance sheet at Dec. 31" value={stage >= 1 ? "+$12m receivable" : "No event yet"} detail="A customer claim replaces immediate cash" tone="amber" />
        <StatementMetric label="Cash collection" value={stage >= 2 ? "+$12m cash" : "$0 in December"} detail={stage >= 2 ? "Receivable falls by the same amount" : "Revenue does not guarantee current-period cash"} tone="green" />
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
