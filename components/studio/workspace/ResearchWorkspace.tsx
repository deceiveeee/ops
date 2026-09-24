"use client";

import { useRef, useState } from "react";
import { CATALOG_GAPS, STUDIO_CATALOG, type StudioInstrument } from "@/lib/studio-catalog";
import { addStudioHolding, removeStudioHolding } from "@/lib/studio";
import type { StageProps } from "../stages";
import ResearchRecord from "../ResearchRecord";
import CompanySearch, { companiesFound, useCompanySearch } from "./CompanySearch";
import ResearchFacts from "./ResearchFacts";
import StudioIcon from "./StudioIcon";
import ResearchPath from "./ResearchPath";
import WorkspaceNotes from "./WorkspaceNotes";
import styles from "./working-pages.module.css";

const FILTERS = [
  { id: "all", label: "All" }, { id: "fund", label: "Funds" },
  { id: "stock", label: "Stocks" }, { id: "bond", label: "Bonds" },
] as const;
const kindName = { fund: "Fund", stock: "Stock", bond: "Bond" };
/**
 * How many of the eight show before "Show all". Two, since the company path
 * above took the space the old tiles had: at three the page ran to 1.58
 * screens at 1024 against a limit of 1.5.
 */
const PAGE_SIZE = 2;
/** The library's own tickers, so a company already in it is not offered twice. */
const LIBRARY_TICKERS: ReadonlySet<string> = new Set(STUDIO_CATALOG.map((item) => item.symbol.toUpperCase()));

export default function ResearchWorkspace({ plan, update, record }: StageProps) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);
  /** Whether the companies at the SEC are open when the library already has matches of its own. */
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [view, setView] = useState<"facts" | "record">("facts");
  const [factSection, setFactSection] = useState<"risks" | "returns" | "details">("risks");
  const searchRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const held = new Set(plan.holdings.map(item => item.instrumentId));
  const matches = STUDIO_CATALOG.filter(item => (filter === "all" || item.kind === filter)
    && `${item.symbol} ${item.name}`.toLowerCase().includes(query.trim().toLowerCase()));
  const current = STUDIO_CATALOG.find(item => item.id === openId);
  const visible = all ? matches : matches.slice(0, PAGE_SIZE);
  const search = useCompanySearch(query, LIBRARY_TICKERS);
  // With two or more of the library's own investments listed, the companies at
  // the SEC wait behind one button beside "Show all": both lists open at once
  // took a phone to 1.63 screens for "vanguard".
  const companiesFolded = matches.length >= 2 && !companiesOpen;
  const foldedCompanies = companiesFolded && search.active ? search.companies.length : 0;
  const choose = (id: string) => {
    setOpenId(id); setView("facts"); setFactSection("risks");
    requestAnimationFrame(() => headingRef.current?.focus());
  };
  const toggleHolding = (id: string) => update(value => held.has(id) ? removeStudioHolding(value, id) : addStudioHolding(value, id));
  const addButton = (instrument: StudioInstrument) => <button type="button" className={held.has(instrument.id) ? styles.removeButton : styles.addButton}
    onClick={() => toggleHolding(instrument.id)}>{held.has(instrument.id) ? "Remove" : "Add to portfolio"}</button>;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeading}>
        <p className={styles.eyebrow}>Research</p>
        <h1 ref={headingRef} tabIndex={-1}>{current ? <>Your <em>research.</em></> : <>Research what you might <em>buy.</em></>}</h1>
        {!current && <p>Two ways in: research one company step by step, or choose from eight Studio has already researched.</p>}
      </header>
      {current ? <>
        <div className={styles.readerToolbar}>
          <button type="button" className={styles.backLink} onClick={() => { setOpenId(null); requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true })); }}>← All investments</button>
          <div className={styles.viewSwitch} role="group" aria-label="Investment view">
            <button type="button" aria-pressed={view === "facts"} onClick={() => setView("facts")}>Facts and sources</button>
            <button type="button" aria-pressed={view === "record"} onClick={() => setView("record")}>Your record</button>
          </div>
        </div>
        <article className={styles.investmentReader} aria-label={`${current.symbol} research`}>
          <button type="button" className={styles.instrumentHeading} aria-expanded="true" onClick={() => { setOpenId(null); requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true })); }}>
            <strong>{current.symbol}</strong><span>{current.name}</span><small>{current.expenseRatioPct === null ? "Annual cost not stated in a reviewed filing" : `${current.expenseRatioPct}% a year in fund costs`}</small>
          </button>
          {addButton(current)}
          {view === "facts" ? <>
            <div className={styles.factNav} role="group" aria-label="Facts to read">
              <button type="button" aria-pressed={factSection === "risks"} onClick={() => setFactSection("risks")}>Overview and risks</button>
              {current.report && <button type="button" aria-pressed={factSection === "returns"} onClick={() => setFactSection("returns")}>Returns and costs</button>}
              <button type="button" aria-pressed={factSection === "details"} onClick={() => setFactSection("details")}>Holdings and sources</button>
            </div>
            <div className={factSection === "risks" ? styles.showMainFacts : factSection === "returns" ? styles.showReturnFacts : styles.showSourceFacts}><ResearchFacts instrument={current} /></div>
          </> : record ? <ResearchRecord instrument={current} candidate={record.candidates.find(item => item.instrumentId === current.id)} held={held.has(current.id)} actions={{
            note: patch => record.note(current.id, patch), setStatus: (status, reason) => record.setStatus(current.id, status, reason),
            addEvidence: entry => record.addEvidence(current.id, entry), removeEvidence: id => record.removeEvidence(current.id, id),
          }} /> : null}
        </article>
      </> : <>
        <ResearchPath />
        <section className={styles.investmentLibrary} aria-labelledby="investment-library-heading">
          <div className={styles.libraryHeading}><div><h2 id="investment-library-heading">Or choose from eight investments Studio has researched</h2><p>Funds, shares and bonds with their facts and sources ready. Open one to read it and keep your reasons, or add it straight to your portfolio.</p></div>
            <label className={styles.search}><StudioIcon name="research" /><span className="sr-only">Find an investment or a company</span><input ref={searchRef} type="search" value={query} onChange={event => { setQuery(event.target.value); setAll(false); setCompaniesOpen(false); }} placeholder="Name or ticker" /></label>
          </div>
          <div className={styles.libraryFilters}><div role="group" aria-label="Investment type">{FILTERS.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => { setFilter(item.id); setAll(false); }}>{item.label}</button>)}</div><span role="status">{matches.length} {matches.length === 1 ? "investment" : "investments"}</span></div>
          <div className={styles.investmentList}>
            {visible.map(instrument => <article key={instrument.id} className={styles.investmentRow}>
              <button type="button" aria-expanded="false" onClick={() => choose(instrument.id)} className={styles.instrumentToggle}>
                <strong>{instrument.symbol}</strong><span>{instrument.name}</span><small>{kindName[instrument.kind]}{held.has(instrument.id) ? " · In your portfolio" : ""}</small>
              </button>
              {addButton(instrument)}
            </article>)}
            {matches.length === 0 && <div className={`${styles.noMatches} ${query.trim().length >= 2 ? styles.whileSearching : ""}`}><p>None of the {STUDIO_CATALOG.length} investments in this library matches that search.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); searchRef.current?.focus(); }}>Clear the search and filters</button></div>}
          </div>
          {(matches.length > PAGE_SIZE || foldedCompanies > 0) && <div className={styles.libraryFooter}>
            {matches.length > PAGE_SIZE && <button type="button" className={styles.showAll} aria-expanded={all} onClick={() => setAll(value => !value)}>{all ? "Show fewer investments" : `Show all ${matches.length} investments`}<StudioIcon name="arrow" /></button>}
            {foldedCompanies > 0 && <button type="button" className={styles.showAll} aria-expanded={false} onClick={() => setCompaniesOpen(true)}>{`Show ${companiesFound(foldedCompanies)}`}<StudioIcon name="arrow" /></button>}
          </div>}
          {!companiesFolded && <CompanySearch search={search} />}
        </section>
        <details className={styles.libraryGaps}><summary>What you cannot research here yet <span aria-hidden="true">+</span></summary><ul>{CATALOG_GAPS.map(gap => <li key={gap.missing}><strong>{gap.missing}.</strong> {gap.whyItMatters}</li>)}</ul></details>
      </>}
      <WorkspaceNotes kind="research" />
    </div>
  );
}
