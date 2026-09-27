"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { STUDIO_GUIDANCE } from "@/lib/studio-guidance";
import type { StudioPlan } from "@/lib/studio";
import {
  checkTargets, lossBudget, readLimits, setLimits, SLICE_NAMES, SLICES,
  type CashNeed, type SliceId, type SliceTarget, type StudioLimits,
} from "@/lib/studio-project/limits";
import type { StageProps } from "../stages";
import { Choice, Field, usdWhole, useBufferedInput } from "../shared";
import StudioIcon from "./StudioIcon";
import WorkspaceNotes from "./WorkspaceNotes";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./working-pages.module.css";

const PANELS = [
  { id: "purpose", label: "Your goal" },
  { id: "money", label: "Your money" },
  { id: "mix", label: "Your mix" },
  { id: "limits", label: "Your limits" },
] as const;
type PanelId = (typeof PANELS)[number]["id"];
const number = (raw: string) => Number.isFinite(Number(raw)) ? Number(raw) : 0;
/** A limit's box: empty is "not set", and a number is held to 0-100 rather than refused at save. */
const percentOrNull = (raw: string) => {
  const trimmed = raw.trim();
  if (trimmed === "" || !Number.isFinite(Number(trimmed))) return null;
  return Math.min(100, Math.max(0, Number(trimmed)));
};
const SLICE_COLOURS: Record<SliceId, string> = { ready: "#8f9985", steady: "#bfb1e5", grow: "#d5f39e" };

export default function GoalsWorkspace({ plan, calculation, update }: StageProps) {
  const { project, session, report } = useWorkspace();
  const [panel, setPanel] = useState<PanelId>("purpose");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const setGoal = (patch: Partial<StudioPlan["goal"]>) => update(current => ({
    ...current, goal: { ...current.goal, ...patch }, updatedAt: new Date().toISOString(),
  }));
  const limits = readLimits(project ?? {});
  const changeLimits = (change: (current: StudioLimits) => StudioLimits) =>
    session.update(current => setLimits(current, change)).then(report);
  const changeNeed = (id: string, patch: Partial<CashNeed>) =>
    changeLimits(current => ({ ...current, cashNeeds: current.cashNeeds.map(need => need.id === id ? { ...need, ...patch } : need) }));
  const changeSlice = (slice: SliceId, patch: Partial<SliceTarget>) =>
    changeLimits(current => ({ ...current, slices: { ...current.slices, [slice]: { ...current.slices[slice], ...patch } } }));

  const { budget, cashReserve, monthlyContribution, horizonYears, lossTolerancePct } = plan.goal;
  const available = calculation.investableBudget;
  const reserveShare = budget > 0 ? Math.max(0, Math.min(1, cashReserve / budget)) : 0;
  const billsTotal = limits.cashNeeds.reduce((sum, need) => sum + need.amount, 0);
  const selectedIndex = PANELS.findIndex(item => item.id === panel);
  return (
    <div className={styles.page}>
      <header className={styles.pageHeading}>
        <p className={styles.eyebrow}>Goals</p>
        <h1>Give the money a <em>job.</em></h1>
        <p>{STUDIO_GUIDANCE.goal.definition}</p>
      </header>
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
            {panel === "mix" && <>
              <p className={styles.fieldNote}>
                Mission 5 splits a portfolio by the job each part does; none is safe, as bonds can fall too. Give each a target
                share of the whole portfolio and a range to stay in before you review it, such as Grow at 55%, between 50% and 65%.
              </p>
              <table className={styles.sliceTable}>
                <caption className="sr-only">Target and range for each slice, as a share of the whole portfolio</caption>
                <thead><tr><th scope="col">Slice</th><th scope="col">Target</th><th scope="col">Lowest</th><th scope="col">Highest</th></tr></thead>
                <tbody>
                  {SLICES.map(slice => {
                    const { name, job } = SLICE_NAMES[slice];
                    const values = limits.slices[slice];
                    return (
                      <tr key={slice}>
                        <th scope="row"><i aria-hidden="true" style={{ background: SLICE_COLOURS[slice] }} />{name}<small>{job}</small></th>
                        <td><PercentBox label={`${name} target`} value={values.targetPct} onChange={value => changeSlice(slice, { targetPct: value })} /></td>
                        <td><PercentBox label={`${name} lowest`} value={values.minPct} onChange={value => changeSlice(slice, { minPct: value })} /></td>
                        <td><PercentBox label={`${name} highest`} value={values.maxPct} onChange={value => changeSlice(slice, { maxPct: value })} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className={styles.capFields}>
                <Field label="Cap for one company" type="number" min={0} max={100} suffix="%" value={limits.companyCapPct ?? ""}
                  onChange={value => changeLimits(current => ({ ...current, companyCapPct: percentOrNull(value) }))} />
                <Field label="Cap for one fund" type="number" min={0} max={100} suffix="%" value={limits.fundCapPct ?? ""}
                  onChange={value => changeLimits(current => ({ ...current, fundCapPct: percentOrNull(value) }))} />
              </div>
            </>}
            {panel === "limits" && <>
              <Field label="Loss you could live with" hint="A drop this size should not force you to sell." type="number" min={0} max={100} suffix="%" value={lossTolerancePct} onChange={value => setGoal({ lossTolerancePct: number(value) })} />
              <Field label="Loss you could afford" hint="How far the whole portfolio could fall before a bill goes unpaid." type="number" min={0} max={100} suffix="%"
                value={limits.lossCapacityPct ?? ""} onChange={value => changeLimits(current => ({ ...current, lossCapacityPct: percentOrNull(value) }))} />
              <Field label="Anything that limits your choices" value={plan.goal.constraints} onChange={value => setGoal({ constraints: value })}
                placeholder="Debt, emergency cash, account restrictions…" multiline />
              <Choice label="Account it sits in" value={plan.goal.accountType} onChange={value => setGoal({ accountType: value })} options={[
                { value: "taxable", label: "Ordinary taxable account" }, { value: "ira", label: "Traditional individual retirement account (IRA)" },
                { value: "roth-ira", label: "Roth individual retirement account (IRA)" }, { value: "other", label: "Something else" },
              ]} />
            </>}
          </div>
          <div className={styles.editorFooter}>
            <span>Changes save as you go.</span>
            {selectedIndex < PANELS.length - 1 ? <button type="button" onClick={() => { setPanel(PANELS[selectedIndex + 1].id); tabRefs.current[selectedIndex + 1]?.focus(); }}>Next: {PANELS[selectedIndex + 1].label.toLowerCase()} <StudioIcon name="arrow" /></button>
              : <Link href="/studio/research">Open Research <StudioIcon name="arrow" /></Link>}
          </div>
        </section>
        {/* data-panel lets a phone drop a line that repeats a box already on screen. */}
        <section className={styles.moneyCanvas} aria-labelledby="money-canvas-heading" data-panel={panel}>
          <div className={styles.canvasTop}><h2 id="money-canvas-heading">A plan with room to breathe.</h2><StudioIcon name="goals" /></div>
          {panel === "mix" ? <MixPicture limits={limits} />
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

function PercentBox({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => unknown }) {
  const buffered = useBufferedInput(value ?? "", raw => onChange(percentOrNull(raw)));
  return (
    <span className={styles.percentBox}>
      <input type="number" inputMode="decimal" min={0} max={100} aria-label={`${label}, % of the whole portfolio`} {...buffered} />
      <span aria-hidden="true">%</span>
    </span>
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

/** The three targets as one bar, with what does not add up said in words. */
function MixPicture({ limits }: { limits: StudioLimits }) {
  const { total, totalOff, problems } = checkTargets(limits);
  const set = SLICES.filter(slice => limits.slices[slice].targetPct !== null);
  const width = (slice: SliceId) => (limits.slices[slice].targetPct ?? 0) / Math.max(100, total ?? 0) * 400;
  let x = 0;
  return (
    <>
      <div className={styles.amountHeadline}>
        <span>Your targets add up to</span>
        <strong>{total === null ? "—" : `${Number(total.toFixed(2))}%`}</strong>
        <p>{total === null ? "Set a target for each slice to see the whole." : "Of the whole portfolio, cash included."}</p>
      </div>
      <svg className={styles.moneyDiagram} viewBox="0 0 400 56" preserveAspectRatio="none" role="img"
        aria-label={set.length ? SLICES.map(slice => `${SLICE_NAMES[slice].name} ${limits.slices[slice].targetPct ?? "not set"}${limits.slices[slice].targetPct === null ? "" : "%"}`).join(", ") : "No targets set yet"}>
        <rect x="0" y="0" width="400" height="46" rx="8" fill="#424a3d" />
        {SLICES.map(slice => {
          const w = width(slice);
          const rect = <rect key={slice} x={x} y="0" width={w} height="46" fill={SLICE_COLOURS[slice]} />;
          x += w;
          return rect;
        })}
      </svg>
      <dl className={styles.mixLegend}>
        {SLICES.map(slice => {
          const { minPct, targetPct, maxPct } = limits.slices[slice];
          return (
            <div key={slice}>
              <dt><i style={{ background: SLICE_COLOURS[slice] }} />{SLICE_NAMES[slice].name}</dt>
              <dd>{targetPct === null ? "Not set" : `${targetPct}%`}{minPct !== null || maxPct !== null ? <small> {minPct ?? "?"}–{maxPct ?? "?"}%</small> : null}</dd>
            </div>
          );
        })}
      </dl>
      {totalOff ? <p className={styles.canvasWarning}>They need to add up to 100%.</p> : null}
      {problems.map(problem => <p key={problem} className={styles.canvasWarning}>{problem}</p>)}
      <div className={styles.canvasFoot}>
        <span>Caps for a single holding</span>
        <strong>{limits.companyCapPct === null && limits.fundCapPct === null ? "Not set"
          : [limits.companyCapPct !== null ? `Company ${limits.companyCapPct}%` : null, limits.fundCapPct !== null ? `Fund ${limits.fundCapPct}%` : null].filter(Boolean).join(" · ")}</strong>
      </div>
    </>
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
