import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="mx-auto max-w-[1400px] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_auto] md:gap-12">
          <div className="max-w-[420px]">
            <div className="text-[16px] font-semibold tracking-[-0.01em] text-slate-100">
              Open Portfolio Studio
            </div>
            <p className="mt-2 text-[14px] leading-6 text-slate-300">
              Interactive finance courses and portfolio tools for educational use.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-3 gap-x-4 gap-y-3 sm:gap-x-10"
          >
            <FooterCol
              title="Learn"
              links={[
                { href: "/courses", label: "Courses" },
                { href: "/courses/finance-foundations", label: "Finance Foundations" },
                { href: "/courses/investment-foundations", label: "Investment Foundations" },
              ]}
            />
            <FooterCol
              title="Build"
              links={[
                { href: "/plan", label: "Your plan" },
                { href: "/studio", label: "Studio" },
                { href: "/start", label: "Find your starting point" },
                { href: "/lessons/portfolio-risk-covariance-correlation", label: "Portfolio risk" },
              ]}
            />
            <FooterCol
              title="Navigate"
              links={[
                { href: "/", label: "Homepage" },
                { href: "/courses", label: "Course map" },
                { href: "/filings", label: "Filing reader" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ]}
            />
          </nav>
        </div>

        <div className="mt-7 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-5 text-[12px] leading-5 text-slate-500 sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} Open Portfolio Studio. Educational use only.
          </span>
          <span>Progress stays in this browser. Not investment advice.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-[15px] font-semibold text-slate-200">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-[13px] leading-5 text-slate-400 transition-colors hover:text-accent-cyan"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
