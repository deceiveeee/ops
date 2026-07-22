import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

export const metadata = { title: "Studio — Open Portfolio Studio" };

const previews = [
  { key: "builder", label: "Portfolio builder", note: "Compose assets and weights.", tone: "cyan" },
  { key: "riskmap", label: "Risk / return map", note: "Plot volatility vs. return.", tone: "green" },
  { key: "correlation", label: "Correlation view", note: "See how assets move together.", tone: "purple" },
  { key: "allocation", label: "Asset allocation", note: "Drag to allocate capital.", tone: "amber" },
  { key: "scenarios", label: "Scenario testing", note: "Stress-test macro shocks.", tone: "red" },
  { key: "watchlist", label: "Company research", note: "Investigate tickers and filings.", tone: "cyan" },
] as const;

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  green: "text-accent-green",
  purple: "text-accent-purple",
  amber: "text-accent-amber",
  red: "text-accent-red",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/30",
  green: "border-accent-green/30",
  purple: "border-accent-purple/30",
  amber: "border-accent-amber/30",
  red: "border-accent-red/30",
};

export default function StudioPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.08),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionLabel index="STUDIO" eyebrow="Portfolio workspace · concept" />
        <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
          The lab where you decode, build, and stress-test portfolios.
        </h1>
        <p className="mt-5 max-w-xl text-balance text-slate-300">
          A preview of the portfolio workspace. Use the course lessons to learn each calculation, then return here to compose assets, inspect risk, and stress-test scenarios in one place.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((p) => (
            <div key={p.key} className={`relative overflow-hidden rounded-2xl border ${toneBorder[p.tone]} bg-white/[0.02] p-6`}>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <span>Panel</span>
                <span className={toneText[p.tone]}>{p.label}</span>
              </div>
              <div className="mt-6 flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 bg-ink-900/40">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">interactive panel</span>
              </div>
              <p className="mt-4 text-sm text-slate-400">{p.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 glass-panel p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Stat label="Assets tracked" value="5" tone="cyan" />
            <Stat label="Portfolio vol (mock)" value="11.4%" tone="purple" />
            <Stat label="Diversification ratio" value="1.62x" tone="green" />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Mock / static · no live market data · for education only
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button href="/courses" variant="outline" size="md">
            Learn the concepts
          </Button>
          <Button href="/filings" variant="ghost" size="md">
            Open the filing reader
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "cyan" | "purple" | "green" }) {
  const color = { cyan: "text-accent-cyan", purple: "text-accent-purple", green: "text-accent-green" }[tone];
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
