"use client";

import { motion } from "motion/react";
import SectionLabel from "@/components/ui/SectionLabel";
import FloatingArtifact from "@/components/marketing/FloatingArtifact";
import { filingLines } from "@/data/marketing";

const sectionTone: Record<string, "cyan" | "green" | "purple" | "amber" | "red"> = {
  Business: "cyan",
  "Risk Factors": "red",
  "MD&A": "amber",
  "Cash Flow": "green",
};

const toneClasses: Record<string, string> = {
  cyan: "border-accent-cyan/30 text-accent-cyan",
  red: "border-accent-red/30 text-accent-red",
  amber: "border-accent-amber/30 text-accent-amber",
  green: "border-accent-green/30 text-accent-green",
};

export default function FilingReaderTeaser() {
  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(251,191,36,0.06),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header — full width, centered eyebrow */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <SectionLabel index="04" eyebrow="The 10-K is the source code" tone="amber" className="justify-center" />
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Real investors read source documents.
          </h2>
          <p className="mt-5 text-balance text-slate-300">
            Not headlines. Not summaries. The filing is where the business explains itself — its model, its risks, its
            cash, and its narrative.
          </p>
        </div>

        {/* Split: document map (left, narrow) + filing (right, wide) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* sticky document map */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <div className="glass-panel p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Document map</div>
                <ul className="mt-3 space-y-2">
                  {filingLines.map((l, i) => (
                    <li key={l.id} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${l.section === "Risk Factors" ? "bg-accent-red/70" : l.section === "Cash Flow" ? "bg-accent-green/70" : l.section === "MD&A" ? "bg-accent-amber/70" : "bg-accent-cyan/70"}`} />
                      {l.section}
                      <span className="ml-auto font-mono text-[10px] text-slate-600">L{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Business", "Risk Factors", "MD&A", "Cash Flow"].map((s) => (
                  <span
                    key={s}
                    className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${toneClasses[sectionTone[s]]}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* filing document — dimensional stacked slab */}
          <div className="lg:col-span-9">
            <FloatingArtifact pages={3}>
              <div className="relative overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  <span>FORM 10-K · ANNUAL REPORT · MOCK</span>
                  <span className="text-accent-amber">FILING READER</span>
                </div>

                <div className="divide-y divide-white/5">
                  {filingLines.map((l, i) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-15%" }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative px-5 py-5"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] ${toneClasses[sectionTone[l.section]]}`}>
                          {l.section}
                        </span>
                      </div>
                      <p className="font-mono text-sm leading-relaxed text-slate-200">
                        <span className="mr-2 text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                        <span className="rounded bg-accent-amber/10 px-1 py-0.5 ring-1 ring-inset ring-accent-amber/20">
                          {l.text}
                        </span>
                      </p>
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent-cyan/20 bg-accent-cyan/[0.04] p-3">
                        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-accent-cyan">
                          Investor lens
                        </span>
                        <span className="text-sm text-slate-300">{l.note}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pointer-events-none absolute -right-12 top-10 h-40 w-40 rounded-full bg-accent-amber/10 blur-3xl" />
              </div>
            </FloatingArtifact>
          </div>
        </div>
      </div>
    </section>
  );
}
