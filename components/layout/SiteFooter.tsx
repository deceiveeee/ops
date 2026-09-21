import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div><strong>Investing Studio</strong><p>Interactive finance courses and portfolio tools.</p></div>
        <nav aria-label="Footer"><Link href="/courses">Courses</Link><Link href="/studio">Studio</Link><Link href="/studio/filings">Company reports</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav>
      </div>
      <div className="site-footer-note"><span>© {new Date().getFullYear()} Investing Studio</span><span>Educational use. Not investment advice. Progress stays in this browser.</span></div>
    </footer>
  );
}
