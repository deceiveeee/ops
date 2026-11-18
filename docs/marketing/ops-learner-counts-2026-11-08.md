# Counting whether OPS is working

Date: **8 November 2026**. Status: **built and committed on branch
`claude/affectionate-neumann-e5e8bc`, not yet deployed. Counts are sent to Vercel Web Analytics;
the team is on the Pro plan as of 8 November 2026, so Vercel will record them once this is live.**

Today OPS only counts page views. That tells you how many people opened a page, not whether
anyone finished a lesson, solved the puzzle, shared it, or came back. Without those, money spent
on ads or time spent on teacher outreach cannot be judged. This adds six counts and nothing else.

## Where to read the counts

You chose option A, Vercel Pro, on 8 November 2026, and upgraded the `deceiveeees-projects` team
to Pro the same day. The code sends each count with Vercel's own `track()`, through the analytics
script already on every page. The Pro upgrade also lifts the Hobby cap that would have paused page
views after 50,000 a month.

1. Merge and deploy this branch. Nothing is counted until it is live.
2. Open **Analytics** for the `ops` project and scroll to **Events**. Each of the six names below
   appears there once the first learner does that thing, so the list starts empty.
3. Optional: set a spend alert under **Settings → Billing → Spend Management**. Counts and page views
   cost $0.03 per 1,000 each, so 100,000 of them is about $3 of Pro's $20 monthly usage credit.

## How the options compared (decided: A)

Vercel can count these on the site's own analytics, but **only on the Pro plan**. The Hobby plan
does not accept custom counts at all. ([Vercel: custom events](https://vercel.com/docs/analytics/custom-events),
[limits and pricing](https://vercel.com/docs/analytics/limits-and-pricing), read 8 November 2026.)

I could not see which plan the project is on: the Vercel dashboard needs your sign-in. The
team's address, `vercel.com/deceiveeees-projects`, is the name Vercel gives a personal Hobby
account, so it is probably Hobby, but a Pro team can keep that name.

Something else matters before any ad campaign, whichever option you pick: **Hobby stops counting
page views after 50,000 a month**, after a three-day grace period, and you cannot pay to lift it.
A real ad campaign would pass that, and the site would go blind in the middle of it.

| Option | Cost | What you would do | What changes for learners |
| --- | --- | --- | --- |
| **A. Upgrade to Vercel Pro** | $20 a month. It includes $20 of usage, and counts cost $0.03 per 1,000, so 100,000 a month is about $3 of that. | Upgrade in Vercel's billing settings. | Nothing new loads. The privacy page already names Vercel Analytics; it gains a line about these six counts. |
| **B. Count on OPS's own Supabase** | Free on the current Supabase plan. | Run one SQL file in the Supabase dashboard (I write it). | Nothing new loads. Counts go to OPS's own server, then to the Supabase project that already holds accounts. |
| **C. Plausible** | About $9 a month for 10,000 page views; more as traffic grows. Extra details on a count (such as clues used) need a higher plan. | Make an account, add the site. | A new outside script loads on every page. The privacy page promises there is none beyond Vercel's, so it would need rewriting. |

How each compares:

- **A** is the least work and the only one that also removes the 50,000 page-view cap. Two details
  per count, kept 12 months, read in the Vercel dashboard you already use.
- **B** costs nothing and keeps the counts entirely with OPS. You would read them with a SQL query
  or a small page I can add, not a dashboard. Anyone could send fake counts to it; it only accepts
  the six names below, but it cannot prove a count came from a real learner. It does not lift the
  page-view cap.
- **C** is built for privacy-first counting, but it adds an outside company and script for the
  first time, and costs more as the site grows.

The recommendation was A, if ads are still on the table, because the page-view cap would block them
anyway, or B for no monthly cost. Only the last step, where a count is sent, differs between them:
`sendToVercel` in `lib/counts/count.ts`.

## The six counts

Each one is sent at most once for each real action. Restoring saved work, reloading a page, or
opening a finished lesson again sends nothing.

| Count | Sent when | Details sent with it |
| --- | --- | --- |
| First stage finished | A learner finishes the first stage of a lesson, the first time in this browser. Only the 29 Investment Foundations lessons are built in stages; other lessons have none and send only "Lesson finished". | `lesson`: the lesson's address, such as `if-2-2-why-market-rates-change-bond-prices` |
| Lesson finished | A lesson in any course is marked finished for the first time in this browser (or, signed in, on this account). | `lesson`: the lesson's address |
| Puzzle solved | A learner solves a daily puzzle, once per puzzle in this browser. A puzzle given up sends nothing. | `puzzle`: its number; `clues`: how many clues were showing, 1 to 6 |
| Shared | A share goes through: the puzzle's Share result, or a lesson's Share menu. Copying counts once the copy succeeds; the phone's share sheet counts once an app was chosen, not when it is closed; Classroom counts when its own posting dialog opens, since whether the teacher then posts is only Classroom's to know. Each share counts, so sharing twice is two. | `page`: puzzle or lesson; `how`: app (the phone's share sheet), link (copied) or classroom |
| Arrived from a share | Someone opens a link that was shared from OPS. | `page`: puzzle, lesson, course or other; `how`: the same three |
| Came back within 7 days | This browser last opened OPS 1 to 7 days ago. Sent at most once a day. | none |

## What the counts never contain

- Nothing about the person: no name, email, account, age, school, or device ID.
- No answers, choices, written text, figures, or plan contents from any lesson or Studio page.
- No companies a learner picked, guessed or looked at. The puzzle number is the same puzzle for
  everyone; the guesses are never sent.
- Not the text of a share or who it went to.
- No dates or visit history. "Came back within 7 days" is a yes, sent alone.
- No ad pixels, no cookies, no session recording.

## What stays in the browser, and what is in a link

Two small notes, in the browser's own storage like lesson progress. Neither is sent.

- `ops-last-visit-v1`: the day this browser last opened OPS, as YYYY-MM-DD, so it can tell whether
  it came back within 7 days. Only the day; no time and no history.
- `ops-counted-v1`: the keys already counted, such as `first-stage:if-1-2-…` and `puzzle:1`, so
  redoing a stage or solving the same puzzle in a second tab does not count twice. At most 500.

Links made by the Share buttons end in `?via=app`, `?via=link` or `?via=classroom`. The mark says
how the link was shared and nothing about who shared it. The page that opens reads it, counts the
arrival, and removes it from the address bar, so a reload, or the address copied from the bar and
passed on, does not count again.

## Where it is in the code

- `lib/counts/events.ts`: the six names and the only details each may carry (`toPayload`), checked
  field by field. A detail that is not on the list, or a value of the wrong shape, stops the count.
- `lib/counts/count.ts`: sends through Vercel's `track()` (`sendToVercel`) and keeps the
  once-per-browser keys (`countOnce`).
- `lib/counts/visit.ts`: the 7-day return check. `components/counts/VisitCounts.tsx`: arrivals and
  returns, once per page load, mounted in `app/layout.tsx`.
- `lib/share.ts`: the `?via=` mark. Callers: `components/share/ShareMenu.tsx`,
  `components/daily/ResultPanel.tsx`, `components/daily/DailyPuzzleView.tsx`,
  `lib/progress/store.tsx` (lesson finished), and the seven Investment Foundations stage shells in
  `components/lessons/investment-foundations/` (first stage).
- Every count is also announced on the page as an `ops-count` event, which is how the tests see
  exactly what was sent.

## How it was checked

On 8 November 2026, in worktree `optimistic-margulis-ac73df`, built on `ca1f58b`:

- Type check and lint of the changed files: clean.
- Unit tests: 104 files, 1,361 tests pass. The count tests drive the real lesson shells, puzzle,
  Share menu, progress store and visit check, and assert each count is sent once, carries only its
  listed details, and is not sent again after a reload, a second answer, a second tab, a blocked copy
  or a closed share sheet.
- Each guarantee was broken on purpose to show its test fails: a forgotten "already counted" key, a
  store that trusts memory over storage, a shell that does not count, a share mark left in the
  address, a share counted before the copy succeeds, an unlisted detail passed through, and the
  Vercel queue not created. All seven were caught. An eighth change, dropping the same-day shortcut
  in the visit check, makes no difference: a same-day visit already reads as "no".
- Production build, full browser suite: 294 passed, 5 skipped (the same five as before), 0 failed.
  That includes the four count tests and the lesson walk, which answers every stage of all 29 staged
  lessons and now also checks each one counts "First stage finished" and "Lesson finished" exactly
  once. With the stage-1 count removed from one shell, that check failed with its own message.
- In the browser pane: solving puzzle 1 with two clues sent one count, `{puzzle: 1, clues: 2}`; a
  blocked copy sent none; a `?via=classroom` link lost its mark on arrival; stage 1 of lesson 1.2
  sent one count; the only keys kept were `puzzle:1` and that lesson's first stage.

## Limits

- A person on two browsers or devices counts as two. Clearing site data makes a browser new.
- "Came back within 7 days" has no matching "first visit" count. Compare it with page-view visitors.
- Shares made by copying the address bar, rather than the Share buttons, carry no mark and are not
  counted as shares or arrivals.
- Under EU rules, keeping a visit date in the browser for counting can need consent. OPS's
  audience is US students; if that changes, this needs a second look.
