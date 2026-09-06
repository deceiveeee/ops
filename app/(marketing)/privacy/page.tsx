import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — Open Portfolio Studio",
  description:
    "What Open Portfolio Studio does with your data: no accounts, no cookies, and your course and portfolio work never leaves your browser.",
};

/**
 * Written from an audit of what the application actually does, not from a
 * template. Every claim below was checked against the code and the running
 * site: `GUEST_ONLY_BETA` disables accounts, no client component makes an
 * external request, and a loaded page sets no cookies.
 *
 * If accounts are re-enabled, or any browser-side third-party script is added,
 * this page stops being true and must be rewritten before that ships.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="6 September 2026"
      summary="Open Portfolio Studio has no accounts, sets no cookies, and never receives the work you do here. Your lessons, your plan and your research stay in your browser."
    >
      <Section heading="There are no accounts">
        <p>
          You cannot create an account, and there is nothing to sign in to. We hold no name, no
          email address and no password, because we never ask for any.
        </p>
        <p>
          The site is open to read and use as it is. If that changes, this page will be rewritten
          before it does.
        </p>
      </Section>

      <Section heading="Your work stays in your browser">
        <p>
          Everything you write or build here — your answers in a lesson, your investment plan, the
          companies you investigate, the figures you enter and the conclusions you record — is
          saved by your own browser, on your own device, using its local storage.
        </p>
        <p>
          None of it is sent to us. We could not read it if we wanted to. It follows that we cannot
          recover it for you either: clearing your browser&rsquo;s site data for this site deletes
          it permanently, and it does not travel with you to another device or another browser.
          Studio can export your work to a file, which is the way to keep a copy or move it.
        </p>
      </Section>

      <Section heading="We set no cookies">
        <p>
          Loading any page here sets no cookies at all, so there is no consent banner to dismiss
          and nothing following you between sites.
        </p>
      </Section>

      <Section heading="What we do measure">
        <p>
          The site uses Vercel Analytics and Vercel Speed Insights to count page views and record
          how quickly pages load. These report in aggregate — which pages are visited, roughly
          where in the world from, what kind of device and browser — and are not used to identify
          you or to build a profile of you. They do not use cookies.
        </p>
        <p>
          That is the whole of it. There is no advertising network, no tracking pixel, no session
          recording, and no third-party analytics beyond those two.
        </p>
      </Section>

      <Section heading="Where the financial data comes from">
        <p>
          Company filings come from the U.S. Securities and Exchange Commission, and industry cost
          of capital from Aswath Damodaran at NYU Stern. Those are fetched by our server, not by
          your browser, so neither of them sees you, your address or your device.
        </p>
        <p>
          When Studio links you out to a filing or another site, that is an ordinary link. Once you
          follow it you are on their site and their privacy terms apply, not ours.
        </p>
      </Section>

      <Section heading="Hosting">
        <p>
          The site is hosted by Vercel, whose servers keep standard request logs including IP
          addresses, as any web server does. We do not combine those logs with anything else, and
          we have no other way of connecting a request to a person.
        </p>
      </Section>

      <Section heading="Children">
        <p>
          The site is intended for a general audience learning about investing. Since we collect no
          personal information from anyone, we hold none from children either.
        </p>
      </Section>

      <Section heading="Your control">
        <p>
          Because your work is on your device and we hold nothing that identifies you, there is no
          account to close and no request to make of us. To delete everything, clear this
          site&rsquo;s data in your browser settings. To keep it, export it from Studio first.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          If this changes — if accounts arrive, or anything new is added that collects data — this
          page will be updated and its date changed before that reaches the live site.
        </p>
        <p>
          Questions about any of this can go to the address on the{" "}
          <Link href="/terms" className="text-accent-cyan hover:underline">
            terms page
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
