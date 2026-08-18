import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="mx-auto max-w-[1400px] px-6 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_auto]">
          <div className="max-w-[420px]">
            <div className="text-[17px] font-semibold tracking-[-0.01em] text-slate-100">
              Open Portfolio Studio
            </div>
            <p className="mt-3 text-[16px] leading-relaxed text-slate-300">
              Interactive finance courses and portfolio tools for educational use.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
              Not investment advice. No live market data.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-14 gap-y-3 sm:grid-cols-3"
          >
            <FooterCol
              title="Learn"
              links={[
                { href: "/courses", label: "Courses" },
                { href: "/courses/finance-foundations", label: "Finance Foundations" },
                { href: "/courses/investment-foundations", label: "Investment Foundations" },
              ]}
            />
            {/* Four of these six links used to point at /studio and /filings,
                both concept mocks, while /dossier had no route in from the
                global chrome at all. */}
            <FooterCol
              title="Build"
              links={[
                { href: "/dossier", label: "Your dossier" },
                { href: "/start", label: "Find your starting point" },
                { href: "/lessons/portfolio-risk-covariance-correlation", label: "Portfolio risk" },
              ]}
            />
            <FooterCol
              title="Navigate"
              links={[
                { href: "/", label: "Homepage" },
                { href: "/courses", label: "Course map" },
                { href: "/filings", label: "Filing reader (preview)" },
                { href: "/studio", label: "Portfolio Studio (preview)" },
              ]}
            />
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[14px] text-slate-500 sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} Open Portfolio Studio. Educational use only.
          </span>
          <span>Static mock data. Not investment advice.</span>
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
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-[15px] text-slate-400 transition-colors hover:text-accent-cyan"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
