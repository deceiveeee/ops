"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { STUDIO_GUIDANCE } from "@/lib/studio-guidance";
import type { StudioPlan } from "@/lib/studio";
import type { StageProps } from "../stages";
import { Choice, Field, usdWhole } from "../shared";
import StudioIcon from "./StudioIcon";
import WorkspaceNotes from "./WorkspaceNotes";
import styles from "./working-pages.module.css";

const PANELS = [
  { id: "purpose", label: "Your goal" },
  { id: "money", label: "Your money" },
  { id: "limits", label: "Your limits" },
] as const;
type PanelId = (typeof PANELS)[number]["id"];
const number = (raw: string) => Number.isFinite(Number(raw)) ? Number(raw) : 0;

export default function GoalsWorkspace({ plan, calculation, update }: StageProps) {
  const [panel, setPanel] = useState<PanelId>("purpose");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const setGoal = (patch: Partial<StudioPlan["goal"]>) => update(current => ({
    ...current, goal: { ...current.goal, ...patch }, updatedAt: new Date().toISOString(),
  }));
  const { budget, cashReserve, monthlyContribution, horizonYears, lossTolerancePct } = plan.goal;
  const available = calculation.investableBudget;
  const reserveShare = budget > 0 ? Math.max(0, Math.min(1, cashReserve / budget)) : 0;
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
            </>}
            {panel === "limits" && <>
              <Field label="Loss you could live with" hint="A drop this size should not force you to sell." type="number" min={0} max={100} suffix="%" value={lossTolerancePct} onChange={value => setGoal({ lossTolerancePct: number(value) })} />
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
            {selectedIndex < 2 ? <button type="button" onClick={() => { setPanel(PANELS[selectedIndex + 1].id); tabRefs.current[selectedIndex + 1]?.focus(); }}>Next: {PANELS[selectedIndex + 1].label.toLowerCase()} <StudioIcon name="arrow" /></button>
              : <Link href="/studio/research">Open Research <StudioIcon name="arrow" /></Link>}
          </div>
        </section>
        <section className={styles.moneyCanvas} aria-labelledby="money-canvas-heading">
          <div className={styles.canvasTop}><h2 id="money-canvas-heading">A plan with room to breathe.</h2><StudioIcon name="goals" /></div>
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
          <div className={styles.canvasFoot}>
            {panel === "limits" ? <><span>If the invested amount fell {lossTolerancePct}%</span><strong>{usdWhole(available * lossTolerancePct / 100)} loss</strong></>
              : panel === "money" ? <><span>Added over 12 months, before gains or losses</span><strong>{usdWhole(monthlyContribution * 12)}</strong></>
                : <><span>Time until you expect to use the money</span><strong>{horizonYears} {horizonYears === 1 ? "year" : "years"}</strong></>}
          </div>
        </section>
      </div>
      <WorkspaceNotes kind="goal" />
    </div>
  );
}
