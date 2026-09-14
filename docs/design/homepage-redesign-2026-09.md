# Homepage: your money, your move

Implemented September 13, 2026. Scope: the homepage, its isolated styles, one original teaching experiment, and homepage browser regression checks. Existing shared teaching charts and other uncommitted work are retained.

## Direction and references

The user asked for a more distinctive homepage for a mainly teenage audience, using Apple and Awsmd as references. The design uses large editorial typography, tactile financial objects, contrasting chapter backgrounds, and a working experiment before the longer explanations. The light visual identity continues; the dark report chapter provides a deliberate change of emphasis.

References inspected as rendered pages:

- [Apple](https://www.apple.com/): a dominant visual object, short copy, clear primary and secondary actions, and generous space.
- [Apple Human Interface Guidelines: Motion](https://developer.apple.com/design/human-interface-guidelines/motion): motion should communicate feedback, remain brief, and be optional. The homepage has no autoplay video or scroll hijacking. Its financial graphic reacts to the selected duration; reduced motion removes transitions and entrance effects.
- [Awsmd](https://awsmd.com/): oversized type, sculptural objects, expressive changes of scale and section composition. The reference's embedded showreel required Vimeo sign-in; only its public page composition was reviewed.
- [Linear](https://linear.app/): a clear hierarchy and product visuals that explain the offering.
- [Brilliant](https://brilliant.org/): an approachable invitation to learn, paired with an immediately visible demonstration.

These are design references, not evidence that this redesign will lower bounce rate. No outside imagery, logos, customer counts or testimonials were copied. All visual artwork is local SVG/CSS.

## The experience

1. **Your money. Your move.** Courses and Studio are reachable immediately. The visitor can compare one, five and ten years in a hypothetical compounding example.
2. **Make the connection.** The existing, sourced Federal Reserve history remains dated 2022–2024. Its source link and all three milestone values remain available.
3. **Follow the evidence.** The Atkore statement remains selectable, with the reported values, impairment context and original filing link intact. A hidden sizing layer continues to prevent the note from shifting the page.
4. **Make it yours.** Two illustrated learning paths lead to the existing courses, followed by a Studio entry and the starting-point route.

## Numerical and accessibility details

The compounding example is an original OPS illustration: $100 × 1.05^n, annually compounded. It gives $105.00 after one year, $127.63 after five and $162.89 after ten. Assumptions and the possibility of negative actual investment returns appear in the calculation disclosure. The user requested removal of the standalone forecast and investment-recommendation captions on September 14; those two lines were removed. No real market price or return is implied.

Both graphic columns use a zero baseline and the same dollar scale. Duration buttons have pressed states and keyboard support. A polite, atomic status announces the result. Decorative course artwork is hidden from assistive technology. Typography and color remain readable without animation.

## How to evaluate engagement

After a separate release, compare mobile visits with the previous period: first experiment interaction, course/Studio click-through, and continuation into a lesson or research session. Read bounce rate alongside these outcomes and page performance. A longer page or more animation alone is not a success metric. This implementation introduces no additional tracking service.

## Review and scope

The existing source-based charts, global refresh stylesheet, course edits, and unrelated local settings were present before this redesign. The homepage uses a CSS module to keep new visual rules out of those other surfaces. The original homepage and existing browser spec were backed up in the ignored `tmp/homepage-redesign/` directory before edits.

Production screenshots and test reports are generated into ignored artifact directories. Run `OPS_CAPTURE_URL=/ OPS_CAPTURE_NAME=home-redesign npx playwright test` with a free `PORT`, after stopping any development server that uses the same `.next` output.

## Verification — September 14, 2026

After the requested caption removals, the full production browser suite passed **130 tests**, with three optional tests skipped. The unit suite passed **765 tests in 59 files**. Both suites ran against an export of the exact staged commit in `tmp/homepage-redesign/release`, including only the homepage changes and their required chart dependencies.

The earlier design review used an isolated copy under `tmp/homepage-redesign/review` because other tasks were building and editing the shared checkout. Before committing, all ten staged files were hash-compared against the release export; all matched. The production build's TypeScript and lint checks passed. Only this verification record was updated afterward.

All six required widths were captured and visually inspected during the redesign. After the caption removals, all six were captured again and the 390px and 1440px release screenshots were read. Final screenshot evidence is in `.agent-shots/home-release-*.png`. The refreshed browser preview also confirms that neither removed caption is present.

| Width | Page height in 900px screens | Horizontal overflow | Nested scroll regions |
| --- | ---: | --- | --- |
| 390 | 6.44 | None | None |
| 768 | 6.06 | None | None |
| 1024 | 4.82 | None | None |
| 1280 | 4.99 | None | None |
| 1440 | 5.06 | None | None |
| 1920 | 5.06 | None | None |

The capture harness prints a 1.5-screen limit for every route. That lesson-step limit does not apply to this marketing homepage's scroll narrative.

Visual findings: no outstanding P0 or P1 defects found in the reviewed homepage states. Two P2 tablet heading-spacing defects were corrected: hiding a line break had joined “money” with “can” and “number” with “has.” Explicit word spaces now survive the tablet reflow. The final 768px image confirms both corrections. No further P2 defects were identified in the reviewed states.

The interaction checks cover 320, 390, 768, 900, 1024 and 1440px: every duration gives the expected result, changing duration or financial-statement line preserves document height and downstream section positions, keyboard activation works, reduced motion disables transitions, and navigation reaches its intended destinations. The native calculation disclosure remains available.

The local production capture reports two expected missing hosting-service scripts per page load: `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`. These existing Vercel integrations are unavailable under local `next start`; no homepage asset or application exception was identified. The audit did not validate deployed telemetry or measure a change in bounce rate.
