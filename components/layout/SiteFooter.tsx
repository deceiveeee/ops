import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="font-semibold tracking-tight text-slate-100">
              Open Portfolio <span className="text-accent-cyan">Studio</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Decode the market beneath the chart. An interactive finance learning and portfolio studio — built on
              investigation, not memorization.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Static / mock data · No live market APIs · For education only
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol
              title="Learn"
              links={[
                { href: "/courses", label: "Courses" },
                { href: "/lessons/free-cash-flow-and-equity-value", label: "10-K reader" },
                { href: "/lessons/multiples-and-market-expectations", label: "Valuation" },
              ]}
            />
            <FooterCol
              title="Investigate"
              links={[
                { href: "/filings", label: "Filing reader" },
                { href: "/studio", label: "Portfolio studio" },
                { href: "/lessons/portfolio-volatility", label: "Portfolio risk" },
              ]}
            />
            <FooterCol
              title="Studio"
              links={[
                { href: "/studio", label: "Enter the studio" },
                { href: "/courses", label: "Course map" },
                { href: "/", label: "Homepage" },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Open Portfolio Studio. Educational use only.</span>
          <span className="font-mono uppercase tracking-[0.18em]">Not investment advice</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="text-sm text-slate-300 transition-colors hover:text-accent-cyan">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
