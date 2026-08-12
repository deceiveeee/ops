"use client";

import { useState } from "react";
import { useIFProgress } from "@/lib/if-progress";
import { ASSET_ROWS, CLAIM_ROWS, CASE_RESULTS, money } from "./FinancialStatementCase";
import StatementInvestigationShell, {
  DefinitionStrip,
  StatementChoice,
  StatementFeedback,
  StatementMetric,
  StatementPanel,
  type StatementInvestigationStep,
  type StatementSceneProps,
} from "./StatementInvestigationShell";

const SLUG = "if-4-2-read-the-balance-sheet";

const STEPS: readonly StatementInvestigationStep[] = [
  { label: "Prove the equation", title: "Assets are funded by claims", guide: "A balance sheet stays in balance because creditors and shareholders have claims on the recognized assets.", instruction: "Scan both sides and reconcile the totals.", next: "Classify the lines" },
  { label: "Classify the lines", title: "Name what each line represents", guide: "Classification tells you whether a line is a resource, an operating obligation, a contractual debt claim, or the shareholder residual.", instruction: "Classify all four sampled line items.", next: "Inspect measurement" },
  { label: "Inspect measurement", title: "Reported amount is not a universal value label", guide: "Ask which measurement basis produced each number before comparing it with current economic value.", instruction: "Open every measurement note.", next: "Test the investor claim" },
  { label: "Investor claim", title: "Use book equity without mistaking it for market value", guide: "The source test is strongest when its qualifications remain visible: closest does not mean equal, and book equity can sit above or below market equity.", instruction: "Resolve both source concepts and file the X-ray.", next: "Open Lesson 4.3" },
];

export default function BalanceSheetJourney() {
  return (
    <StatementInvestigationShell
      lessonSlug={SLUG}
      ariaLabel="Balance sheet investigation"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <EquationScan onComplete={onComplete} />;
        if (step === 1) return <ClassificationLab onComplete={onComplete} />;
        if (step === 2) return <MeasurementScan onComplete={onComplete} />;
        return <InvestorClaimCheck onComplete={onComplete} />;
      }}
      nextLesson={{ href: "/lessons/if-4-3-recast-the-business", label: "Continue to the financial balance sheet" }}
    />
  );
}

function EquationScan({ onComplete }: StatementSceneProps) {
  const [scanned, setScanned] = useState(false);
  return (
    <div>
      <DefinitionStrip term="accounting equation">
        Recognized assets equal recognized liabilities plus shareholders&apos; equity. Equity is the residual accounting claim after liabilities.
      </DefinitionStrip>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <StatementPanel>
          <div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="font-semibold text-white">Assets</span><span className="text-sm text-accent-cyan">Resources controlled</span></div>
          <div className="mt-3 space-y-2">
            {ASSET_ROWS.map((row) => <StatementRow key={row.label} label={row.label} amount={row.amount} />)}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 font-semibold text-white"><span>Total assets</span><span className="tabular-nums">$250m</span></div>
        </StatementPanel>
        <StatementPanel>
          <div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="font-semibold text-white">Liabilities + equity</span><span className="text-sm text-accent-amber">Claims on resources</span></div>
          <div className="mt-3 space-y-2">
            {CLAIM_ROWS.map((row) => <StatementRow key={row.label} label={row.label} amount={row.amount} />)}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 font-semibold text-white"><span>Total claims</span><span className="tabular-nums">$250m</span></div>
        </StatementPanel>
      </div>
      <button type="button" onClick={() => setScanned(true)} className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber">Run equality scan</button>
      {scanned && (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatementMetric label="Assets" value="$250m" tone="cyan" />
            <StatementMetric label="Liabilities + equity" value="$150m + $100m" tone="amber" />
            <StatementMetric label="Difference" value="$0m" detail="The reported statement reconciles" tone="green" />
          </div>
          <button type="button" onClick={onComplete} className="mt-4 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">Verify the equation</button>
        </div>
      )}
    </div>
  );
}

function StatementRow({ label, amount }: { label: string; amount: number }) {
  return <div className="flex items-start justify-between gap-4 text-sm"><span className="text-slate-300">{label}</span><span className="tabular-nums text-white">{money(amount)}</span></div>;
}

const CLASSIFY = [
  { item: "Accounts receivable", answer: "asset", note: "A customer claim the company controls." },
  { item: "Accounts payable", answer: "operating", note: "An unpaid supplier obligation." },
  { item: "Debt", answer: "debt", note: "Borrowed capital with a contractual claim." },
  { item: "Shareholders' equity", answer: "residual", note: "The accounting residual after liabilities." },
];

function ClassificationLab({ onComplete }: StatementSceneProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const item = CLASSIFY[index];
  const correct = selected === item.answer;
  const choices = [
    ["asset", "Recognized asset"], ["operating", "Operating liability"], ["debt", "Debt claim"], ["residual", "Residual equity claim"],
  ];
  const advance = () => {
    if (index === CLASSIFY.length - 1) return onComplete();
    setIndex((current) => current + 1);
    setSelected("");
  };
  return (
    <div>
      <div className="ops-caption text-[12px] text-slate-500">Line {index + 1} of {CLASSIFY.length}</div>
      <p className="ops-body-strong mt-2 text-2xl text-white">{item.item}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {choices.map(([id, label]) => <StatementChoice key={id} onClick={() => setSelected(id)} disabled={Boolean(selected)} correct={Boolean(selected) && id === item.answer} incorrect={selected === id && !correct}>{label}</StatementChoice>)}
      </div>
      {selected && <><StatementFeedback correct={correct}>{correct ? item.note : `This line belongs with: ${choices.find(([id]) => id === item.answer)?.[1]}. ${item.note}`}</StatementFeedback><button type="button" onClick={advance} className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber">{index === CLASSIFY.length - 1 ? "Finish classification" : "Next line"}</button></>}
    </div>
  );
}

const MEASUREMENT_NOTES = [
  { id: "cash", label: "Cash", basis: "Nominal amount", finding: "Cash is usually close to its stated amount, subject to currency and restriction details." },
  { id: "receivable", label: "Receivable + inventory", basis: "Collectible / recoverable carrying amounts", finding: "These current assets may be closer to current realizable amounts than old land or equipment, but estimates and accounting rules still matter." },
  { id: "ppe", label: "Property and equipment", basis: "Historical cost less depreciation and impairment", finding: "The carrying amount is not an appraisal of today's sale price." },
  { id: "goodwill", label: "Goodwill", basis: "Acquisition accounting residual", finding: "It arises from an acquisition allocation and is not a direct measure of internally generated reputation or growth." },
];

function MeasurementScan({ onComplete }: StatementSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState(MEASUREMENT_NOTES[0].id);
  const note = MEASUREMENT_NOTES.find((item) => item.id === active) ?? MEASUREMENT_NOTES[0];
  const open = (id: string) => { setActive(id); setOpened((current) => current.includes(id) ? current : [...current, id]); };
  return (
    <div>
      <DefinitionStrip term="measurement basis">The rule or valuation method used to produce a reported carrying amount. A line-item label alone does not reveal current economic value.</DefinitionStrip>
      <div className="mt-5 flex flex-wrap gap-2">
        {MEASUREMENT_NOTES.map((item) => <button key={item.id} type="button" onClick={() => open(item.id)} className={`rounded-full border px-4 py-2 text-sm ${active === item.id ? "border-accent-cyan/40 bg-accent-cyan/[0.06] text-accent-cyan" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{item.label}</button>)}
      </div>
      <StatementPanel className="mt-4">
        <div className="ops-caption text-[12px] text-accent-cyan">Reported basis</div>
        <div className="mt-1 text-lg font-semibold text-white">{note.basis}</div>
        <p className="ops-body mt-3 text-[15px] text-slate-300">{note.finding}</p>
      </StatementPanel>
      <div className="mt-4 flex items-center justify-between gap-4"><span className="text-sm text-slate-400">{opened.length} of {MEASUREMENT_NOTES.length} notes opened</span><button type="button" disabled={opened.length < MEASUREMENT_NOTES.length} onClick={onComplete} className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green disabled:opacity-40">Save measurement notes</button></div>
    </div>
  );
}

function InvestorClaimCheck({ onComplete }: StatementSceneProps) {
  const { statementBrief, saveStatementBrief } = useIFProgress();
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const firstCorrect = first === "current";
  const secondCorrect = second === "none";
  const finish = () => {
    saveStatementBrief({ ...statementBrief, balanceSheetFinding: "Cedar Works reports $250m of assets funded by $150m of liabilities and $100m of book equity. Carrying amounts use mixed measurement bases; book equity is not automatically market or liquidation value." });
    onComplete();
  };
  return (
    <div className="space-y-5">
      <StatementPanel>
        <div className="ops-caption text-[12px] text-accent-amber">Source concept 1</div>
        <p className="ops-body-strong mt-2 text-lg text-white">Which group is most likely to be closer to current value among the source choices?</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><StatementChoice onClick={() => setFirst("land")} disabled={Boolean(first)} incorrect={first === "land"}>Old land and buildings at carrying amount</StatementChoice><StatementChoice onClick={() => setFirst("current")} disabled={Boolean(first)} correct={first === "current"}>Accounts receivable and inventory</StatementChoice></div>
        {first && <StatementFeedback correct={firstCorrect}>{firstCorrect ? "Best among the choices, with collectability, cost-flow, and impairment qualifications still required." : "Older long-lived assets commonly retain historical-cost-based carrying amounts. The current operating assets are the better source answer."}</StatementFeedback>}
      </StatementPanel>
      {first && <StatementPanel>
        <div className="ops-caption text-[12px] text-accent-amber">Source concept 2</div>
        <p className="ops-body-strong mt-2 text-lg text-white">Which statement is always true about book shareholders&apos; equity?</p>
        <div className="mt-4 space-y-3"><StatementChoice onClick={() => setSecond("positive")} disabled={Boolean(second)} incorrect={second === "positive"}>It must be positive and below market equity.</StatementChoice><StatementChoice onClick={() => setSecond("liquidation")} disabled={Boolean(second)} incorrect={second === "liquidation"}>It is a reliable liquidation value.</StatementChoice><StatementChoice onClick={() => setSecond("none")} disabled={Boolean(second)} correct={second === "none"}>Neither statement is always true.</StatementChoice></div>
        {second && <StatementFeedback correct={secondCorrect}>{secondCorrect ? "Book equity can be negative, above or below market equity, and different from liquidation value." : "Book equity is a reporting residual, not a guaranteed sign, market price, or liquidation estimate."}</StatementFeedback>}
      </StatementPanel>}
      {first && second && <button type="button" onClick={finish} className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">File the balance-sheet X-ray</button>}
    </div>
  );
}
