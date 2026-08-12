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

const SLUG = "if-4-3-recast-the-business";

const STEPS: readonly StatementInvestigationStep[] = [
  { label: "Define four zones", title: "Reorganize the company around value and claims", guide: "Damodaran's financial balance sheet asks what existing investments are worth, what future investments may add, and how debt and equity claims divide the value.", instruction: "Open all four analytical zones.", next: "Route the evidence" },
  { label: "Route the evidence", title: "Move evidence without changing its meaning", guide: "Existing resources can support assets in place; credible future projects can support growth value; contractual and residual claims stay on the financing side.", instruction: "Route every evidence card.", next: "Separate report from estimate" },
  { label: "Report vs estimate", title: "Growth value is not automatically a booked asset", guide: "The financial balance sheet is an investor's analytical model. It does not rewrite the company's accounting records.", instruction: "Resolve the reporting boundary.", next: "File the recast" },
  { label: "Financial recast", title: "Defend the investor's financial balance sheet", guide: "A strong recast states both the category and the evidence or assumption supporting it.", instruction: "Complete the independent application and save the map.", next: "Open Lesson 4.4" },
];

export default function FinancialBalanceSheetJourney() {
  return (
    <StatementInvestigationShell
      lessonSlug={SLUG}
      ariaLabel="Financial balance sheet investigation"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <FourZones onComplete={onComplete} />;
        if (step === 1) return <RouteEvidence onComplete={onComplete} />;
        if (step === 2) return <ReportingBoundary onComplete={onComplete} />;
        return <RecastDecision onComplete={onComplete} />;
      }}
      nextLesson={{ href: "/lessons/if-4-4-read-profit-and-leverage", label: "Continue to profit and leverage" }}
    />
  );
}

const ZONES = [
  { id: "place", label: "Assets in place", side: "Value side", definition: "Existing investments already producing or supporting current cash flows.", example: "Cedar Works' stores, inventory, receivables, and current operations." },
  { id: "growth", label: "Growth assets", side: "Value side", definition: "The estimated present value created by future investments the company has not yet made.", example: "A planned service network only if expected future returns exceed the required return." },
  { id: "debt", label: "Debt claims", side: "Claim side", definition: "Contractual claims with promised payments, including recognized borrowing and lease obligations when analytically treated as debt.", example: "Cedar Works' $65m debt and $30m lease liabilities." },
  { id: "equity", label: "Equity claim", side: "Claim side", definition: "The residual claim after contractual and other recognized claims are met.", example: "Shareholders receive what remains; the amount is uncertain." },
];

function FourZones({ onComplete }: StatementSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState("place");
  const zone = ZONES.find((item) => item.id === active) ?? ZONES[0];
  const open = (id: string) => { setActive(id); setOpened((current) => current.includes(id) ? current : [...current, id]); };
  return (
    <div>
      <DefinitionStrip term="financial balance sheet">An analytical valuation framework: assets in place plus growth assets equal debt plus equity. It is not a statement reported under GAAP or IFRS.</DefinitionStrip>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {ZONES.map((item) => <button key={item.id} type="button" onClick={() => open(item.id)} className={`rounded-xl border p-4 text-left transition-colors ${active === item.id ? "border-accent-amber/40 bg-accent-amber/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}><span className="ops-caption text-[12px] text-slate-500">{item.side}</span><span className="mt-1 block font-semibold text-white">{item.label}</span></button>)}
      </div>
      <StatementPanel className="mt-4"><div className="text-lg font-semibold text-white">{zone.label}</div><p className="ops-body mt-2 text-[15px] text-slate-300">{zone.definition}</p><div className="mt-4 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.06] p-4 text-sm leading-6 text-slate-200"><span className="font-semibold text-accent-cyan">Cedar Works: </span>{zone.example}</div></StatementPanel>
      <div className="mt-4 flex items-center justify-between gap-4"><span className="text-sm text-slate-400">{opened.length} of 4 zones opened</span><button type="button" disabled={opened.length < 4} onClick={onComplete} className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green disabled:opacity-40">Verify the four-zone map</button></div>
    </div>
  );
}

const ROUTES = [
  { prompt: "Stores, inventory, and the current customer base already support today's sales.", answer: "place", explanation: "These are existing investments supporting current cash flows." },
  { prompt: "A planned service network is expected to create future value but has not been built.", answer: "growth", explanation: "This is a growth-asset estimate, not a reported asset merely because management has a plan." },
  { prompt: "Bondholders and lessors hold contractual payment claims.", answer: "debt", explanation: "The financial framework groups contractual financing claims with debt." },
  { prompt: "Shareholders receive the uncertain value left after other claims.", answer: "equity", explanation: "Equity is the residual claim." },
];

function RouteEvidence({ onComplete }: StatementSceneProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const route = ROUTES[index];
  const correct = selected === route.answer;
  const advance = () => { if (index === ROUTES.length - 1) return onComplete(); setIndex((current) => current + 1); setSelected(""); };
  return (
    <div>
      <div className="ops-caption text-[12px] text-slate-500">Evidence card {index + 1} of {ROUTES.length}</div>
      <p className="ops-body-strong mt-2 text-lg text-white">{route.prompt}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{ZONES.map((zone) => <StatementChoice key={zone.id} onClick={() => setSelected(zone.id)} disabled={Boolean(selected)} correct={Boolean(selected) && zone.id === route.answer} incorrect={selected === zone.id && !correct}>{zone.label}</StatementChoice>)}</div>
      {selected && <><StatementFeedback correct={correct}>{correct ? route.explanation : `Route this evidence to ${ZONES.find((zone) => zone.id === route.answer)?.label.toLowerCase()}. ${route.explanation}`}</StatementFeedback><button type="button" onClick={advance} className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber">{index === ROUTES.length - 1 ? "Finish routing" : "Next evidence card"}</button></>}
    </div>
  );
}

function ReportingBoundary({ onComplete }: StatementSceneProps) {
  const [selected, setSelected] = useState("");
  const correct = selected === "analyst";
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatementPanel><div className="ops-caption text-[12px] text-accent-cyan">Reported accounting balance sheet</div><p className="ops-body mt-2 text-[15px] text-slate-300">Recognizes assets and claims that meet the applicable accounting rules at carrying amounts produced by those rules.</p></StatementPanel>
        <StatementPanel><div className="ops-caption text-[12px] text-accent-amber">Investor&apos;s financial balance sheet</div><p className="ops-body mt-2 text-[15px] text-slate-300">Estimates current economic value for existing operations and future investments, then assigns that value to debt and equity claims.</p></StatementPanel>
      </div>
      <p className="ops-body-strong mt-6 text-lg text-white">Management expects a proposed network to create $40m of value. What follows today?</p>
      <div className="mt-4 space-y-3"><StatementChoice onClick={() => setSelected("booked")} disabled={Boolean(selected)} incorrect={selected === "booked"}>Accounting must add a $40m growth asset immediately.</StatementChoice><StatementChoice onClick={() => setSelected("analyst")} disabled={Boolean(selected)} correct={selected === "analyst"}>An investor may estimate growth value, but must label the assumptions; the expectation alone does not create a reported asset.</StatementChoice></div>
      {selected && <><StatementFeedback correct={correct}>{correct ? "The analytical estimate belongs in the investor model, supported by expected cash flows, timing, reinvestment, and risk." : "The expectation is not automatically recognized accounting. Keep the reported statement and analyst estimate distinct."}</StatementFeedback><button type="button" onClick={onComplete} className="mt-4 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">Save the boundary</button></>}
    </div>
  );
}

function RecastDecision({ onComplete }: StatementSceneProps) {
  const { statementBrief, saveStatementBrief } = useIFProgress();
  const [selected, setSelected] = useState("");
  const correct = selected === "qualified";
  const finish = () => { saveStatementBrief({ ...statementBrief, financialRecast: "Cedar Works can be analyzed as assets in place plus evidence-based growth assets, funded by debt and residual equity claims. The financial balance sheet is an analyst model, not reported accounting." }); onComplete(); };
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4"><StatementMetric label="Assets in place" value="Current operations" tone="cyan" /><StatementMetric label="Growth assets" value="Future projects" tone="amber" /><StatementMetric label="Debt" value="Contractual claims" /><StatementMetric label="Equity" value="Residual claim" tone="green" /></div>
      <StatementPanel className="mt-5"><div className="ops-caption text-[12px] text-accent-amber">Independent application</div><p className="ops-body-strong mt-2 text-lg text-white">Which recast statement is defensible?</p><div className="mt-4 space-y-3"><StatementChoice onClick={() => setSelected("automatic")} disabled={Boolean(selected)} incorrect={selected === "automatic"}>Every management growth target becomes a growth asset at the target amount.</StatementChoice><StatementChoice onClick={() => setSelected("qualified")} disabled={Boolean(selected)} correct={selected === "qualified"}>Growth value requires a separate investor estimate of future investment, cash flow, timing, and risk; it is kept distinct from reported assets.</StatementChoice></div></StatementPanel>
      {selected && <><StatementFeedback correct={correct}>{correct ? "The recast changes the analytical lens while preserving the reporting boundary." : "Targets are evidence to investigate, not booked value or automatically credible growth value."}</StatementFeedback><button type="button" onClick={finish} className="mt-4 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green">File the financial balance sheet</button></>}
    </div>
  );
}
