import Link from "next/link";

/**
 * Premium course product card.
 *
 * Each course card is a distinct product surface — not a small bordered
 * dashboard panel. Composition:
 *
 *   ┌────────────────────────────────────┐
 *   │  [ Course-specific visual  280px ] │  ← bespoke SVG, course-colored
 *   │                                    │
 *   │  Course Title              34–44px │
 *   │  Short value proposition           │
 *   │                                    │
 *   │  ─ What you'll learn (3 points)    │
 *   │                                    │
 *   │  [Stats: hours / modules / lessons]│
 *   │                                    │
 *   │  [ Primary CTA ]                   │
 *   └────────────────────────────────────┘
 *
 * Variants: `cyan` for Finance Foundations, `amber` for Investment
 * Foundations. The variant controls the visual identity and accent.
 */

export type CourseCardProps = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  outcomes: string[];
  hours: number;
  modules: number;
  lessons: number;
  variant: "cyan" | "amber";
  recommended?: boolean;
  ctaLabel?: string;
};

const variantBg: Record<string, string> = {
  cyan: "bg-[#0a0e18]",
  amber: "bg-[#13100a]",
};
const variantBorder: Record<string, string> = {
  cyan: "border-white/5",
  amber: "border-white/5",
};
const variantAccentText: Record<string, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
};
const variantRecommend: Record<string, string> = {
  cyan: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  amber: "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
};

export default function CourseCard({
  slug,
  title,
  subtitle,
  shortDescription,
  outcomes,
  hours,
  modules,
  lessons,
  variant,
  recommended,
  ctaLabel = "Explore course",
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border ${variantBorder[variant]} ${variantBg[variant]} transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50`}
      style={{ minHeight: "560px" }}
    >
      {/* Course-specific visual — top of card, substantial */}
      <div className="relative h-[260px] w-full overflow-hidden sm:h-[280px]">
        <CourseVisual variant={variant} />
        {recommended && (
          <div
            className={`absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium ${variantRecommend[variant]}`}
          >
            Start here
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-8 sm:p-10">
        <h2 className="course-card-title">{title}</h2>
        <p className={`mt-2 text-[16px] font-medium ${variantAccentText[variant]}`}>
          {subtitle}
        </p>
        <p className="course-lead mt-5 max-w-[440px]">{shortDescription}</p>

        {/* Outcomes */}
        <div className="mt-8">
          <div className="text-[14px] font-medium uppercase tracking-[0.04em] text-slate-500">
            What you’ll learn
          </div>
          <ul className="mt-3 space-y-2">
            {outcomes.map((o) => (
              <li
                key={o}
                className="flex items-start gap-2.5 text-[16px] text-slate-200"
              >
                <span
                  className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    variant === "cyan" ? "bg-accent-cyan" : "bg-accent-amber"
                  }`}
                  aria-hidden
                />
                {o}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="mt-8 flex items-baseline gap-8 border-t border-white/10 pt-6">
          <Stat label="Hours" value={String(hours)} />
          <Stat label="Modules" value={String(modules)} />
          <Stat label="Lessons" value={String(lessons)} />
        </div>

        {/* CTA — clear, visible, not bottom-corner-hidden */}
        <div className="mt-8 flex items-center gap-2 text-[17px] font-medium text-white">
          <span>{ctaLabel}</span>
          <span
            aria-hidden
            className={`transition-transform duration-200 group-hover:translate-x-1 ${variantAccentText[variant]}`}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="stat-numeric text-[28px]">{value}</div>
      <div className="mt-1 text-[14px] text-slate-500">{label}</div>
    </div>
  );
}

/** Bespoke SVG visual per course. No photographs, no decorative dots. */
function CourseVisual({ variant }: { variant: "cyan" | "amber" }) {
  if (variant === "cyan") return <FinanceVisual />;
  return <InvestmentVisual />;
}

/** Finance Foundations — a layered price chart dissolving into cash-flow bars. */
function FinanceVisual() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 30% 30%, rgba(34,211,238,0.18), transparent 60%), linear-gradient(135deg, #0a0e18 0%, #050810 100%)",
      }}
    >
      <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="ffArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <filter id="ffGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {/* Price line */}
        <PriceLinePath />
        {/* Cash-flow bars beneath */}
        {[40, 75, 110, 145, 180].map((x, i) => (
          <rect
            key={x}
            x={x + 200}
            y={200 - i * 6}
            width="22"
            height={60 + i * 6}
            fill="#22d3ee"
            fillOpacity={0.15 + i * 0.05}
            rx="2"
          />
        ))}
      </svg>
    </div>
  );
}

function PriceLinePath() {
  // Static path — no animation in cards (cards already have hover motion)
  const d = "M40,160 C120,120 180,180 260,100 S400,180 560,80";
  return (
    <>
      <path
        d={`${d} L560,260 L40,260 Z`}
        fill="url(#ffArea)"
      />
      <path
        d={d}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ffGlow)"
      />
    </>
  );
}

/** Investment Foundations — abstract research-allocation composition. */
function InvestmentVisual() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 70% 30%, rgba(251,191,36,0.15), transparent 60%), linear-gradient(135deg, #13100a 0%, #0a0805 100%)",
      }}
    >
      <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="ifGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="ifGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Allocation pie / weighted blocks */}
        <g transform="translate(150 140)">
          <circle r="80" fill="none" stroke="rgba(251,191,36,0.18)" strokeWidth="1" />
          <circle r="60" fill="none" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
          <path d="M0,0 L0,-80 A80,80 0 0,1 76,-25 Z" fill="url(#ifGrad1)" />
          <path d="M0,0 L76,-25 A80,80 0 0,1 47,65 Z" fill="url(#ifGrad2)" />
          <path d="M0,0 L47,65 A80,80 0 0,1 -65,47 Z" fill="#fbbf24" fillOpacity="0.10" />
          <path d="M0,0 L-65,47 A80,80 0 0,1 0,-80 Z" fill="#fbbf24" fillOpacity="0.05" />
          <circle r="4" fill="#fbbf24" />
        </g>
        {/* Research lines — flowing to the right */}
        {[60, 100, 140, 180, 220].map((y, i) => (
          <line
            key={y}
            x1="280"
            x2="560"
            y1={y}
            y2={y - 10 + i * 4}
            stroke="#fbbf24"
            strokeOpacity={0.15 + i * 0.04}
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        ))}
      </svg>
    </div>
  );
}
