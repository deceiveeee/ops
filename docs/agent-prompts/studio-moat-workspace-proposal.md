# Proposal for Claude: a Studio workspace organized around investment reasoning

Prepared 2026-09-06 for Open Portfolio Studio.

## 1. Assignment and status

The user liked the proposed workspace and specifically approved making Morgan Stanley's
*Measuring the Moat* the organizing framework for company research. Their latest instruction
to Codex was: **"wait you only design. Send a proposal to claude."**

This document is that design proposal. Codex is handing over design, not implementing the
application in this task. Treat the detailed choices below as recommendations within the
accepted direction, not as additional user instructions quoted verbatim. Follow the user's
direction for implementation; this document does not authorize commits, pushes, or publishing.

Read alongside:

- `AGENTS.md` and `CLAUDE.md` for repository rules.
- `docs/agent-prompts/studio-research-workspace-handoff.md` for the complete product scope,
  F1–F10 requirements, quantitative methods, and milestone definitions.
- `docs/agent-prompts/studio-workspace-design.md` for Claude's earlier workspace proposal.
- `docs/implementation-notes/studio-research-workspace-progress.md` and the source audits
  for what is actually implemented and verified. Reinspect the working tree first.

The earlier workspace proposal is preserved unchanged. This proposal develops the accepted
design and corrects two ambiguities in it:

1. A source rail is one part of a self-contained research environment. Data coverage,
   analytical tools, comparable inputs, and teaching must also exist inside Studio.
2. A shell with research panels cannot pass the complete Atkore journey while screening,
   valuation, and company comparisons remain in later phases. Distinguish a usable workspace
   integration from a complete stock investigation and from a publication-ready Studio.

## 2. Intended result

A user should be able to arrive with a financial goal, investigate investments, build and
test portfolio alternatives, choose one with reasons, and revisit it later using work saved
inside Studio. Investment Foundations completion is not required.

The product's unit of work is a **question under investigation**. A question connects an
observation to possible explanations, evidence, assumptions, and a decision. These connections
must survive navigation, refresh, rejection of an investment, and removal of a holding.

Examples of connected work:

- A financial trend opens a business question.
- A filing passage supports one explanation and challenges another.
- The user's explanation informs a forward assumption.
- A valuation scenario uses that assumption.
- A portfolio alternative references the investigation and scenario.
- A changed input identifies which saved conclusions deserve review.

Automate retrieval, arithmetic, and bookkeeping. Keep investment judgment with the user.

## 3. Source and scope of the framework

Primary authority: Michael J. Mauboussin and Dan Callahan, *Measuring the Moat: Assessing the
Magnitude and Sustainability of Value Creation*, Counterpoint Global, **October 15, 2024**.
The currently served PDF has a 2025 copyright footer; that footer is not the publication date.

- Canonical PDF: https://www.morganstanley.com/im/publication/insights/articles/article_measuringthemoat.pdf
- Particularly relevant: introduction pp. 1–6; industry pp. 13–39; firm analysis pp. 40–55;
  government and firm interaction pp. 56–62; brands pp. 63–64; checklist pp. 67–69.

The central financial relationship is return above the cost of capital, the amount that can
be invested at that return, and its persistence. The paper connects industry and company
analysis to expectations in the market price. Use its checklist as the coverage authority;
the UI architecture, examples, saved records, and interactions below are OPS adaptations.

Do not label Studio endorsed by Morgan Stanley. Do not present an OPS calculation convention,
synthetic example, ranking, or interface label as a method prescribed by the paper. Map claims
to the actual reviewed edition before implementing their explanations.

Use this framework for company research. IF supplies the broader investment and portfolio
foundations. Bond, fund, and portfolio analysis require their own appropriate methods.

## 4. Workspace navigation and the returning-user experience

Keep five directly accessible work areas, plus a project home:

| Destination | Main work | Useful saved result |
| --- | --- | --- |
| Your work | Resume an investigation; find earlier and rejected research; inspect changes needing review | A persistent thread of work |
| Goal and limits | Describe purpose, dated cash needs, available money, constraints, and loss capacity/willingness | A goal against which portfolios can be tested |
| Find investments | Explore an industry, inspect a screen, compare candidates, start an investigation | Reasons to investigate or exclude candidates |
| Investigate | Develop evidence-backed company, bond, or fund conclusions | Research independent of holdings |
| Compare portfolios | Create, copy, test, and compare named alternatives | A reasoned choice and preserved alternatives |
| Review and rules | Revisit changed evidence, manage operating rules, prepare a dated buying worksheet | A review decision with reasons and a complete export |

These are destinations, not compulsory steps. Opening a company directly is allowed.
Suggest earlier work when it would answer a live question; explain the connection.

Home should contain a compact goal summary, a suggested continuation with its reason, and
the investigation list. Show search/status filtering when the list needs it. Include rejected
and unheld candidates. A review item names its cause. Avoid totals that have no decision
attached to them and percentage-complete indicators for subjective research.

Recommended default: a new visitor opens practice mode with a clearly identified example
goal and no fabricated personal research. Personal work is a distinct saved project. Remember
the last opened mode and preserve legacy personal work during migration.

## 5. The investigation screen

### Desktop

- Compact project/navigation column on the left, approximately 170–190px.
- Candidate identity and historical research date above the active work.
- One dominant research tool in the center. The working question provides the heading.
- Evidence/explanation column beside it, approximately 300–340px when space permits.
- Persistent save status and a compact route to backup/recovery.

Keep the current investigation and the selected portfolio alternative separate in the chrome.
Adding a stock to an alternative does not mean its research is settled.

The evidence column has distinct views for the source, its meaning, and attachment to a
specific explanation. A number opens its calculation inputs and source. A passage opens the
relevant reviewed text. The user can expand the reader into the main work area for sustained
reading and return to the same analysis without losing their place.

### Mobile and intermediate widths

Use **Work / Evidence / Explanation** as deliberate panel switches when a side rail would
cramp the work. Keep the selected company, question, scroll position, and unsaved text in each
panel. Do not stack three desktop columns into a long page or shrink a filing into a tiny
nested scrolling window. Use a compact work-area selector when navigation consumes too much
height. Essential actions must remain available without hovering.

Use OPS's Inter/Fraunces typography and restrained dark finance aesthetic. Motion should show
selection, calculation, or a causal change; ordinary research needs quiet reading surfaces.
Measure the screen budget at all six required widths, including open evidence and edit states.

## 6. Map the moat research into actual tools

The exact grouping can change after usability testing. Every group below must have a clear
destination; do not replace the framework with a generic business description and three notes.

| Research group | Main question for the user | Proposed interaction and output |
| --- | --- | --- |
| Industry | Where does this company sit, and where does the money go? | Select participants in an industry map. Inspect relationships, dated financial comparisons, and the market definition. Save a relationship and its evidence. |
| Competition | What constrains returns in this market? | Select a competitive force; compare a possible mechanism with source material and an alternative explanation. Save the mechanism, evidence, and unresolved issue. |
| Business advantage | What does this company do differently? | Compare activities with peers. Use a worked value-stick example, then connect the claimed difference to company evidence. Save an explicit causal explanation. |
| Returns and capital | Do the financial results fit that explanation? | Inspect consistent historical calculations and their inputs; relate margins and capital use to the proposed advantage. Save a diagnosis with accounting limitations. |
| Durability | What could weaken the explanation, and when? | Compare threat scenarios and historical context. Record conditions that would change the conclusion and an assumption about persistence. |
| Price expectations | What performance does the price require? | Compare forward scenarios and price-implied expectations under disclosed conventions. Link each material assumption to earlier research. Save the scenario and the reason it is plausible. |
| My reasoning | What conclusion follows, and what remains open? | Review supporting/challenging evidence, assumptions, and uncertainty. Shortlist, reject, or continue investigating without erasing anything. |

Coverage mapping should explicitly include the paper's industry map, profit pool, share
instability, concentration, structure, five forces, barriers to entry, disruption,
dis-integration, value chain, value stick, government, firm interaction, and brands.
Define and gloss its terminology where used. Retain the source's labels in the method guide
even when the primary navigation uses plain language.

### Important design details

**Industry map:** Clicking a supplier, producer, distributor, or customer should open a
relationship worth investigating. A market-share table needs a defensible market boundary.
An SEC registrant sample is not automatically the complete economic market. Make missing
private/foreign participants and product-mix differences visible. A profit-pool view must
say which profit measure it uses and what participants it covers.

**Competition:** Offer concrete investigations into suppliers, customers, substitutes,
entrants, and existing rivals. A possible explanation should name how it changes prices,
costs, capital needs, or investment opportunities. Show what evidence would challenge it.
Avoid five empty boxes asking a beginner to invent a Five Forces analysis.

**Value stick:** Begin with a labeled OPS example. Let the learner change one economic event,
such as improving the customer's benefit or reducing a supplier's operating burden, and see
the affected relationship. Separate willingness to pay from the actual selling price, and
willingness to sell from the actual input cost. Do not require dollar estimates of either
willingness for a real company when the evidence cannot establish them.

**Returns and capital:** A high margin is an observation to investigate. Show return on
invested capital (expanded and explained), its inputs, and the relevant cost-of-capital
assumption. Do not substitute a fixed 8% classification threshold for a company-specific
financing hurdle. Accounting adjustments, excluded leases, period alignment, and sector
exceptions must be inspectable. Financial statement amounts and derived ratios need different
labels. A ratio pattern may suggest a question about advantage; it cannot certify a moat.

**Durability:** Have the user connect threats to the particular advantage being claimed.
Keep company-specific evidence distinct from historical reference patterns. Saving a shorter
period of advantage should make the dependent valuation visibly require review.

**Price expectations:** Teach a worked model before asking for inputs. Then provide reviewed
company history and peer context. Support precise numeric entry, meaningful sensitivities,
and saved assumption rationales. A worked example must remain separate from a company
valuation. A production company result needs its dated price, cash-flow model, financing
conventions, reinvestment assumptions, and treatment of the period after the forecast.

**Conclusion:** Preserve the learner's wording. Distinguish “evidence attached” from “the
conclusion is correct.” No automatic moat grade, recommendation, green completion tick, or
promotion into the chosen portfolio should result from filling fields.

## 7. One complete interaction to build first

Use Atkore as the first company investigation, as specified by the original handoff. Choose
one consistent historical information date and reviewed source set. The preview's figures,
filing passage, portfolio weights, and conclusions were illustrative and must not be copied
into a real-company surface.

The intended interaction is:

1. Enter through the industry view or open the company directly.
2. Inspect a dated profitability trend. Select a period to open the source inputs.
3. Compare possible explanations such as pricing, volume, costs, and unusual charges.
4. Open the relevant in-app filing passages and comparisons. Attribute management claims
   to management; do not turn them into independently established facts.
5. Attach evidence to a named explanation as supporting, challenging, or contextual.
6. Record the explanation the user currently finds plausible and what remains unresolved.
7. Use that reasoning to create a forward scenario. Compare what changes if the advantage
   weakens earlier or requires more investment to sustain.
8. Compare at least two defensible company alternatives under comparable conventions.
9. Save a conclusion and, if desired, try the investment in a portfolio alternative.
10. Reopen the project, change an upstream assumption, and inspect the resulting review flag.
    Earlier reasoning and results remain accessible.

A conditional example of the intended logic: if the reviewed data show stable volumes while
selling prices decline, that evidence can challenge a simple demand-volume explanation. It
still does not establish a normal future margin. The interface must preserve that distinction.

The full section 9 acceptance journey in the original handoff remains authoritative. A user
should not need an outside website for an essential input to this supported investigation.

## 8. Evidence and input contracts

| Type | Presentation | What must be preserved |
| --- | --- | --- |
| Reported fact | Read-only, with date, units, and source | Document identity, location, period, reporting basis, dataset version |
| Calculated result | Explicitly labeled as a calculation; inputs inspectable | Formula/method version, exact input references, missing-data treatment |
| User assumption | Editable beside informing evidence and an explanation of its effect | Value, units, scenario, rationale, evidence references, revision |
| User judgment | Learner-authored wording, with evidence and open questions | Verbatim reasoning, evidence roles, decision status, prior versions |

An evidence attachment should identify the source location, the specific explanation it
addresses, its role, the user's note, and the source snapshot used. A source can support one
explanation and challenge another. These are separate attachments, not contradictory labels
on one global source record.

Keep research interpretation separate from editing source data. A correction to a reviewed
dataset creates a new revision with an explanation; it never silently edits a filed number
inside an investigation. Source dates remain visible when an older snapshot is retained.

## 9. Saved work and dependency behavior

Use the existing v2 session/storage layer as the persistence foundation. Inspect its actual
contracts before wiring the UI. The current calculation bridge is a view of a selected
alternative, not a replacement serialization format for the project.

The model will need structured owners for:

- Industry scope and company/relationship comparisons.
- Research questions and competing explanations.
- Evidence attachments with source revisions.
- Company research findings and their historical versions.
- Assumption sets and valuation scenarios, with methods and dates.
- Portfolio alternatives and explicit selection decisions.
- Dependency references and review acknowledgments.

Choose a deliberate schema/migration strategy. Do not hide structured research in a single
textarea, overload unrelated fields, or discard unknown records to make an import succeed.
Preserve the original v1 data and provide full-project JSON backups. Readable exports must
include alternatives, rejected research, sources, assumptions, and open questions. CSV should
be clearly scoped to the named portfolio it describes.

Dependency behavior example:

- Valuation V1 depends on assumption A1 and evidence snapshot E1.
- A revised interpretation produces A2.
- Keep V1 and the earlier conclusion unchanged. Mark the dependent valuation for review,
  naming A1 → A2 and the changed assumption.
- Let the user rerun or explicitly retain the earlier basis with a reason.
- A portfolio depending on V1 can then display the specific upstream review issue.

Do not mark unrelated research stale. Do not silently replace a selected allocation. A
changed timestamp alone is insufficient evidence that every downstream decision changed.

Expose loading, saving, saved, unsaved, conflict, and blocked states truthfully. Provide
retry, draft download, deliberate reload, full import, and recoverable prior versions.
Protect pending/unsaved work when switching modes or leaving the workspace. Separate practice
and personal projects and avoid an empty-looking replacement when stored content is unreadable.

## 10. Portfolio, bond, and fund integration

The company framework feeds portfolio construction without replacing it. Keep the original
scope for manual allocations, reference cases, quantitative methods, scenarios, simulation,
buying, and reviews. An advanced tool is optional for a learner; it remains in the agreed
product roadmap unless the user changes that scope.

Compare alternatives using the same dated input conventions. Preserve the inputs and
diagnostics behind each result. Show concentration, overlapping issuers, cost, risk, and goal
fit alongside modeled return. A more attractive result must not silently become the selection.

Individual bonds need issue terms, issuer credit work where relevant, cash-flow timing,
yield/price relationships, and rate/credit risk. Funds need mandate, implementation, holdings,
costs, exposures, and tracking considerations. Use appropriate investigation tools for each;
do not ask a Treasury note to complete a company-moat checklist.

Foreign stocks need distinct company domicile, trading currency, reporting currency, listing
structure, and applicable source coverage. Their place in the workspace should be explicit.

## 11. Recommended build sequence and truthful checkpoints

| Checkpoint | Deliverable | What it does not establish |
| --- | --- | --- |
| Workspace integration | Free navigation, worklist, visible saving/recovery, independent research and alternatives, existing goal/portfolio/rules functionality retained | A complete company analysis or publication readiness |
| Complete company investigation | One sourced Atkore journey including industry/peer context, evidence, advantage, durability, valuation, conclusion, and revisit | General coverage for every investment |
| Generalize supported research | Repeatable company coverage and instrument-specific bond, fund, and foreign-stock paths | Completion of advanced portfolio modeling |
| Complete portfolio workflow | Supported mixed portfolios, comparison, testing, buying, reviews, full output, and the advanced methods in the master handoff | Permission to publish or skip release gates |

Keep these checkpoints aligned with M0–M8 in the master handoff. Do not redefine a checkpoint
to hide missing work. Integrate existing arithmetic and useful goal/rule content without
preserving the wizard's six-step navigation or scattering disconnected tools across routes.

## 12. Acceptance criteria for the design in implementation

### Research and learning

- The learner can explain why an investment entered the shortlist, what evidence supports
  the proposed advantage, what challenges it, and how that affects forward assumptions.
- Each unfamiliar method has an accessible explanation and a worked example before inputs
  are requested. Explanations can always be reopened without a course prerequisite.
- Company facts and numerical examples are independently checked against the reviewed source
  edition. The full checklist has a coverage matrix, including topics the first prototype
  has not yet implemented.
- Every essential fact in the supported journey is available inside Studio, with its source
  and limits. Missing evidence produces an honest unresolved state rather than an invented value.

### Persistence and dependencies

- Research survives removal/rejection, refresh, backup export/import, and alternative changes.
- Rapid typing and queued saves do not lose or reorder text. Failed saves retain the draft.
- Two tabs cannot silently overwrite each other. The user can export the conflicting draft.
- Restoring/resetting has recoverable prior versions; unsupported schemas remain preserved.
- Changing one upstream assumption identifies affected saved work and explains the cause.
- The readable export and full backup agree with the explicitly identified saved/draft snapshot.

### Interaction and visual quality

- At 390, 768, 1024, 1280, 1440, and 1920px, the central work stays usable and the screen budget
  is measured, including evidence, reasoning, validation, and conflict states.
- Mobile deliberately switches work/evidence/explanation instead of stacking a long form.
- Keyboard navigation, focus, reduced motion, source-reader safety, console state, and theme
  behavior are verified separately from screenshots and numerical tests.
- No button is decorative or silently inert. No research completion percentage or unexplained
  score substitutes for a supported decision.

Record actual evidence and unresolved issues in the implementation ledger. Deliver the
workspace as a connected research process; the visual shell is there to make that process
usable over repeated sessions.
