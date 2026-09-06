import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms — Open Portfolio Studio",
  description:
    "Open Portfolio Studio is a place to learn about investing. It is not investment advice, and nothing here is a recommendation to buy or sell anything.",
};

/**
 * The contact address is deliberately a single constant. Set it before the site
 * is advertised — a legal page with no way to reach anyone is worse than none.
 */
const CONTACT = "SET-BEFORE-LAUNCH@example.com";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="6 September 2026"
      summary="Open Portfolio Studio is a place to learn how investing works. It is not investment advice, we are not your adviser, and every decision you make with what you learn here is your own."
    >
      <Section heading="This is not investment advice">
        <p>
          Nothing on this site is a recommendation to buy, sell or hold any investment, and nothing
          here is tailored to your circumstances. We do not know your finances, your obligations or
          your tolerance for loss, and we are not attempting to.
        </p>
        <p>
          Studio is a tool for thinking. It shows you how to read a company&rsquo;s numbers, works
          out what they imply, and tells you what they cannot tell you. A figure it calculates is
          the arithmetic of what you typed, not a judgment about whether something is worth owning.
          The judgment is yours, and so is the outcome.
        </p>
        <p>
          If you want advice about your own money, ask someone qualified and regulated to give it.
        </p>
      </Section>

      <Section heading="We are not your adviser or your broker">
        <p>
          Open Portfolio Studio is not a registered investment adviser, a broker-dealer, or a
          financial institution of any kind. Using this site creates no advisory relationship, no
          fiduciary duty, and no professional relationship of any sort between us.
        </p>
        <p>
          We cannot place a trade for you and we never will. Studio can help you write down what you
          intend to do; carrying it out happens somewhere else entirely.
        </p>
      </Section>

      <Section heading="Where the numbers come from, and their limits">
        <p>
          Company figures come from filings published by the U.S. Securities and Exchange
          Commission. Industry cost of capital comes from Aswath Damodaran at NYU Stern. Both are
          identified on screen with their date wherever they are used.
        </p>
        <p>
          Those sources can be wrong, out of date, or restated later, and our reading of them can be
          wrong too. Where we know a figure is doubtful, we say so rather than hiding it. We do not
          warrant that anything here is accurate, current or complete.
        </p>
        <p>
          Much of what Studio calculates rests on figures <em>you</em> look up and enter. We check
          what can be checked — a profit larger than the revenue it came from, a cash balance in the
          wrong units, a measure that does not apply to the kind of business you chose — but we
          cannot confirm that a number you typed is the right one from the right year. A confident
          answer built on a wrong input is still wrong.
        </p>
      </Section>

      <Section heading="Nothing here predicts anything">
        <p>
          Historical returns, scenarios and projections describe what has happened or what would
          follow from assumptions you choose. None of them forecasts what will happen. Investments
          can lose value, including all of it.
        </p>
      </Section>

      <Section heading="Your work">
        <p>
          What you write here stays in your browser and belongs to you. We have no copy of it and no
          claim to it. See{" "}
          <Link href="/privacy" className="text-accent-cyan hover:underline">
            privacy
          </Link>{" "}
          for what that means in practice, including that clearing your browser data deletes it.
        </p>
        <p>
          The site&rsquo;s own content — its lessons, explanations, wording and code — remains ours.
          You are welcome to use it to learn, and to quote it with attribution. Republishing it as
          your own, or reselling it, is not permitted.
        </p>
      </Section>

      <Section heading="Fair use of the site">
        <p>
          Use it as intended. Do not attempt to break it, overwhelm it, scrape it wholesale, or use
          it to mislead other people. We may restrict access if the site is being abused.
        </p>
      </Section>

      <Section heading="No warranty, and what we are liable for">
        <p>
          The site is provided as it is, without warranty of any kind. We do not promise it will be
          available, uninterrupted, or free of errors.
        </p>
        <p>
          To the fullest extent the law allows, we are not liable for any loss arising from your use
          of this site — including investment losses, lost profits, or decisions you make on the
          basis of anything you read or calculate here. Some jurisdictions do not allow parts of
          this to be excluded, and where that is so, this paragraph applies only as far as it
          lawfully can.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          These terms may change as the site does. The date at the top says when they last did.
          Continuing to use the site after a change means you accept the current version.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these terms, about privacy, or about anything the site gets wrong:{" "}
          <a href={`mailto:${CONTACT}`} className="text-accent-cyan hover:underline">
            {CONTACT}
          </a>
          .
        </p>
        <p>
          If you find a number here that is wrong, please say so. Corrections are the most useful
          thing anyone can send.
        </p>
      </Section>
    </LegalPage>
  );
}
