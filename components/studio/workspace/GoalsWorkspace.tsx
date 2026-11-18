"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { STUDIO_GUIDANCE } from "@/lib/studio-guidance";
import type { StudioPlan } from "@/lib/studio";
import { lossBudget, readLimits, setLimits, type CashNeed, type StudioLimits } from "@/lib/studio-project/limits";
import { neededReturn, readConstruction, type NeededReturn } from "@/lib/studio-project/construction";
import { chosenBeforeChange, type BasisPart } from "@/lib/studio-project/portfolio-weights";
import { readScenarios } from "@/lib/studio-project/scenarios";
import type { StageProps } from "../stages";
import { Choice, Field, usdWhole } from "../shared";
import StudioIcon from "./StudioIcon";
import WorkspaceNotes from "./WorkspaceNotes";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./working-pages.module.css";

/** Steps 1 and 2 of the nine: the rules come first, then the return they need. */
const PANELS = [
  { id: "purpose", label: "Your goal", step: 1 },
  { id: "money", label: "Your money", step: 1 },
  { id: "limits", label: "Your limits", step: 1 },
  { id: "rules", label: "Checking", step: 1 },
  { id: "needed", label: "Return needed", step: 2 },
] as const;
const STEP_TITLES = { 1: "Step 1 of 9: write the rules first", 2: "Step 2 of 9: the return your goal needs" } as const;
type PanelId = (typeof PANELS)[number]["id"];
const number = (raw: string) => Number.isFinite(Number(raw)) ? Number(raw) : 0;
/** A limit's box: empty is "not set", and a number is held to 0-100 rather than refused at save. */
const percentOrNull = (raw: string) => {
  const trimmed = raw.trim();
  if (trimmed === "" || !Number.isFinite(Number(trimmed))) return null;
  return Math.min(100, Math.max(0, Number(trimmed)));
};
// Spelled out here: a browser's own short month is "Sep" in one and "Sept" in another.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const chosenOn = (at: string) => { const date = new Date(at); return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`; };
const PART_WORDS: Record<BasisPart, string> = { goal: "your goal", limits: "your limits", scenario: "the loss scenario" };
/** "your limits have", "your goal and the loss scenario have", "your goal has"; "your loss scenarios have" once there are several. */
const changedWords = (parts: BasisPart[], severalScenarios: boolean) => {
  const words = parts.map(part => part === "scenario" && severalScenarios ? "your loss scenarios" : PART_WORDS[part]);
  const listed = words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}` : words[0];
  const plural = parts.length > 1 || parts[0] === "limits" || (parts[0] === "scenario" && severalScenarios);
  return `${listed} ${plural ? "have" : "has"}`;
};

export default function GoalsWorkspace({ plan, calculation, update }: StageProps) {
  const { project, updateProject } = useWorkspace();
  const [panel, setPanel] = useState<PanelId>("purpose");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const setGoal = (patch: Partial<StudioPlan["goal"]>) => update(current => ({
    ...current, goal: { ...current.goal, ...patch }, updatedAt: new Date().toISOString(),
  }));
  const limits = readLimits(project ?? {});
  const changeLimits = (change: (current: StudioLimits) => StudioLimits) => updateProject(current => setLimits(current, change));
  const setRules = (patch: Partial<StudioPlan["rules"]>) => update(current => ({ ...current, rules: { ...current.rules, ...patch }, updatedAt: new Date().toISOString() }));
  const construction = readConstruction(project ?? {});
  const setTarget = (targetAmount: number | null) =>
    updateProject(current => ({ ...current, updatedAt: new Date().toISOString(), construction: { ...readConstruction(current), targetAmount } }));
  const needed = neededReturn({ start: plan.goal.budget, monthly: plan.goal.monthlyContribution, years: plan.goal.horizonYears, target: construction.targetAmount });
  const changeNeed = (id: string, patch: Partial<CashNeed>) =>
    changeLimits(current => ({ ...current, cashNeeds: current.cashNeeds.map(need => need.id === id ? { ...need, ...patch } : need) }));

  const { budget, cashReserve, monthlyContribution, horizonYears, lossTolerancePct } = plan.goal;
  const available = calculation.investableBudget;
  const reserveShare = budget > 0 ? Math.max(0, Math.min(1, cashReserve / budget)) : 0;
  const billsTotal = limits.cashNeeds.reduce((sum, need) => sum + need.amount, 0);
  const selectedIndex = PANELS.findIndex(item => item.id === panel);
  const chosen = project ? chosenBeforeChange(project) : null;
  return (
    <div className={styles.page}>
      <header className={styles.pageHeading}>
        <p className={styles.eyebrow}>Goals · {STEP_TITLES[PANELS[selectedIndex].step]}</p>
        <h1>Give the money a <em>job.</em></h1>
        <p>{STUDIO_GUIDANCE.goal.definition}</p>
      </header>
      {/*
        * Here, where a goal or limit is changed, the allocation chosen under the
        * old one is named. Always in the page and filled when needed, because a
        * status that appears already holding its words is not reliably read out.
        */}
      <div role="status" className={chosen ? styles.chosenNotice : undefined}>
        {chosen ? <>
          <span>You chose <strong>{chosen.name}</strong> on {chosenOn(chosen.chosenAt)}, and {changedWords(chosen.changed, readScenarios(project!).length > 1)} changed since.</span>{" "}
          <Link href="/studio/portfolio/weights">Check it still fits →</Link>
        </> : null}
      </div>
      <div className={styles.goalLayout}>
        <section className={styles.goalEditor} aria-label="Edit your goal">
          <div role="tablist" aria-label="Goal details" className={styles.panelTabs}>
            {PANELS.map((item, index) => (
              <button key={item.id} ref={element => { tabRefs.current[index] = element; }}
                id={`goal-tab-${item.id}`} type="button" role="tab" aria-selected={panel === item.id}
                aria-controls={`goal-panel-${item.id}`} tabIndex={panel === item.id ? 0 : -1}
                onClick={() => setPanel(item.id)} onKeyDown={event => {
                  const next = event.key === "ArrowRight" ? (index + 1) % PANELS.length
                    : event.key === "ArrowLeft" ? (index + PANELS.length - 1) % PANELS.length
                      : event.key === "Home" ? 0 : event.key === "End" ? PANELS.length - 1 : null;
                  if (next === null) return;
                  event.preventDefault(); setPanel(PANELS[next].id); tabRefs.current[next]?.focus();
                }}><span aria-hidden="true">0{index + 1}</span>{item.label}</button>
            ))}
          </div>
          <div role="tabpanel" id={`goal-panel-${panel}`} aria-labelledby={`goal-tab-${panel}`} className={styles.goalFields}>
            {panel === "purpose" && <>
              <Field label="What is this money for?" value={plan.goal.purpose} onChange={value => setGoal({ purpose: value })}
                placeholder="A house deposit or a year of tuition…" multiline />
              <Field label="When do you expect to use it?" hint="Years from now." type="number" min={0} max={100}
                value={horizonYears} onChange={value => setGoal({ horizonYears: number(value) })} suffix="years" />
              <p className={styles.fieldNote}>The date separates money you can leave invested from money you will need sooner.</p>
            </>}
            {panel === "money" && <>
              <Field label="Money available now" type="number" min={0} prefix="$" value={budget} onChange={value => setGoal({ budget: number(value) })} />
              <Field label="Keep aside as cash" hint="Money you may need soon." type="number" min={0} prefix="$" value={cashReserve} onChange={value => setGoal({ cashReserve: number(value) })} />
              <Field label="Adding each month" type="number" min={0} prefix="$" value={monthlyContribution} onChange={value => setGoal({ monthlyContribution: number(value) })} />
              <Bills needs={limits.cashNeeds} onChange={changeNeed}
                onAdd={() => changeLimits(current => ({ ...current, cashNeeds: [...current.cashNeeds, { id: `need-${crypto.randomUUID()}`, label: "", amount: 0, dueDate: "" }] }))}
                onRemove={id => changeLimits(current => ({ ...current, cashNeeds: current.cashNeeds.filter(need => need.id !== id) }))} />
            </>}
            {panel === "limits" && <>
              <Field label="Loss you could live with" hint="A drop this size should not force you to sell." type="number" min={0} max={100} suffix="%" value={lossTolerancePct} onChange={value => setGoal({ lossTolerancePct: number(value) })} />
              <Field label="Loss you could afford" hint="How far the whole portfolio could fall before a bill goes unpaid." type="number" min={0} max={100} suffix="%"
                value={limits.lossCapacityPct ?? ""} onChange={value => changeLimits(current => ({ ...current, lossCapacityPct: percentOrNull(value) }))} />
              <div className={styles.capFields}>
                <Field label="Cap for one company" type="number" min={0} max={100} suffix="%" value={limits.companyCapPct ?? ""}
                  onChange={value => changeLimits(current => ({ ...current, companyCapPct: percentOrNull(value) }))} />
                <Field label="Cap for one fund" type="number" min={0} max={100} suffix="%" value={limits.fundCapPct ?? ""}
                  onChange={value => changeLimits(current => ({ ...current, fundCapPct: percentOrNull(value) }))} />
              </div>
              <Field label="Anything that limits your choices" value={plan.goal.constraints} onChange={value => setGoal({ constraints: value })}
                placeholder="Debt, emergency cash, account restrictions…" multiline />
              <Choice label="Account it sits in" value={plan.goal.accountType} onChange={value => setGoal({ accountType: value })} options={[
                { value: "taxable", label: "Ordinary taxable account" }, { value: "ira", label: "Traditional individual retirement account (IRA)" },
                { value: "roth-ira", label: "Roth individual retirement account (IRA)" }, { value: "other", label: "Something else" },
              ]} />
            </>}
            {panel === "rules" && <>
              <p className={styles.fieldNote}>
                Decide now how you will look after the portfolio, before a fall or a rally can decide it for you. Checking means
                comparing what you hold with your targets; drift is how far a holding has moved from its target.
              </p>
              <Choice label="How often you will check" value={plan.rules.reviewFrequency} onChange={value => setRules({ reviewFrequency: value })} options={[
                { value: "monthly", label: "Every month" }, { value: "quarterly", label: "Every three months" }, { value: "yearly", label: "Once a year" },
              ]} />
              <Field label="Act when a holding drifts this far from target" hint="In percentage points of the whole portfolio." type="number" min={0} max={100} suffix="points"
                value={plan.rules.driftThresholdPct} onChange={value => setRules({ driftThresholdPct: Math.min(100, Math.max(0, number(value))) })} />
            </>}
            {panel === "needed" && <>
              <p className={styles.fieldNote}>
                A return above inflation is growth beyond the rise in prices: 5% growth while prices rise 2% leaves about 2.9% more
                buying power. Enter the amount in today&apos;s dollars, what it would buy now; Studio takes what you add each month to rise with prices too.
              </p>
              <Field label="Amount you want by then" hint="In today's dollars. Leave it empty to build wealth without a target." type="number" min={0} prefix="$"
                value={construction.targetAmount ?? ""} onChange={value => setTarget(value.trim() === "" || !Number.isFinite(Number(value)) ? null : Math.min(1e12, Math.max(0, Number(value))))} />
            </>}
          </div>
          <div className={styles.editorFooter}>
            <span>Changes save as you go.</span>
            {selectedIndex < PANELS.length - 1 ? <button type="button" onClick={() => { setPanel(PANELS[selectedIndex + 1].id); tabRefs.current[selectedIndex + 1]?.focus(); }}>Next: {PANELS[selectedIndex + 1].label.toLowerCase()} <StudioIcon name="arrow" /></button>
              : <Link href="/studio/portfolio">Step 3: your mix <StudioIcon name="arrow" /></Link>}
          </div>
        </section>
        {/* data-panel lets a phone drop a line that repeats a box already on screen. */}
        <section className={styles.moneyCanvas} aria-labelledby="money-canvas-heading" data-panel={panel}>
          <div className={styles.canvasTop}><h2 id="money-canvas-heading">A plan with room to breathe.</h2><StudioIcon name="goals" /></div>
          {panel === "needed" ? <NeededPicture needed={needed} target={construction.targetAmount} start={budget} monthly={monthlyContribution} years={horizonYears} />
            : panel === "rules" ? <RulesPicture frequency={plan.rules.reviewFrequency} band={plan.rules.driftThresholdPct} />
            : panel === "limits" ? <LossPicture budget={budget} willingnessPct={lossTolerancePct} capacityPct={limits.lossCapacityPct} />
              : <>
                <div className={styles.amountHeadline}><span>After setting cash aside</span><strong>{usdWhole(available)}</strong><p>Available to plan your investments</p></div>
                <svg className={styles.moneyDiagram} viewBox="0 0 400 56" preserveAspectRatio="none" aria-hidden="true">
                  <defs><pattern id="cash-reserve-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8 8 0" stroke="#818878" strokeWidth="2" /></pattern></defs>
                  <rect x="0" y="0" width="400" height="46" rx="8" fill="#424a3d" />
                  <rect x="0" y="0" width={400 * (1 - reserveShare)} height="46" rx="8" fill={budget > 0 ? "#d5f39e" : "#424a3d"} />
                  <rect x={400 * (1 - reserveShare)} y="0" width={400 * reserveShare} height="46" fill="url(#cash-reserve-hatch)" />
                </svg>
                <dl className={styles.moneyLegend}><div><dt><i />For investments</dt><dd>{usdWhole(available)}</dd></div><div><dt><i />Cash set aside</dt><dd>{usdWhole(cashReserve)}</dd></div></dl>
                {cashReserve > budget ? <p className={styles.canvasWarning} role="status">More cash set aside than you have. Lower the reserve or raise the amount available.</p>
                  : <p className={styles.canvasExplanation}>{usdWhole(budget)} available − {usdWhole(cashReserve)} set aside = {usdWhole(available)} for investments.</p>}
                {/* Cash in the portfolio, reserve and anything unassigned: the same measure Portfolio checks. */}
                {panel === "money" && billsTotal > 0 ? (
                  <p className={calculation.targetCash >= billsTotal ? styles.canvasExplanation : styles.canvasWarning}>
                    Your bills total {usdWhole(billsTotal)}. The portfolio holds {usdWhole(calculation.targetCash)} as cash
                    {calculation.targetCash >= billsTotal ? ", which covers them." : `, ${usdWhole(billsTotal - calculation.targetCash)} short.`}
                  </p>
                ) : null}
                <div className={styles.canvasFoot}>
                  {panel === "money" ? <><span>Added over 12 months, before gains or losses</span><strong>{usdWhole(monthlyContribution * 12)}</strong></>
                    : <><span>Time until you expect to use the money</span><strong>{horizonYears} {horizonYears === 1 ? "year" : "years"}</strong></>}
                </div>
              </>}
        </section>
      </div>
      <WorkspaceNotes kind="goal" />
    </div>
  );
}

/** Bills with dates. Each is its own group, so a screen reader hears which bill a box belongs to. */
function Bills({ needs, onChange, onAdd, onRemove }: {
  needs: CashNeed[];
  onChange: (id: string, patch: Partial<CashNeed>) => unknown;
  onAdd: () => unknown;
  onRemove: (id: string) => unknown;
}) {
  return (
    <div className={styles.bills} role="group" aria-labelledby="bills-heading">
      <p className={styles.fieldNote}>
        <strong id="bills-heading">Bills you know are coming.</strong> Cash kept for a dated bill means a fall never forces a sale to pay it.
      </p>
      {needs.map((need, index) => (
        <fieldset key={need.id} className={styles.billRow}>
          <legend className="sr-only">Bill {index + 1}{need.label ? `: ${need.label}` : ""}</legend>
          <Field label="What for" value={need.label} placeholder="Tuition, a deposit…" onChange={value => onChange(need.id, { label: value })} />
          <Field label="Amount" type="number" min={0} prefix="$" value={need.amount}
            onChange={value => onChange(need.id, { amount: Math.min(1e12, Math.max(0, number(value))) })} />
          <Field label="Due" type="date" value={need.dueDate} onChange={value => onChange(need.id, { dueDate: value })} />
          <button type="button" className={styles.billRemove} onClick={() => onRemove(need.id)}>
            Remove<span className="sr-only"> bill {index + 1}</span>
          </button>
        </fieldset>
      ))}
      <button type="button" className={styles.billAdd} onClick={() => onAdd()}>+ Add a bill</button>
    </div>
  );
}

/** The loss budget: the smaller of the two limits, in dollars of the whole portfolio. */
function LossPicture({ budget, willingnessPct, capacityPct }: { budget: number; willingnessPct: number; capacityPct: number | null }) {
  const loss = lossBudget(willingnessPct, capacityPct);
  return (
    <>
      <div className={styles.amountHeadline}>
        {/* Which limit set it is in the line a phone keeps; the comparison is the longer note. */}
        <span>Your loss budget: the loss you could {loss.from === "capacity" ? "afford" : "live with"}</span>
        <strong>{loss.pct}%</strong>
        <p>{loss.from === "capacity" ? "It is smaller than the loss you could live with." : capacityPct === null ? "Add the loss you could afford to check both." : "It is no more than the loss you could afford."}</p>
      </div>
      <div className={styles.canvasFoot}>
        <span>If the whole portfolio fell {loss.pct}%</span>
        <strong>{usdWhole(budget * loss.pct / 100)} loss</strong>
      </div>
    </>
  );
}

const FREQUENCY_WORDS = { monthly: "Every month", quarterly: "Every three months", yearly: "Once a year" } as const;

/** The review rules, said back as one sentence the learner can keep. */
function RulesPicture({ frequency, band }: { frequency: StudioPlan["rules"]["reviewFrequency"]; band: number }) {
  return (
    <>
      <div className={styles.amountHeadline}>
        <span>You will check</span>
        <strong>{FREQUENCY_WORDS[frequency]}</strong>
        <p>and act when a holding drifts {band} percentage points from its target.</p>
      </div>
      <p className={styles.canvasExplanation}>
        You act when a holding drifts {band} points from its target. A target of 20% that grows to 26% has drifted 6 points,
        which {6 >= band ? "calls for" : "does not yet call for"} action.
      </p>
      <div className={styles.canvasFoot}><span>Where you act on it</span><strong>Step 9, Review</strong></div>
    </>
  );
}

/** Step 2: the yearly return above inflation that the goal needs. */
function NeededPicture({ needed, target, start, monthly, years }: { needed: NeededReturn; target: number | null; start: number; monthly: number; years: number }) {
  const figure = needed.status === "ok" ? `${Number(needed.annualPct.toFixed(1))}% a year` : needed.status === "reached" ? "0%" : needed.status === "too-high" ? "Over 100%" : "—";
  const line = needed.status === "unset" ? "Enter the amount you want to see it."
    : needed.status === "no-time" ? "Set when you expect to use the money first."
      : needed.status === "no-money" ? "Enter money available now or an amount added each month first."
        : needed.status === "too-high" ? "Investing cannot be planned to do this. Change the amount, the date or what you add."
          : needed.status === "reached" ? "Saving alone gets there, before any growth."
            : "above inflation";
  return (
    <>
      <div className={styles.amountHeadline}>
        <span>The return your goal needs</span>
        <strong>{figure}</strong>
        <p>{line}</p>
      </div>
      {needed.status === "ok" || needed.status === "reached" || needed.status === "too-high" ? (
        <p className={styles.canvasExplanation}>
          {usdWhole(start)} now + {usdWhole(monthly)} a month for {years} {years === 1 ? "year" : "years"} is {usdWhole(needed.withoutGrowth)} before any growth.
          {" "}{needed.status === "ok"
            ? `Reaching ${usdWhole(target ?? 0)} needs about ${needed.annualPct.toFixed(2)}% a year more than prices rise.`
            : `You want ${usdWhole(target ?? 0)}.`}
        </p>
      ) : null}
      <div className={styles.canvasFoot}><span>Where you test it</span><strong>Step 3, your mix</strong></div>
    </>
  );
}
