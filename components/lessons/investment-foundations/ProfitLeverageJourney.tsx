"use client";

import { useState } from "react";
import { useIFProgress } from "@/lib/if-progress";
import { CASE_RESULTS, INCOME_ROWS, money } from "./FinancialStatementCase";
import StatementInvestigationShell, {
  DefinitionStrip,
  StatementChoice,
  StatementFeedback,
  StatementMetric,
  StatementPanel,
  type StatementInvestigationStep,
  type StatementSceneProps,
} from "./StatementInvestigationShell";

const SLUG = "if-4-4-read-profit-and-leverage";
const STEPS: readonly StatementInvestigationStep[] = [
  { label: "Classify the expense", title: "Expense category changes the subtotal", guide: "Operating, financing, and capital expenditures enter the statements differently. The classification changes operating income, assets, and later depreciation.", instruction: "Classify all three expenditures.", next: "Run the income engine" },
  { label: "Run the income engine", title: "Trace revenue to the shareholder residual", guide: "The waterfall keeps operating performance, financing cost, and tax effects visible instead of collapsing them into one profit number.", instruction: "Reveal every line in the waterfall.", next: "Build the ratios" },
  { label: "Build the ratios", title: "Scale profit and debt to compatible denominators", guide: "A ratio is meaningful only when its numerator, denominator, tax basis, and period convention are explicit.", instruction: "Open and verify all five ratio files.", next: "Diagnose the gap" },
  { label: "Diagnose the gap", title: "Explain operating margin versus net margin", guide: "The final source concepts connect ROE to common equity and connect the margin gap to interest and taxes.", instruction: "Resolve both checks and file the profitability lens.", next: "Open Lesson 4.5" },
];

export default function ProfitLeverageJourney() {
  return <StatementInvestigationShell lessonSlug={SLUG} ariaLabel="Profit and leverage investigation" steps={STEPS} renderStep={(step, onComplete) => step === 0 ? <ExpenseClassifier onComplete={onComplete} /> : step === 1 ? <IncomeWaterfall onComplete={onComplete} /> : step === 2 ? <RatioBuilder onComplete={onComplete} /> : <MarginDiagnosis onComplete={onComplete} />} nextLesson={{ href: "/lessons/if-4-5-repair-the-investor-view", label: "Continue to analyst adjustments" }} />;
}

const EXPENSES = [
  { prompt: "Wages paid to operate this year's stores", answer: "operating", note: "They support current-period operations and enter operating expense." },
  { prompt: "Interest owed on borrowed money", answer: "financing", note: "It is a financing expense below operating income in the source waterfall." },
  { prompt: "Purchase of equipment expected to serve several years", answer: "capital", note: "It is capitalized as an asset, then allocated through depreciation rather than expensed immediately as ordinary operating cost." },
];

function ExpenseClassifier({ onComplete }: StatementSceneProps) {
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState(""); const item = EXPENSES[index]; const correct = selected === item.answer;
  const advance = () => { if (index === EXPENSES.length - 1) return onComplete(); setIndex((current) => current + 1); setSelected(""); };
  return <div><DefinitionStrip term="accrual accounting">Recognize revenue and related expenses when the economic activity is recognized, not only when cash is received or paid.</DefinitionStrip><p className="ops-body-strong mt-5 text-lg text-white">{item.prompt}</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{[["operating","Operating expense"],["financing","Financing expense"],["capital","Capital expenditure"]].map(([id,label]) => <StatementChoice key={id} onClick={() => setSelected(id)} disabled={Boolean(selected)} correct={Boolean(selected) && id === item.answer} incorrect={selected === id && !correct}>{label}</StatementChoice>)}</div>{selected && <><StatementFeedback correct={correct}>{correct ? item.note : item.note}</StatementFeedback><button type="button" onClick={advance} className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber">{index === EXPENSES.length - 1 ? "Finish classification" : "Next expenditure"}</button></>}</div>;
}

function IncomeWaterfall({ onComplete }: StatementSceneProps) {
  const [revealed, setRevealed] = useState(1);
  const next = () => setRevealed((count) => Math.min(INCOME_ROWS.length, count + 1));
  return <div><StatementPanel><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="font-semibold text-white">Cedar Works income statement</span><span className="text-xs text-slate-500">$ millions · FY 2026</span></div><div className="mt-3 space-y-2">{INCOME_ROWS.slice(0, revealed).map((row) => <div key={row.label} className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ${row.label === "Operating income" || row.label === "Net income" ? "border border-accent-amber/20 bg-accent-amber/[0.06]" : ""}`}><span className="text-slate-300">{row.label}</span><span className="tabular-nums text-white">{money(row.amount)}</span></div>)}</div></StatementPanel><div className="mt-4 flex items-center justify-between gap-4"><span className="text-sm text-slate-400">{revealed} of {INCOME_ROWS.length} lines visible</span>{revealed < INCOME_ROWS.length ? <button type="button" onClick={next} className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber">Reveal next line</button> : <button type="button" onClick={onComplete} className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">Verify the waterfall</button>}</div>{revealed === INCOME_ROWS.length && <StatementFeedback correct>Revenue of $300m becomes $60m of operating income before financing and tax, then $39m of net income for common equity.</StatementFeedback>}</div>;
}

const RATIOS = [
  { id: "op", label: "Operating margin", formula: "$60m ÷ $300m", result: "20.0%", detail: "Operating profit per dollar of revenue" },
  { id: "net", label: "Net margin", formula: "$39m ÷ $300m", result: "13.0%", detail: "Net income per dollar of revenue" },
  { id: "roe", label: "Return on equity", formula: "$39m ÷ $100m", result: "39.0%", detail: "Net income scaled to average common equity in this OPS case" },
  { id: "debt", label: "Debt to capital", formula: "$65m ÷ ($65m + $100m)", result: "39.4%", detail: "Conventional debt as a share of debt plus equity" },
  { id: "coverage", label: "Interest coverage", formula: "$60m ÷ $8m", result: "7.5x", detail: "Operating income relative to interest expense" },
];

function RatioBuilder({ onComplete }: StatementSceneProps) {
  const [opened, setOpened] = useState<string[]>([]); const [active, setActive] = useState("op"); const ratio = RATIOS.find((item) => item.id === active) ?? RATIOS[0];
  const open = (id: string) => { setActive(id); setOpened((current) => current.includes(id) ? current : [...current, id]); };
  return <div><div className="flex flex-wrap gap-2">{RATIOS.map((item) => <button key={item.id} type="button" onClick={() => open(item.id)} className={`rounded-full border px-4 py-2 text-sm ${active === item.id ? "border-accent-cyan/40 bg-accent-cyan/[0.06] text-accent-cyan" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{item.label}</button>)}</div><StatementPanel className="mt-4"><div className="ops-caption text-[12px] text-slate-500">{ratio.label}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><StatementMetric label="Construction" value={ratio.formula} detail="Named numerator and denominator" tone="cyan" /><StatementMetric label="Verified result" value={ratio.result} detail={ratio.detail} tone="green" /></div></StatementPanel><div className="mt-4 rounded-xl border border-accent-amber/20 bg-accent-amber/[0.06] p-4 text-sm leading-6 text-slate-300"><span className="font-semibold text-accent-amber">Compatibility check: </span>period income is divided by an average balance-sheet amount where possible. Negative or tiny denominators need separate interpretation.</div><div className="mt-4 flex items-center justify-between gap-4"><span className="text-sm text-slate-400">{opened.length} of {RATIOS.length} ratios verified</span><button type="button" disabled={opened.length < RATIOS.length} onClick={onComplete} className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green disabled:opacity-40">Save the ratio file</button></div></div>;
}

function MarginDiagnosis({ onComplete }: StatementSceneProps) {
  const { statementBrief, saveStatementBrief } = useIFProgress(); const [roe, setRoe] = useState(""); const [gap, setGap] = useState(""); const finish = () => { saveStatementBrief({ ...statementBrief, profitabilityFinding: "Cedar Works reports a 20.0% operating margin, 13.0% net margin, 39.0% ROE, 39.4% conventional debt-to-capital ratio, and 7.5x interest coverage. Interest and tax explain the operating-to-net margin gap in the case." }); onComplete(); };
  return <div className="space-y-5"><StatementPanel><div className="ops-caption text-[12px] text-accent-amber">Source concept 3</div><p className="ops-body-strong mt-2 text-lg text-white">Which ratio measures the return generated for common equity investors in the source framework?</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><StatementChoice onClick={() => setRoe("operating")} disabled={Boolean(roe)} incorrect={roe === "operating"}>Operating income ÷ total assets</StatementChoice><StatementChoice onClick={() => setRoe("roe")} disabled={Boolean(roe)} correct={roe === "roe"}>Net income ÷ shareholders&apos; equity</StatementChoice></div>{roe && <StatementFeedback correct={roe === "roe"}>For Cedar Works, the explicitly stated OPS case uses $39m ÷ $100m = {CASE_RESULTS.returnOnEquity.toFixed(1)}%.</StatementFeedback>}</StatementPanel>{roe && <StatementPanel><div className="ops-caption text-[12px] text-accent-amber">Source concept 4</div><p className="ops-body-strong mt-2 text-lg text-white">What most directly explains a large gap between pretax operating margin and net margin?</p><div className="mt-4 space-y-3"><StatementChoice onClick={() => setGap("debt-tax")} disabled={Boolean(gap)} correct={gap === "debt-tax"}>Substantial interest expense and a high effective tax rate</StatementChoice><StatementChoice onClick={() => setGap("inventory")} disabled={Boolean(gap)} incorrect={gap === "inventory"}>A high inventory balance by itself</StatementChoice><StatementChoice onClick={() => setGap("revenue")} disabled={Boolean(gap)} incorrect={gap === "revenue"}>Revenue growth with no change in financing or tax</StatementChoice></div>{gap && <StatementFeedback correct={gap === "debt-tax"}>Operating margin stops before interest and tax; net margin includes both.</StatementFeedback>}</StatementPanel>}{roe && gap && <button type="button" onClick={finish} className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">File the profitability lens</button>}</div>;
}
