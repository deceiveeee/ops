"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  EXAMPLE,
  RELATIONSHIPS,
  RELATIONSHIP_BY_KEY,
  WHY_IT_PAYS,
  ZONES,
  ZONE_BY_KEY,
  byZone,
  stillEmpty,
  whatIsMissing,
  type MapEntry,
  type Relationship,
  type Zone,
} from "@/lib/studio-project/industry-map";
import { addMapEntry, removeMapEntry } from "@/lib/studio-project/operations";
import { latestInvestigation, type FigureInvestigation, type KeptPassage } from "@/lib/studio-project/schema";
import library from "@/lib/studio-project/data/input-cost-library.json";
import { sectionLabel as labelForSection } from "@/lib/filings/sections";
import { Field, Panel, StageHeading } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * The industry map around one company.
 *
 * *Measuring the Moat* pp. 13-14: "The goal is to include all of the companies
 * or entities that may have an impact on the profitability of the firm you are
 * analyzing." Suppliers left, customers right, government across the top, the
 * things that reach everyone underneath — Exhibit 9's own arrangement, kept
 * here because the arrangement is the teaching.
 *
 * Studio does not know who supplies or buys from an arbitrary company and does
 * not guess. Two parts of the map it does know, because the learner built them
 * in the reader: inputs they linked to a price index, and competitors they
 * added. Both are drawn without being asked for again, and say where they came
 * from. Everything else is named by the learner, from the filings.
 *
 * Pages for every claim: docs/source-audits/studio-industry-map.md.
 */

const SERIES_NAME = new Map(
  (library.series as { id: string; name: string; title: string }[]).map((series) => [series.id, series.name || series.title]),
);

const ZONE_TONE: Record<Zone, string> = {
  suppliers: "border-accent-amber/30",
  rivals: "border-accent-cyan/40",
  customers: "border-accent-green/30",
  government: "border-white/15",
  other: "border-white/15",
};

export default function IndustryMapView() {
  const { session, project } = useWorkspace();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [adding, setAdding] = useState<Zone | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [affects, setAffects] = useState("");
  const [cited, setCited] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [showMissing, setShowMissing] = useState(false);

  const investigations = useMemo(
    () => [...(project?.investigations ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [project],
  );

  useEffect(() => {
    if (investigationId || !project) return;
    const opening = latestInvestigation(project);
    if (opening) setInvestigationId(opening.id);
  }, [project, investigationId]);

  const open: FigureInvestigation | undefined = investigations.find((item) => item.id === investigationId);
  const entries: MapEntry[] = open?.mapEntries ?? [];
  const passages: KeptPassage[] = open?.passages ?? [];
  const placed = byZone(entries);
  const empty = stillEmpty(entries);

  /* Already on the map, from work done in the reader rather than asked for twice. */
  const fromReader = useMemo(
    () => ({
      suppliers: (open?.inputs ?? []).map((link) => SERIES_NAME.get(link.seriesId) ?? link.seriesId),
      rivals: (open?.peers ?? []).map((peer) => peer.name),
    }),
    [open],
  );

  const blank = useCallback(() => {
    setAdding(null);
    setName("");
    setRelationship(null);
    setAffects("");
    setCited([]);
    setShowMissing(false);
  }, []);

  const missing = whatIsMissing({
    zone: adding ?? undefined,
    name,
    relationship: relationship ?? undefined,
    affects,
    passageIds: cited,
  });

  const add = async () => {
    if (!open || !adding) return;
    if (missing.length) {
      setShowMissing(true);
      return;
    }
    setNote(null);
    const zone = ZONE_BY_KEY.get(adding)!;
    const result = await sessionRef.current.update((current) =>
      addMapEntry(current, open.id, {
        zone: adding,
        name: name.trim(),
        ...(zone.asks && relationship ? { relationship } : {}),
        affects: affects.trim(),
        passageIds: cited,
      }),
    );
    if (result.ok) blank();
    else setNote(`Not saved: ${result.error}`);
  };

  const drop = async (entryId: string) => {
    if (!open) return;
    const result = await sessionRef.current.update((current) => removeMapEntry(current, open.id, entryId));
    if (!result.ok) setNote(`Not removed: ${result.error}`);
  };

  const zoneCard = (zone: Zone) => {
    const meta = ZONE_BY_KEY.get(zone)!;
    const mine = placed[zone];
    const seeded = zone === "suppliers" ? fromReader.suppliers : zone === "rivals" ? fromReader.rivals : [];
    return (
      <section
        key={zone}
        aria-label={meta.label}
        className={cn("rounded-xl border bg-white/[0.02] p-3", ZONE_TONE[zone])}
      >
        <h3 className="text-[13px] font-semibold text-white">{meta.label}</h3>
        <p className="text-[11px] leading-4 text-slate-500">{meta.sourceLabel}</p>
        <ul className="mt-2 space-y-1">
          {seeded.map((label) => (
            <li key={`seeded-${label}`} className="rounded-lg border border-dashed border-white/12 px-2 py-1 text-[12px] leading-4 text-slate-400">
              {label}
              <span className="ml-1 text-[11px] text-slate-600">from the reader</span>
            </li>
          ))}
          {mine.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[12px] leading-4">
              <span className="text-slate-200">{entry.name}</span>
              {entry.relationship ? (
                <span className="ml-1 text-[11px] text-slate-500">{RELATIONSHIP_BY_KEY.get(entry.relationship)?.label}</span>
              ) : null}
              <span className="mt-1 block text-[11px] leading-4 text-slate-500">{entry.affects}</span>
              <button
                type="button"
                onClick={() => void drop(entry.id)}
                aria-label={`Remove ${entry.name}`}
                className="mt-1 inline-flex min-h-11 items-center text-[11px] text-slate-500 hover:text-accent-amber"
              >
                Remove
              </button>
            </li>
          ))}
          {/* An empty side says what belongs on it rather than that it is empty:
              a learner meeting the map for the first time needs the definition
              before the invitation, and it costs a line that goes away as the
              side fills. */}
          {!seeded.length && !mine.length ? (
            <li className="text-[11px] leading-4 text-slate-600">{meta.whatBelongs}</li>
          ) : null}
        </ul>
        {open && adding === null ? (
          <button
            type="button"
            onClick={() => {
              blank();
              setAdding(zone);
            }}
            className="mt-2 inline-flex min-h-11 items-center text-[12px] text-accent-cyan hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            + Add
          </button>
        ) : null}
      </section>
    );
  };

  return (
    <div className="space-y-3">
      <Heading />

      {investigations.length > 1 ? (
        <nav aria-label="Companies you have looked at" className="-mx-1 overflow-x-auto px-1 pb-1">
          <ul className="flex items-center gap-2">
            {investigations.map((item) => {
              const active = item.id === investigationId;
              const count = item.mapEntries?.length ?? 0;
              return (
                <li key={item.id} className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setInvestigationId(item.id);
                      blank();
                    }}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3.5 text-[13px] transition-colors",
                      active
                        ? "border-accent-cyan/40 bg-accent-cyan/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white",
                    )}
                  >
                    {item.company.trim() || "Unnamed company"}
                    {count ? <span className="ml-2 text-[11px] text-slate-500">{count}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      {adding !== null && open ? (
        <Panel>
          <AddForm
            zone={adding}
            company={open.company}
            name={name}
            setName={setName}
            relationship={relationship}
            setRelationship={setRelationship}
            affects={affects}
            setAffects={setAffects}
            passages={passages}
            cited={cited}
            setCited={setCited}
            missing={showMissing ? missing : []}
            onAdd={() => void add()}
            onCancel={blank}
          />
          {note ? (
            <p role="alert" className="mt-2 text-[13px] leading-6 text-accent-amber">
              {note}
            </p>
          ) : null}
        </Panel>
      ) : null}

      {/*
        * Exhibit 9's arrangement: government across the top, suppliers on the
        * left, the industry in the middle, customers on the right, and the
        * things that reach everyone underneath. Below lg it stacks in the same
        * order, which still reads as left-to-right through the business.
        *
        * While something is being added, only the side it is being added to is
        * drawn. The form and the whole map together ran to 1.73 screens at 1440
        * against a budget of 1.5, and of the two the map is the part that can
        * wait: it is one press away, and the other four sides have nothing to
        * do with the entry being written.
        */}
      {adding !== null ? (
        zoneCard(adding)
      ) : (
        <div className="space-y-3">
          {zoneCard("government")}
          <div className="grid gap-3 lg:grid-cols-3">
            {zoneCard("suppliers")}
            {zoneCard("rivals")}
            {zoneCard("customers")}
          </div>
          {zoneCard("other")}
        </div>
      )}

      {!open ? (
        <Panel>
          <p className="text-[13px] leading-6 text-slate-400">
            <Link href="/studio/investigate" className="text-accent-cyan hover:underline">
              Start with a company&rsquo;s figures
            </Link>{" "}
            and this becomes its map. The paper&rsquo;s own is below either way.
          </p>
        </Panel>
      ) : (
        <p className="text-[12px] leading-5 text-slate-600">
          {empty.length === 0
            ? "Every side of the map has something on it."
            : `Nothing yet on: ${empty.map((zone) => ZONE_BY_KEY.get(zone)!.label.toLowerCase()).join(", ")}. The names are in its own filings, not in Studio.`}
        </p>
      )}

      {/* The model, and the paper's own. Closed, because a learner who has
          started their own map does not need somebody else's open beside it. */}
      <Panel>
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-[14px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
            {EXAMPLE.what}
            <span className="text-[12px] font-normal text-slate-500 group-open:hidden">Show</span>
            <span className="hidden text-[12px] font-normal text-slate-500 group-open:inline">Hide</span>
          </summary>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ZONES.map((zone) => (
              <div key={zone.key}>
                <h4 className="text-[12px] font-semibold text-slate-300">{zone.sourceLabel}</h4>
                <ul className="mt-1 space-y-0.5">
                  {EXAMPLE.zones[zone.key].map((item) => (
                    <li key={item} className="text-[12px] leading-4 text-slate-500">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-4 text-slate-600">
            {EXAMPLE.source} {EXAMPLE.note}
          </p>
        </details>
      </Panel>

      <StudioAside
        inline={null}
        beside={
          <Panel>
            <h2 className="text-[14px] font-semibold text-white">Where this comes from</h2>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              Michael J. Mauboussin and Dan Callahan, <em>Measuring the Moat</em>, Counterpoint Global,
              Morgan Stanley, 15 October 2024, pp. 13-14 and the checklist on p. 67.
            </p>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">{WHY_IT_PAYS}</p>
            <p className="mt-2 text-[13px] leading-5 text-slate-400">
              The paper also recommends listing each side in order of market share, so relative size
              shows. Studio has measured shares for five industries and none for an arbitrary supplier
              or customer, so this map is not ordered by size and does not pretend to be.{" "}
              <Link href="/studio/industry" className="text-accent-cyan hover:underline">
                The industry surface
              </Link>{" "}
              is where the measured shares are.
            </p>
          </Panel>
        }
      />
    </div>
  );
}

function AddForm({
  zone, company, name, setName, relationship, setRelationship, affects, setAffects,
  passages, cited, setCited, missing, onAdd, onCancel,
}: {
  zone: Zone;
  company: string;
  name: string;
  setName: (value: string) => void;
  relationship: Relationship | null;
  setRelationship: (value: Relationship) => void;
  affects: string;
  setAffects: (value: string) => void;
  passages: KeptPassage[];
  cited: string[];
  setCited: (update: (now: string[]) => string[]) => void;
  missing: string[];
  onAdd: () => void;
  onCancel: () => void;
}) {
  const meta = ZONE_BY_KEY.get(zone)!;
  return (
    <>
      <h2 className="text-[15px] font-semibold text-white">Add to {meta.label.toLowerCase()}</h2>
      <p className="mt-1 text-[12px] leading-5 text-slate-500">{meta.whatBelongs}</p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="What is it called" value={name} onChange={setName} />
          <Field
            label={`How it reaches ${company.trim() || "this company"}'s profits`}
            hint="The path it takes to the money, in the order it takes it."
            value={affects}
            onChange={setAffects}
            multiline
          />
        </div>
        <div className="space-y-3">
          {/* The paper's own list of economic interactions, p. 13, asked only
              where there is a counterparty to have one with. */}
          {meta.asks ? (
            <fieldset>
              <legend className="text-[13px] font-semibold text-white">What kind of arrangement is it?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {RELATIONSHIPS.map((kind) => (
                  <label
                    key={kind.key}
                    title={`For example: ${kind.example}`}
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3 text-[12px] transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/40",
                      relationship === kind.key
                        ? "border-accent-cyan/40 bg-accent-cyan/10 text-white"
                        : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                    )}
                  >
                    <input
                      type="radio"
                      name="map-relationship"
                      value={kind.key}
                      checked={relationship === kind.key}
                      onChange={() => setRelationship(kind.key)}
                      className="sr-only"
                    />
                    {kind.label}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">
                {relationship
                  ? `For example: ${RELATIONSHIP_BY_KEY.get(relationship)?.example}.`
                  : "The paper's own list, each with its own example."}
              </p>
            </fieldset>
          ) : (
            <p className="text-[12px] leading-5 text-slate-500">
              Nothing here is in an arrangement with the company, so there is no kind to choose.
            </p>
          )}

          {passages.length ? (
            <fieldset>
              <legend className="text-[13px] font-semibold text-white">
                Anything you kept that names it <span className="font-normal text-slate-500">optional</span>
              </legend>
              <ul className="mt-2 space-y-1">
                {passages.map((passage) => (
                  <li key={passage.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-[12px] leading-5 text-slate-400 hover:bg-white/[0.03]">
                      <input
                        type="checkbox"
                        checked={cited.includes(passage.id)}
                        onChange={() =>
                          setCited((now) =>
                            now.includes(passage.id) ? now.filter((id) => id !== passage.id) : [...now, passage.id],
                          )
                        }
                        className="mt-1 h-4 w-4 shrink-0"
                      />
                      <span>
                        <span className="line-clamp-2 text-slate-300">{passage.quote}</span>
                        <span className="text-slate-500">
                          {passage.form || "Report"} · {labelForSection(passage.sectionId, passage.form)}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          ) : (
            <p className="text-[12px] leading-5 text-slate-500">
              Nothing kept from its filings yet —{" "}
              <Link href="/studio/filings" className="text-accent-cyan hover:underline">
                its own reports
              </Link>{" "}
              are where these names are.
            </p>
          )}
        </div>
      </div>

      {missing.length ? (
        <p role="alert" className="mt-3 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-3 text-[13px] leading-6 text-slate-300">
          Still needs {missing.join(", ")}.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 text-[13px] font-semibold text-white transition-colors hover:border-accent-cyan/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
        >
          Put it on the map
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center px-2 text-[13px] text-slate-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

function Heading() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[13px] text-slate-500 lg:hidden">
        <Link href="/studio/research" className="text-accent-cyan hover:underline">
          Research
        </Link>
        <span aria-hidden="true"> › </span>
        <span>The map around it</span>
      </nav>
      <StageHeading as="h1" title="The map around it">
        Everyone who can reach a company&rsquo;s profits: who it buys from, who buys from it, who it
        competes with, and what affects them all. <em>Measuring the Moat</em> calls it an industry map
        and says it is a good place to start.
      </StageHeading>
    </>
  );
}
