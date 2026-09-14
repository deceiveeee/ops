import type { Breakdown, CustomerShare } from "@/lib/filings/revenue";
import type { RevenueFromFiling } from "@/lib/filings/revenue-source";
import { longDate } from "@/lib/studio-project/cost-of-capital";
import { Panel } from "./shared";
import StudioAside from "./workspace/StudioAside";

/**
 * Where a company's revenue comes from, in the company-report reader.
 *
 * This is the Understand step's second half. The Business section, one tab
 * along, says in words what the company sells and to whom; this shows the same
 * report's own figures for it: product lines, regions, segments, and the
 * customers it depends on. Every list is shown only where its parts add up to
 * the total revenue the report tags (lib/filings/revenue.ts), and where one does
 * not, the page says what its parts came to instead of drawing a wrong picture.
 *
 * Each list is named by its heading, and each row's name sits in its own
 * element, so a product line called "Metal Electrical Conduit" is never
 * mistaken for the Electrical segment by anything reading the page.
 */

const LOOK_FOR =
  "How much of the business rests on one product, one place or one customer, and whether that matches what the Business section says the company sells.";

const money = (value: number) => {
  const millions = value / 1_000_000;
  return `$${millions.toLocaleString("en-US", { maximumFractionDigits: Math.abs(millions) < 100 ? 1 : 0 })}m`;
};
const percent = (share: number) => `${(share * 100).toFixed(1)}%`;

export const BREAKDOWN_TITLE: Record<Breakdown["kind"], string> = {
  products: "By product line",
  regions: "By region",
  segments: "By segment",
};

function BreakdownList({ entry }: { entry: Breakdown }) {
  const headingId = `revenue-${entry.kind}`;
  return (
    <div>
      <h3 id={headingId} className="text-[14px] font-semibold text-white">
        {BREAKDOWN_TITLE[entry.kind]}
      </h3>
      {entry.found ? (
        <>
          <ul aria-labelledby={headingId} className="mt-2 space-y-2">
            {entry.rows.map((row) => (
              <li key={row.member} className="text-[13px] leading-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0">
                    <span className="text-slate-300">{row.label}</span>
                    {row.within ? <span className="text-slate-500"> · {row.within}</span> : null}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-200">
                    {percent(row.share)} <span className="text-slate-500">{money(row.value)}</span>
                  </span>
                </div>
                <div aria-hidden="true" className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-[#0066cc]/70" style={{ width: `${Math.max(0, Math.min(1, row.share)) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {entry.subtotalsLeftOut.length ? (
            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              Not listed again: {entry.subtotalsLeftOut.join(", ")}, the total of rows above.
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-1 text-[13px] leading-5 text-slate-500">{entry.reason}</p>
      )}
    </div>
  );
}

function Customers({ customers, name }: { customers: CustomerShare[]; name: string }) {
  return (
    <div>
      <h3 id="revenue-customers" className="text-[14px] font-semibold text-white">
        Customers it depends on
      </h3>
      {customers.length ? (
        <ul aria-labelledby="revenue-customers" className="mt-2 space-y-1 text-[13px] leading-5 text-slate-300">
          {customers.map((customer) => (
            <li key={`${customer.customer}-${customer.of}`}>
              <span className="font-semibold text-white">{customer.customer}</span>:{" "}
              {Number((customer.share * 100).toFixed(1))}% of{" "}
              {customer.of === "sales" ? "sales" : `what customers owed ${name} at the year end`}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[13px] leading-5 text-slate-500">
          Its data file tags no single customer&rsquo;s share of sales, or of what customers owe.
        </p>
      )}
    </div>
  );
}

export default function RevenueView({
  name,
  source,
  dataFileUrl,
  tabs,
}: {
  name: string;
  source: RevenueFromFiling;
  dataFileUrl: string | null;
  tabs: React.ReactNode;
}) {
  const { result } = source;
  const kind = (wanted: Breakdown["kind"]) => (result.found ? result.revenue.breakdowns.find((entry) => entry.kind === wanted) : undefined);
  const products = kind("products");
  const regions = kind("regions");
  const segments = kind("segments");

  return (
    <>
      {tabs}
      <section aria-labelledby="section-revenue" className="space-y-3">
        <h2 id="section-revenue" className="text-[17px] font-semibold text-white">
          Where {name}&rsquo;s revenue comes from
        </h2>

        <StudioAside
          inline={
            <p className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-[14px] leading-6 text-slate-300">
              <span className="font-semibold text-white">What to look for. </span>
              {LOOK_FOR}
            </p>
          }
          beside={
            <Panel>
              <h2 className="text-[14px] font-semibold text-white">What to look for here</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{LOOK_FOR}</p>
            </Panel>
          }
        />

        {result.found ? (
          <>
            <p className="text-[14px] leading-6 text-slate-300">
              In the year to {longDate(result.revenue.periodEnd)}, revenue was {money(result.revenue.total)}. Every share
              below is of that total, from the report&rsquo;s{" "}
              {dataFileUrl ? (
                <a href={dataFileUrl} target="_blank" rel="noreferrer noopener" className="text-accent-cyan underline underline-offset-2">
                  data file
                </a>
              ) : (
                "data file"
              )}
              , and a list is shown only where its parts add up to it.
            </p>
            <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
              {products ? <BreakdownList entry={products} /> : null}
              <div className="space-y-5">
                {regions ? <BreakdownList entry={regions} /> : null}
                {segments ? <BreakdownList entry={segments} /> : null}
              </div>
            </div>
            <Customers customers={result.revenue.customers} name={name} />
          </>
        ) : (
          <p className="text-[14px] leading-6 text-slate-400">{result.reason}</p>
        )}
      </section>
    </>
  );
}
