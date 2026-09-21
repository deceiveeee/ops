import { recoveryAfterLoss } from "@/data/marketing/teachingVisuals";

/** Original arithmetic illustration; no historical or projected investment return is implied. */
export default function LossRecoveryVisual({ compact = false }: { compact?: boolean }) {
  const { remaining, gainPercent } = recoveryAfterLoss(20);
  return (
    <figure className={`teaching-visual loss-recovery ${compact ? "teaching-visual-compact" : ""}`}>
      <figcaption>
        <span className="teaching-visual-kicker">Understand investment risk</span>
        <strong>A 20% loss takes a 25% gain to recover.</strong>
        <span className="teaching-visual-unit">An illustrative $100 investment</span>
      </figcaption>
      <div className="loss-recovery-bars" role="img" aria-label="Starting with 100 dollars, a 20 percent loss leaves 80 dollars. Gaining 25 percent of 80 dollars adds 20 dollars, returning to 100 dollars.">
        {[{ label: "Start", value: 100 }, { label: "After −20%", value: remaining }, { label: `After +${gainPercent}%`, value: 100 }].map((step, index) => <div className="loss-recovery-column" key={step.label}>
          <strong>${step.value}</strong>
          <div className="loss-recovery-track"><div data-step={index} style={{ height: `${step.value}%` }} /></div>
          <span>{step.label}</span>
        </div>)}
      </div>
      {!compact && <p className="teaching-visual-explanation">The same $20 is 20% of $100 and 25% of $80. After a loss, each percentage point of growth applies to a smaller amount.</p>}
      <p className="teaching-visual-source">Illustration · no deposits, withdrawals, fees or taxes.</p>
    </figure>
  );
}
