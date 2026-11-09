# Features that bring students to OPS without ads

Research date: **3 November 2026**. Audience: **students learning finance**, mostly high school, the audience chosen for the [October ad research](ops-ad-creative-research-2026-10-18.md). Status: **a proposal to choose from.** Update, 3 November 2026: steps 0 (link previews and share buttons) and 1 (the daily company puzzle, 35 puzzles) are built locally and uncommitted. Measurement (step 0's companion) is not built.

## The short version

Popular sites rarely grow because of an ad. They grow because using the product gives people a reason to show someone else, or a reason to come back. Four patterns fit OPS best:

1. **Teachers bring whole classes.** Kahoot reached 2 million US teachers and 21 million US students a month by 2017, mostly through classrooms. Thirty US states now require a personal finance course to graduate. OPS lessons already work on their own, so a teacher could assign one today. What's missing: a way to send a lesson to a class and see who finished it.
2. **A daily puzzle whose result you can post without giving away the answer.** Wordle went from 90 players to more than 300,000 in about two months. Its share button, added in mid-December, posted a grid of colored squares that showed how you did without revealing the word. OPS can offer something no finance puzzle has: clues from a real company's annual report, and an answer that opens that report in OPS.
3. **Work shared by link brings in the next person.** Figma says sharing work by link brought collaborators in earlier. When a student sends their company analysis to a teacher or a friend, the person who opens it should land in OPS and be able to start their own.
4. **Pages that answer what people search for.** Zapier and Wise get large amounts of search traffic from one useful page per app or currency. OPS could make one honest page per company ("How this company makes money, from its annual report"), built from the SEC data it already reads.

Start with the small groundwork: a proper preview when an OPS link is shared, plus share buttons. Then build the daily puzzle and a teacher kit. The full order is at the end.

Two things to avoid, because regulators have already acted on them:
- **Celebrating trading or gains.** Robinhood paid Massachusetts $7.5 million over confetti and similar features.
- **Pressure tactics aimed at teenagers,** such as streak-loss warnings.

## How to read the evidence

Each claim below carries one of four labels:

- **Tested:** the company reports a controlled A/B test (half of users see a change and half don't).
- **Company-reported:** the company's own numbers, without a published method.
- **Outside estimate:** a third party's measurement or estimate.
- **Pattern:** the design is well documented, but no reliable numbers exist.

Almost none of this comes from finance-learning sites for teenagers. It shows what has worked elsewhere, not what OPS will get.

## What popular sites do

### 1. Let people try it before asking for an account

Duolingo moved its sign-up screen back so new users could do a lesson first. Its growth lead reported **about a 20% increase in daily active users** (people who use the app on a given day). Later sign-up prompts that users could skip added **a further 8.2%**. *Tested.* ([First Round Review, 2017](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker))

**For OPS:** OPS already does this ("Free to explore. No account needed."). Keep it, and make every new feature below work for a guest first. The only sign-up nudge worth testing is a skippable "keep your progress on any device" prompt at a natural stopping point.

### 2. A daily challenge with a result you can share without spoiling it

- **Wordle.** On 1 November 2021, 90 people played. Just over two months later, more than 300,000 did. The game had no way to share results until mid-December. Its creator added one after seeing players type out emoji grids by hand. He left the game's link off the grid on purpose. *Company-reported.* ([The New York Times, republished by Boston.com](https://www.boston.com/news/national-news/2022/01/04/he-made-wordle-for-his-partner-now-its-an-online-hit/))
- **Advent of Code.** It posts one programming puzzle a day for 25 days each December, the same puzzle for everyone. In 2024, **268,597 people** solved both parts of day 1. *Company-reported.* ([stats page](https://adventofcode.com/2024/stats))
- **Chess.com.** It runs a daily puzzle and a timed "Puzzle Rush". *Pattern.* ([Chess.com help](https://support.chess.com/article/286-how-do-puzzles-work))
- **Finance versions already exist.** Financhle and Ticker League ask you to guess a stock from hints or its price chart. *Pattern.* ([Financhle](https://www.producthunt.com/products/financhle-the-wordle-of-finance/launches), [Ticker League](https://tickerleague.com/games/daily)) None of them teaches you to read the company's own report, which is what OPS is built around.

**Why it works:** one small task a day gives people a reason to return without nagging them. Everyone gets the same puzzle, so results can be compared. A shared result makes friends curious without spoiling the answer.

### 3. A personal recap people want to post

- **Spotify Wrapped.** Sensor Tower counted **2.3 million Spotify downloads** in the three days after Wrapped launched in December 2019. The same three days in 2018 had 1.5 million. *Outside estimate.* ([Fortune](https://fortune.com/2019/12/11/spotify-wrapped-playlist-app-download))
- **Strava.** It has sent members a shareable "Year in Sport" since 2017. *Pattern.* ([Cycling Weekly](https://cyclingweekly.com/news/product-news/strava-launches-my-year-in-sport-video-showing-your-key-stats-from-2017-364094))

**For OPS:** this is worth building only once students have a semester of work to look back on.

### 4. Teachers bring whole classes

- **Kahoot.** By March 2017, more than **2 million US K-12 teachers** had signed up, and **21 million US students** used it each month. *Company-reported.* ([Kahoot](https://kahoot.com/blog/2017/03/06/kahoot-reaches-1-billion-players/))
- **Next Gen Personal Finance (NGPF).** Its free curriculum serves **more than 140,000 teachers**. **Thirty states** now require a standalone personal finance course to graduate, up from six in 2019, and those states cover 76% of US students. *Company-reported.* ([NGPF, March 2026](https://www.ngpf.org/blog/press-releases/ngpf-and-fico-launch-documentary-roadshow-to-advance-access-to-personal-finance-education/)) Teachers use its weekly "FinCap Friday", a two-minute video and a five-question quiz, as a warm-up at the start of class. ([NGPF](https://www.ngpf.org/blog/fincap-friday/3-ways-to-use-fincap-friday/))
- **The Stock Market Game (SIFMA Foundation).** More than **600,000 students** take part each school year, all through their teachers. *Company-reported.* ([SIFMA](https://www2.sifma.org/Education/SIFMA-Foundation/Stock-Market-Game%E2%84%A2/))
- **AP Business with Personal Finance.** This is a new College Board course that schools can offer from the 2026–27 school year. Its units include business finance and accounting, and personal goals, budgeting and investing. It was developed with input from the high school business clubs DECA and FBLA. ([AP Central](https://apcentral.collegeboard.org/courses/ap-business-personal-finance/about), [College Board](https://go.collegeboard.org/introducing-ap-business), [DECA](https://www.decadirect.org/articles/bring-ap-business-with-personal-finance-to-your-school-in-fall-2026))
- **A ready-made tool.** Google offers a free "Share to Classroom" button for any website. It turns a link into an assignment or class material in a teacher's Google Classroom. ([Google developer guide](https://developers.google.com/workspace/classroom/guides/sharebutton))

**For OPS:** this is the largest route to students. One teacher who assigns a lesson brings in a whole class, often several. OPS lessons are self-contained and interactive, so they already suit being assigned. Three things are missing:
- a way to send a lesson to a class
- a teacher page that says what each lesson teaches
- a simple view of who finished

### 5. Work shared by link brings in the next person

- **Figma.** Its 2025 IPO filing says "the ability to easily share work with a URL led people to bring collaborators into their files earlier." *Company-reported.* ([Figma S-1](https://www.sec.gov/Archives/edgar/data/1579878/000162828025033742/figma-sx1.htm))
- **Dropbox.** It paid for the same loop with storage: when you invited a friend who joined, you both got extra space. Popular growth figures for this program come from secondary write-ups, not from Dropbox. *Pattern.* ([TidBITS, 2012](https://tidbits.com/2012/04/04/dropbox-referral-bonuses-doubled-to-500-mb-retroactively/))

**For OPS:** today a student's work lives only in their browser and can leave only as a backup file. A view-only link to an investigation or a plan, with a "start your own" button, would turn every shared assignment into an introduction to OPS. Paid referral rewards don't suit a free learning site.

### 6. Pages that answer what people search for

- **Zapier and Wise.** Zapier has a page for each app it connects, and Wise has a page for each currency conversion. Outside tools estimate these pages bring Zapier hundreds of thousands of visits a month and Wise tens of millions. The estimates vary widely. *Outside estimate.* ([Backlinko](https://backlinko.com/programmatic-seo))
- **Quizlet.** Its CEO said search has been a significant source of new users. Its pages are study sets that users make. *Company-reported.* ([Latka interview](https://getlatka.com/companies/quizlet/interviews/quizlet-matthew-glotzbach))
- **The limit.** Google penalizes "scaled content abuse", which it describes as many pages "generated for the primary purpose of manipulating search rankings and not helping users". ([Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies))

**For OPS:** one page per company, built from its filings. It would show what the company sells, where its revenue comes from, and what it owes and holds. Each number would link to its source, with a button to investigate the company in OPS. Each page has to explain something a search result doesn't, or it will be treated as spam.

### 7. Habits: streaks and leagues

- **Duolingo streaks.** Learners who reach a 7-day streak are **2.4 times more likely** to come back the next day. That is a correlation, not a test. An A/B test that separated the streak from the daily goal raised day-14 retention by **3.3%**. *Tested and company-reported.* ([Duolingo, 2020](https://blog.duolingo.com/improving-the-streak))
- **Leagues.** Duolingo's weekly leagues put users in groups competing for points. No effect has been published. *Pattern.*

**For OPS, with care:**
- The UK's children's code, a useful standard even outside the UK, singles out reward loops and notifications that keep children engaged. It says such features need careful thought, and should make it easy to stop without pressure. ([ICO, standard 5](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/5-detrimental-use-of-data/))
- Points for activity also reward clicking through rather than understanding, which you have ruled out for OPS.

A daily puzzle already gives people a reason to return. A gentle weekly goal is enough on top of that.

### 8. Competitions and seasons

- **Wharton Global High School Investment Competition.**
  - Free, for teams of four to six students with a teacher advisor.
  - Runs from late September to early December.
  - Teams submit an investment policy statement (a written set of goals and rules for the money) and a final report.
  - Judges weigh strategy, fit to the client, research and communication, not returns.
  - Thousands of students took part in the 2025–26 season.

  ([About the competition](https://globalyouth.wharton.upenn.edu/investment-competition/about), [2026 season](https://globalyouth.wharton.upenn.edu/news/a-winning-season-thousands-of-teams-bigger-stakes-and-the-top-50-2026-investment-competition-teams-revealed/))
- **High School Fed Challenge.** Run by the Federal Reserve, it has teams write a paper on an economics theme. It has been open to teams nationwide since 2025. ([Federal Reserve](https://www.federalreserve.gov/aboutthefed/educational-tools/national-high-school-fed-challenge.htm))

**For OPS:** students in these competitions need what Studio already does. They read company reports, keep evidence, set goals and limits, and explain their choices. A guide that maps OPS tools to what these competitions ask for would reach motivated students and their advisors. It must not suggest any affiliation.

### 9. Personality quizzes

16Personalities and BuzzFeed quizzes spread because the result describes you, and it's fun to post. There are no reliable usage figures. *Pattern.*

**For OPS:** OPS already has a placement quiz at `/start`. A made-up "investor personality type" would break OPS's source rules. The honest version would be a published risk-tolerance questionnaire. This is low priority.

## What not to copy

- **Celebrating trading or gains.**
  - What happened: Massachusetts cited Robinhood's confetti, digital scratch tickets, push notifications and "most popular" lists as game features that encouraged frequent trading. In January 2024, Robinhood paid $7.5 million and agreed to drop celebratory imagery for Massachusetts accounts. ([WealthManagement.com](https://www.wealthmanagement.com/regulation-compliance/robinhood-pays-75m-settle-massachusetts-gamification-charge)) In 2021, the SEC asked for public comment on these "digital engagement practices". ([SEC](https://www.sec.gov/news/press-release/2021-167))
  - For OPS: reward a well-supported answer, never risk-taking or a simulated gain.
- **Feeding fear of missing out.**
  - What happened: in a 2023 FINRA Foundation and CFA Institute survey of investors aged 18 to 25, 48% learned about investing from social media. Half said they had made an investment because of fear of missing out. ([FINRA](https://www.finra.org/media-center/newsreleases/2023/finra-foundation-cfa-institute-research-focuses-gen-z-investors))
  - For OPS: "most popular stock today" hooks would teach the opposite of what OPS teaches.
- **Pressure on teenagers.** This means streak-loss warnings, late-night reminders and endless feeds. See the children's code above.
- **Collecting children's data without the right consent.**
  - The rule: COPPA, the US children's privacy law, covers under-13s, and its amended rule applied in full from April 2026. ([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)) The FTC says a school can consent for students only for educational use. It also says that decision should sit with the school or district "rather than delegating that decision to the teacher". ([FTC COPPA FAQ, section N](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions))
  - For OPS: aim class features at students 13 and older, collect as little as possible, and expect some districts to ask for a signed data privacy agreement. Get legal advice before launching class accounts.

## Where OPS stands today

Checked against `main` on 3 November 2026.

| Already there | Missing |
| --- | --- |
| Lessons and Studio work without an account; accounts are optional. | Every shared OPS link shows the same preview: "Investing Studio", one sentence, no image. A lesson link doesn't say what the lesson is. |
| 75 public lessons, all listed for search engines. | There's no way to send a lesson to a class or see who finished. |
| Company reports for any company filing with the SEC: search, sections, kept passages. | Work can leave only as a backup file. There's no share link. |
| Seven figures per company read from SEC data (revenue, operating profit, pretax profit, tax, debt, equity and cash), plus revenue by segment. | There's no daily or weekly activity. |
| A placement quiz at `/start`. | Analytics count page views only, so we can't tell which feature brings a learner in or keeps them. |

None of the plan below depends on the unmerged Portfolio rebuild.

## The plan

Sizes are relative: **small** is a few days of work, **medium** a few weeks, **large** more than that.

### 0. Groundwork: proper link previews and share buttons (small)

**What changes:** when someone posts an OPS lesson link in a group chat, a story or Google Classroom, the preview shows the lesson's name, the question it answers and a picture of its main interaction. Every lesson also gets a share button that opens the phone's own share menu, plus Google's "Share to Classroom" button.

**Why first:** every idea below depends on links being shared, and today every OPS link looks the same. Teens are mostly on YouTube (about 90%), TikTok (63%), Instagram (61%) and Snapchat (55%) ([Pew Research, 2025](https://www.pewresearch.org/short-reads/2025/07/10/10-facts-about-teens-and-social-media/)), so previews need a tall image that works in a story, as well as a normal link card.

**How we'd know:** count visits that arrive from shared links. Put no personal information in the link.

### 1. Daily company puzzle (medium)

**What a student does:**
1. Each day one real public company is hidden.
2. Clues appear one at a time, all from its latest annual report: where its revenue comes from, how big it is, how much it keeps from each dollar of sales, what it owes, and a line from its own description of its business with the name removed.
3. The student guesses in as few clues as they can.
4. Afterwards they see the answer and a button that opens that exact passage in OPS's company reports.

**What they can share:** "OPS daily #12: solved with 3 of 6 clues", with a row of squares and no company name.

**Why it fits OPS:**
- It teaches reading a real report.
- It works across many companies, not one example.
- Every number is traceable to a filing.
- The answer leads straight into Studio.
- It doubles as a class warm-up, which teachers already use (FinCap Friday above). Past puzzles stay playable, so a class can do last Tuesday's.

**Rules it must follow:**
- Every term in a clue is explained in one plain sentence where it appears, or links to the lesson that teaches it.
- Every number is checked against the filing.
- No stock prices, returns or "hot stock" framing.
- Everyone gets the same puzzle each day.
- No streak that can be lost. Show "solved this month" instead.

**What already exists:** company search, the seven figures, revenue by segment, and report sections such as the business description and risk factors.

**Decisions for you:** hand-pick and review each day's company (safer and slower), or pick automatically and review the queue weekly. Also, how hard the puzzle should be.

**How we'd know:** daily players, the share of players who post a result, the share who open the report after the answer, and players who return within a week.

### 2. Teacher kit, in two steps

**Step A, teacher page (small, no accounts needed):**
- A "For teachers" page listing what each lesson teaches, how long it takes and what students do.
- Short teacher notes with the answers and the reasoning behind them.
- The Classroom share button on every lesson.

Say which standard or AP unit a lesson relates to only after someone checks it. "Related to" is honest. "Aligned to" is a claim.

**Step B, class codes (large):**
- A teacher creates a class, and students join with a code and a first name or nickname. No student email is needed, the way students join a Kahoot.
- The teacher sees who finished which lessons and puzzles.
- Data is deleted at the end of the term.
- Do the privacy review and legal check before building.

**Why:** this is the largest route to students. Kahoot, NGPF and the Stock Market Game all reached students through teachers.

**How we'd know:** classes created, students per class, lessons finished per class, and teachers who create a second class. The last is the clearest sign that teachers are recommending OPS to each other.

### 3. Share your work by link (medium)

**What a student does:** from an investigation, a valuation or a plan, they click "Share a view-only link". Anyone with the link sees the work, including kept passages with their sources, the assumptions and the reasoning, plus a button to "start your own analysis of this company". The student can switch the link off.

**What it needs:** a copy stored on OPS's server, since accounts already exist. Links should be unlisted with no real names by default.

**Uses:** handing in assignments, club pitches and competition teams. This is also what makes step 2B useful.

**How we'd know:** links created, views per link, and viewers who start their own.

### 4. Company pages for search (medium, then grow)

**What a person finds:** someone searching "how does Costco make money" lands on an OPS page that shows:
- revenue by segment from the latest annual report
- how much the company keeps from each dollar of sales
- its debt and cash
- two short passages from its own description of the business

Each item links to its source, and a button says "Investigate Costco in OPS".

**Rules:**
- Only include companies whose data reads cleanly.
- Label the reporting period.
- Update the page when a new report is filed.
- Add plain explanation, not just numbers.

Start with 50–100 companies students are likely to search for, and expand only if those pages bring visitors.

**How we'd know:** search visits per page, and visitors who open the company in Studio.

### 5. Competition prep, then an OPS challenge (medium, then large)

**First:** a guide called "Preparing for an investment competition". It maps what competitions like Wharton's ask for to OPS tools:
- written goals and rules for the money → Goals and the plan page
- research → company reports and kept passages
- a final report → a shared link or export

The guide must not suggest any affiliation.

**Later:** team workspaces built on step 3. After that, possibly OPS's own spring challenge: "make the case for or against one company, with evidence", judged on reasoning and entered through a teacher advisor.

**How we'd know:** teams and advisors who use the guide or sign up.

### 6. End-of-semester recap (small, once there is usage)

**What a student gets:** each December and May, a "your semester in OPS" image sized for stories, showing:
- lessons finished
- companies investigated
- the passage they kept most often
- puzzles solved

**The rule:** never show portfolio returns as an achievement.

### 7. Gentle weekly goal (small, optional)

**What a student sets:** a goal such as "three activities this week", shown on a calendar.

**Rules:**
- No loss messages.
- Reminders only by email, only for account holders who opt in, and never late at night.

Decide on this only after the daily puzzle shows whether people come back on their own.

### Not recommended

- Leaderboards that rank activity.
- Streak-loss warnings.
- Confetti for simulated gains.
- "Most popular stocks" lists.
- Paid referral rewards.
- An invented "investor personality type".

Each one either rewards the wrong behavior, matches a practice regulators have objected to, or breaks OPS's source rules.

## Suggested order

| Order | Feature | Size | Why this position |
| --- | --- | --- | --- |
| 1 | Link previews and share buttons | Small | Everything else depends on links being worth sharing. |
| 1, alongside | Basic measurement | Small | Count shares, arrivals from shared links, puzzle and lesson completions. No ad trackers and no personal data. Without it we can't tell what works. |
| 2 | Daily company puzzle | Medium | Most visible. It reuses data OPS already reads and tests whether sharing works. |
| 3 | Teacher page and Classroom button | Small | Opens the largest route to students without accounts or new privacy risk. |
| 4 | Share your work by link | Medium | Needed for class submissions and competition teams. |
| 5 | Class codes | Large | The biggest step, but it needs the privacy review first. |
| 6 | Company pages for search | Medium | Slow to pay off. Start small and expand on evidence. |
| 7 | Competition prep, then team workspaces and an OPS challenge | Medium, then large | Builds on steps 4 and 5. |
| 8 | Semester recap | Small | Once students have a semester of work, for example May 2027. |

## Decisions that are yours

1. **Who is the main audience: high school (including 13- and 14-year-olds), college, or both?** This decides how careful the class and sharing features must be.
2. **Daily puzzle or teacher kit first?** The plan puts the puzzle first because it needs no new privacy work. The teacher kit reaches more students per teacher.
3. **Is it acceptable to store students' shared work and class progress on OPS's server?** Today work stays in the browser. Sharing and classes both need storage, and the privacy page would need updating.
4. **Should OPS ever run its own competition?** It needs rules, judges, a timeline and possibly prizes.

## Sources

**Growth patterns:** [Duolingo streaks](https://blog.duolingo.com/improving-the-streak) · [Duolingo sign-up test](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker) · [Wordle (NYT via Boston.com)](https://www.boston.com/news/national-news/2022/01/04/he-made-wordle-for-his-partner-now-its-an-online-hit/) · [Advent of Code 2024 stats](https://adventofcode.com/2024/stats) · [Chess.com puzzles](https://support.chess.com/article/286-how-do-puzzles-work) · [Financhle](https://www.producthunt.com/products/financhle-the-wordle-of-finance/launches) · [Ticker League](https://tickerleague.com/games/daily) · [Spotify Wrapped downloads (Fortune)](https://fortune.com/2019/12/11/spotify-wrapped-playlist-app-download) · [Strava Year in Sport](https://cyclingweekly.com/news/product-news/strava-launches-my-year-in-sport-video-showing-your-key-stats-from-2017-364094) · [Figma S-1](https://www.sec.gov/Archives/edgar/data/1579878/000162828025033742/figma-sx1.htm) · [Dropbox referrals (TidBITS)](https://tidbits.com/2012/04/04/dropbox-referral-bonuses-doubled-to-500-mb-retroactively/) · [Zapier and Wise search pages (Backlinko)](https://backlinko.com/programmatic-seo) · [Quizlet (Latka)](https://getlatka.com/companies/quizlet/interviews/quizlet-matthew-glotzbach)

**Schools and students:** [Kahoot 2017](https://kahoot.com/blog/2017/03/06/kahoot-reaches-1-billion-players/) · [NGPF 2026](https://www.ngpf.org/blog/press-releases/ngpf-and-fico-launch-documentary-roadshow-to-advance-access-to-personal-finance-education/) · [FinCap Friday](https://www.ngpf.org/blog/fincap-friday/3-ways-to-use-fincap-friday/) · [Stock Market Game](https://www2.sifma.org/Education/SIFMA-Foundation/Stock-Market-Game%E2%84%A2/) · [AP Business with Personal Finance](https://apcentral.collegeboard.org/courses/ap-business-personal-finance/about) · [College Board launch page](https://go.collegeboard.org/introducing-ap-business) · [DECA on the AP course](https://www.decadirect.org/articles/bring-ap-business-with-personal-finance-to-your-school-in-fall-2026) · [Share to Classroom](https://developers.google.com/workspace/classroom/guides/sharebutton) · [Wharton competition](https://globalyouth.wharton.upenn.edu/investment-competition/about) · [Wharton 2026 season](https://globalyouth.wharton.upenn.edu/news/a-winning-season-thousands-of-teams-bigger-stakes-and-the-top-50-2026-investment-competition-teams-revealed/) · [Fed Challenge](https://www.federalreserve.gov/aboutthefed/educational-tools/national-high-school-fed-challenge.htm) · [Pew teens and social media](https://www.pewresearch.org/short-reads/2025/07/10/10-facts-about-teens-and-social-media/)

**Risks and rules:** [Robinhood settlement](https://www.wealthmanagement.com/regulation-compliance/robinhood-pays-75m-settle-massachusetts-gamification-charge) · [SEC on digital engagement practices](https://www.sec.gov/news/press-release/2021-167) · [FINRA and CFA Gen Z study](https://www.finra.org/media-center/newsreleases/2023/finra-foundation-cfa-institute-research-focuses-gen-z-investors) · [ICO children's code, standard 5](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/5-detrimental-use-of-data/) · [COPPA amended rule](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule) · [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions) · [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
