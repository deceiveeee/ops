import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — Open Portfolio Studio",
  description:
    "What Open Portfolio Studio does with your data: accounts are optional, your plan and research never leave your browser, and signing in syncs only which lessons you have finished.",
};

/**
 * Written from an audit of what the application actually does, not from a
 * template. Every claim below was checked against the code.
 *
 * Rewritten on 7 September 2026 when accounts were offered again. The three
 * claims that changed are named here so the next person can check them rather
 * than trust them: an account now exists and holds an email address; signing in
 * sets a session cookie; and one record -- which lessons are finished --
 * reaches the server. Everything else a learner writes is still local, which is
 * verifiable in `lib/progress/store.tsx`: `completion` is the only column
 * written.
 *
 * If a second record starts syncing, or any browser-side third-party script is
 * added, this page stops being true and must be rewritten before that ships.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="7 September 2026"
      summary="An account is optional. Everything works without one, your plan and your research never leave your browser either way, and signing in syncs only which lessons you have finished."
    >
      <Section heading="An account is optional">
        <p>
          Every course, lesson, plan and Studio tool works without one. Nothing is held back behind
          signing in, and nothing asks you to make an account before you can continue.
        </p>
        <p>
          If you do make one, we ask for an email address and a password and nothing else. No name,
          no age, no address, no payment details. Accounts are handled for us by Supabase, which
          stores your email address and a scrambled form of your password that cannot be turned
          back into it. We can see the email address you signed up with. We cannot see your
          password, and neither can they.
        </p>
        <p>
          The only thing an account does is carry your finished lessons between your devices. That
          is the whole of its purpose.
        </p>
      </Section>

      <Section heading="Your work stays in your browser">
        <p>
          Everything you write or build here — your answers in a lesson, your investment plan, the
          companies you investigate, the figures you enter and the conclusions you record — is
          saved by your own browser, on your own device, using its local storage.
        </p>
        <p>
          None of it is sent to us, whether or not you have an account. We could not read it if we
          wanted to. It follows that we cannot recover it for you either: clearing your
          browser&rsquo;s site data for this site deletes it permanently, and it does not travel
          with you to another device or another browser. Studio can export your work to a file,
          which is the way to keep a copy or move it.
        </p>
        <p>
          Signing in changes exactly one thing. A list of which lessons you have finished is stored
          against your account so it follows you to another device. Not your answers, not your
          plan, not the companies you looked at, not the figures you entered — only which lessons
          are marked done.
        </p>
      </Section>

      <Section heading="Cookies, only if you sign in">
        <p>
          Reading the site sets no cookies at all. Nothing is stored until you choose to sign in,
          and nothing here follows you between sites.
        </p>
        <p>
          Signing in sets one cookie, which is what keeps you signed in from page to page. It is
          not used for advertising or tracking, it is not shared, and signing out removes it.
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
          The site is intended for a general audience learning about investing. Reading it collects
          nothing from anyone. An account holds an email address, so it is not meant for children
          under 13, and we do not knowingly keep an account for one. If you believe a child has
          made an account here, write to the address on the terms page and it will be deleted.
        </p>
      </Section>

      <Section heading="Your control">
        <p>
          Your work is on your device. To delete it, clear this site&rsquo;s data in your browser
          settings; to keep it, export it from Studio first. That is true whether or not you have
          an account, and it is not something you need to ask us for.
        </p>
        <p>
          If you have an account, the email address and the list of finished lessons are the only
          things we hold. Write to the address on the{" "}
          <Link href="/terms" className="text-accent-cyan hover:underline">
            terms page
          </Link>{" "}
          and we will delete both. There is no self-service delete button yet, which is a gap we
          would rather name than hide.
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
