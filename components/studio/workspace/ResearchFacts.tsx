import type { StudioInstrument } from "@/lib/studio-catalog";
import { Fact, pct } from "../shared";
import FundReportFacts from "../FundReportFacts";
import styles from "./working-pages.module.css";

/** Source-backed content from the existing Research stage; figures and citations are unchanged. */
export default function ResearchFacts({ instrument }: { instrument: StudioInstrument }) {
  return <div className={styles.researchFacts}><div data-research-content="main">
                  <p className="ops-body text-[14px] leading-6 text-slate-300">{instrument.whatItIs}</p>

                  <div>
                    <div className="ops-caption text-[11px] text-slate-500">What the filing calls its main risks</div>
                    <ul className="mt-2 space-y-1">
                      {instrument.mainRisks.map((risk) => (
                        <li key={risk} className="flex gap-2 text-[14px] leading-6 text-slate-300">
                          <span className="text-accent-amber">·</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

    </div><div data-research-content="returns"><FundReportFacts instrument={instrument} /></div><div data-research-content="sources">

                  {/*
                    Four facts a single share needs kept apart, because the
                    convenient assumption is that buying in dollars on a US
                    exchange makes something a US holding. It does not: TSM is
                    a Taiwanese company reporting in New Taiwan dollars, bought
                    in US dollars as a depositary share standing for five
                    ordinary ones. docs/source-audits/studio-learning.md (P3-P5)
                    requires the separation.
                  */}
                  {instrument.stock ? (
                    <div>
                      <div className="ops-caption text-[11px] text-slate-500">How you would hold it</div>
                      <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                        <Fact label="Incorporated in" value={instrument.stock.incorporatedIn} />
                        <Fact label="Trades on" value={`${instrument.stock.exchange}, in US dollars`} />
                        <Fact
                          label="What you buy"
                          value={
                            instrument.stock.adsRatio === null
                              ? instrument.stock.usListing
                              : `${instrument.stock.usListing}, each standing for ${instrument.stock.adsRatio} ordinary shares`
                          }
                        />
                        <Fact label="Company reports in" value={instrument.stock.reportsIn} />
                      </dl>
                    </div>
                  ) : null}

                  {/*
                    Only funds. A single share is its own issuer at 100%, so
                    "largest holdings, 100% documented" would restate the name
                    as though it were a finding.
                  */}
                  {instrument.kind === "fund" ? (
                    <div>
                      <div className="ops-caption text-[11px] text-slate-500">
                        Largest holdings, {pct(instrument.exposureCoveragePct ?? 0)} of the fund documented
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {instrument.exposures.slice(0, 6).map((exposure) => (
                          <li key={exposure.label} className="text-[13px] tabular-nums text-slate-400">
                            {exposure.label} {exposure.weightPct.toFixed(2)}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <div className="ops-caption text-[11px] text-slate-500">Where these facts come from</div>
                    <ul className="mt-2 space-y-1">
                      {instrument.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-slate-400 underline decoration-white/20 underline-offset-2 hover:text-accent-cyan"
                          >
                            {source.label}
                          </a>
                          <span className="text-[13px] text-slate-500"> · as of {source.asOf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>


  </div></div>;
}
