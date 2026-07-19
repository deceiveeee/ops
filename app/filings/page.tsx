import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { filingLines } from "@/data/marketing";

export const metadata = { title: "Filing reader — Open Portfolio Studio" };

export default function FilingsPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionLabel index="04" eyebrow="Filing reader · concept" tone="amber" />
        <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
          The 10-K is the source code.
        </h1>
        <p className="mt-5 max-w-xl text-balance text-slate-300">
          A placeholder for the future filing reader: split-screen document + investor-lens annotations, jump-to-section
          navigation, and scroll-linked callouts. Below is a mock preview.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="glass-panel p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Document map</div>
              <ul className="mt-3 space-y-2">
                {filingLines.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-amber/70" />
                    {l.section}
                    <span className="ml-auto font-mono text-[10px] text-slate-600">L{i + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Coming soon</div>
              <p className="mt-1 text-sm text-slate-400">
                Real filing ingestion, section pinning, and hover-to-explain terms will land in a later pass.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="glass-panel overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <span>FORM 10-K · MOCK PREVIEW</span>
                <span className="text-accent-amber">FILING READER</span>
              </div>
              <div className="divide-y divide-white/5">
                {filingLines.map((l, i) => (
                  <div key={l.id} className="px-5 py-5">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-accent-amber">{l.section}</div>
                    <p className="font-mono text-sm leading-relaxed text-slate-200">
                      <span className="mr-2 text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                      <span className="rounded bg-accent-amber/10 px-1 py-0.5 ring-1 ring-inset ring-accent-amber/20">{l.text}</span>
                    </p>
                    <div className="mt-3 rounded-lg border border-accent-cyan/20 bg-accent-cyan/[0.04] p-3 text-sm text-slate-300">
                      <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.18em] text-accent-cyan">Investor lens</span>
                      {l.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button href="/courses/business-and-financial-statements" variant="outline" size="md">
            Open the statements module
          </Button>
          <Link href="/studio" className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-accent-cyan">
            → Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
