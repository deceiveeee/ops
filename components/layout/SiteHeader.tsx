"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/filings", label: "Filings" },
  { href: "/studio", label: "Studio" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage, the header floats transparent over the hero and only
  // gains a surface once the user scrolls past the first viewport.
  const solid = scrolled || !isHome;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Open Portfolio Studio home">
          <Logo />
          <span
            className={cn(
              "font-semibold tracking-tight transition-colors",
              solid ? "text-slate-100" : "text-white",
            )}
          >
            Open Portfolio <span className="text-accent-cyan">Studio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                solid
                  ? "text-slate-300 hover:bg-white/5 hover:text-white"
                  : "text-slate-200/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button href="/courses" variant="outline" size="sm">
            Explore courses
          </Button>
          <Button href="/studio" size="sm">
            Enter the studio
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-md border border-white/10 p-2 text-slate-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink-950/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button href="/courses" variant="outline" size="sm" className="flex-1">
                Courses
              </Button>
              <Button href="/studio" size="sm" className="flex-1">
                Studio
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent-cyan">
      <path d="M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="3" cy="16" r="1.4" fill="currentColor" />
      <circle cx="21" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}
