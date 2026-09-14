import { longDate } from "@/lib/studio-project/cost-of-capital";
import type { PeerSetEntry } from "@/lib/studio-project/peer-sets";

/**
 * A company's peers chosen by what they make, each with the reason it is here.
 *
 * Industry codes make a poor market boundary for Atkore: the SEC lists mostly
 * battery and EV-charger makers under its code. So this view is not a share
 * table. It says why the company is here, gives every peer a reason a learner
 * can check in a filing, names the competitors no SEC filing covers, and shows
 * who a search found and why they were left out. That last part answers the
 * question the handoff sets for the Find step: why is this company on the
 * list, and why is that one not?
 *
 * Every reason is on the page; the word-for-word passages behind them are one
 * click away. The first version showed them all at once and ran to 2.47 screens
 * at 1440, against a budget of 1.5; the second, 1.55, mostly because a wrapped
 * "Annual report, 2025" made every row a line taller.
 */

const external = "text-accent-cyan underline underline-offset-2 hover:text-white";
const disclosure = "cursor-pointer text-[12px] text-accent-cyan";

const joinAnd = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export default function PeerSetView({ set }: { set: PeerSetEntry }) {
  const { subject } = set;
  const namedCount = new Set(subject.named.flatMap((group) => group.names)).size;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[15px] font-semibold text-white">Why {subject.shortName} is here</h2>
        <p className="mt-1 text-[13px] leading-5 text-slate-400">
          The SEC files {subject.shortName} under industry code {subject.sic}, where it lists mostly battery and
          EV-charger makers. So these companies are chosen by what {subject.shortName}&rsquo;s{" "}
          <a href={subject.filing.url} target="_blank" rel="noopener noreferrer" className={external}>
            annual report for the year to {longDate(subject.filing.periodEnd)}
          </a>{" "}
          says it makes, including {joinAnd(subject.briefProducts)}.
        </p>
        <details className="mt-1">
          <summary className={disclosure}>Its own words</summary>
          <ul className="mt-2 space-y-1">
            {subject.makes.map((entry) => (
              <li key={entry.segment} className="text-[13px] leading-5 text-slate-300">
                <span className="font-semibold text-white">{entry.segment}:</span> &ldquo;{entry.quote}&rdquo;
              </li>
            ))}
          </ul>
        </details>
      </div>

      <section aria-labelledby="peer-set-in">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 id="peer-set-in" className="text-[15px] font-semibold text-white">
            In the set, and why
          </h2>
          <p className="text-[12px] text-slate-500">Most sell far more besides, so whole-company figures are not like-for-like.</p>
        </div>
        <ul className="mt-2 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
          {set.peers.map((peer) => {
            const year = peer.filing.periodEnd.slice(0, 4);
            return (
              <li
                key={peer.cik}
                className="grid gap-x-4 gap-y-0.5 px-4 py-2 text-[13px] leading-5 sm:grid-cols-[7rem_9rem_minmax(0,1fr)]"
              >
                <div>
                  <span className="font-semibold text-white">{peer.name}</span>{" "}
                  <span className="text-[12px] text-slate-500">{peer.ticker}</span>
                  <div>
                    <a
                      href={peer.filing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${peer.name}'s annual report for ${year}`}
                      className={`text-[12px] ${external}`}
                    >
                      {year} report
                    </a>
                  </div>
                </div>
                <div className="text-slate-300">
                  {peer.namedIn.length
                    ? `Named by ${subject.shortName} in ${joinAnd(peer.namedIn)}`
                    : `Found by searching annual reports for “${peer.foundBy}”`}
                </div>
                <div>
                  <p className="text-slate-300">
                    {peer.overlap
                      ? `${peer.overlap.lead}: “${peer.overlap.quote}”`
                      : `Names no product ${subject.shortName} makes, in words a search can find.`}
                  </p>
                  <p className="text-slate-500">
                    {peer.business.lead}: &ldquo;{peer.business.quote}&rdquo;
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div>
        <p className="text-[13px] leading-5 text-slate-400">
          <span className="font-semibold text-white">Named by {subject.shortName}, and missing.</span>{" "}
          {set.missing.length} of the {namedCount} competitors {subject.shortName} names file no annual report with the
          SEC, so no comparison built from SEC filings can include them: {set.missing.map((entry) => entry.namedAs).join("; ")}.
        </p>
        <details className="mt-1">
          <summary className={disclosure}>Why each is missing</summary>
          <ul className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {set.missing.map((entry) => (
              <li key={entry.namedAs} className="text-[13px] leading-5 text-slate-400">
                <span className="font-semibold text-slate-200">{entry.namedAs}</span>{" "}
                <span className="text-slate-500">({joinAnd(entry.namedIn)})</span>. {entry.note}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <details>
        <summary className={disclosure}>Found by the same searches, and left out ({set.leftOut.length})</summary>
        <ul className="mt-2 space-y-2">
          {set.leftOut.map((entry) => (
            <li key={entry.cik} className="text-[13px] leading-5 text-slate-400">
              <span className="font-semibold text-slate-200">{entry.name}</span>, found by &ldquo;{entry.foundBy}&rdquo;.{" "}
              {entry.why} Its report: &ldquo;{entry.quote}&rdquo;{" "}
              <a href={entry.filing.url} target="_blank" rel="noopener noreferrer" className={`text-[12px] ${external}`}>
                Read it
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
