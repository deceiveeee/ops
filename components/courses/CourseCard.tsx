import Link from "next/link";
import FedRateChart from "@/components/marketing/FedRateChart";
import LossRecoveryVisual from "@/components/marketing/LossRecoveryVisual";

/** Course overview with a visual that introduces one concrete financial relationship. */
export type CourseCardProps = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  outcomes: string[];
  hours: number;
  modules: number;
  lessons: number;
  moduleLabel?: string;
  lessonLabel?: string;
  variant: "cyan" | "amber";
  recommended?: boolean;
  ctaLabel?: string;
};

const variantBg: Record<string, string> = {
  cyan: "bg-white",
  amber: "bg-white",
};
const variantBorder: Record<string, string> = {
  cyan: "border-black/[0.08]",
  amber: "border-black/[0.08]",
};
const variantAccentText: Record<string, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
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
  moduleLabel = "Modules",
  lessonLabel = "Lessons",
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
      <div className="course-card-teaching-visual">
        {variant === "cyan" ? <FedRateChart compact embeddedInLink /> : <LossRecoveryVisual compact />}
        {recommended && (
          <div className="course-card-start-label">
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
          <Stat label={moduleLabel} value={String(modules)} />
          <Stat label={lessonLabel} value={String(lessons)} />
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
