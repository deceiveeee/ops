# Studio v2 storage and recovery

Implemented 2026-09-05 as the user's selected next task: durable saving, backups, and conflict handling. This is the v2 persistence layer and workspace adapter. `/studio` still consumes `useStudioPlan` and its v1 record. Switching the interface is a separate integration task; this work does not claim that the wizard has been rebuilt or that all of M2 is complete.

## Where the implementation lives

| File | Responsibility |
| --- | --- |
| `lib/studio-project/validate.ts` | Full v2 structural validation, references, nested fields, unique record identities, finite numbers, dates, and size contract. Reuses v1 validation for unchanged financial fields. |
| `lib/studio-project/migrate.ts` | Reads supported versions, validates v2 rather than casting it, and retains rejected raw input. Preserves the exact v1 text during migration. |
| `lib/studio-project/create.ts` | Fresh v2 project with no fabricated migration history; existing practice defaults are retained. |
| `lib/studio-project/backup.ts` | Validated JSON import/export. Database revision tokens never come from a backup. |
| `lib/studio-project/storage.ts` | Native IndexedDB adapter, atomic revision comparison/write, replacement recovery records, and advisory BroadcastChannel messages. |
| `lib/studio-project/session.ts` | Serialized edits, explicit saved/unsaved/conflict states, failed-save retry, legacy migration, and recovery operations. |
| `lib/use-studio-project.ts` | React adapter for the future workspace; focus/visibility checks and practice/personal state isolation. |
| `lib/studio-project/backup.test.ts` | Validation, migration preservation, and backup round-trip tests. |
| `e2e/studio-storage.spec.ts` | Real Chromium IndexedDB/transaction/channel tests on an isolated intercepted origin. |
| `playwright.storage.config.ts` | Runs storage tests without starting or building Next. |

## Data ownership

Database: `ops-studio-projects`, database version 1. This database version is separate from the project JSON's schema version 2.

- `projects`: one current project per mode (`practice`, `personal`), containing mode, a generated revision token, and validated project JSON.
- `recovery`: the previous saved project when an import or reset replaces it, with reason and archive date. Archiving and replacement share one transaction.
- Company filings and large market/source datasets are not stored in the user-project record.
- The original `ops-studio-portfolio-v1` localStorage value is read only when the selected mode has no v2 project. It is never deleted or rewritten. A legacy record in the other mode does not become the selected mode's project.

The backup limit is 10 MiB measured as UTF-8 bytes. Structural limits also bound investigations, alternatives, evidence, and decisions. Unknown quote/accrual values remain null. Financial fields are never coerced from strings, null, or nonfinite numbers. Partial research and unfinished allocations remain valid drafts.

The adapter stores current work plus import/reset recovery copies. It does not promise a full historical version for every keystroke or implement the source/model dependency graph. It does not prune recovery copies silently. Browser data can still be cleared by the user/browser, so downloadable backups remain necessary; there is no cloud synchronization in this layer.

## Saving and conflicts

A write takes the exact revision last read by the caller. The read of the current revision, comparison, optional archive, and replacement happen in one IndexedDB readwrite transaction. Only transaction completion reports success; a successful `put` event alone is insufficient. A conflict returns a failure without changing either record.

Two tabs initialized simultaneously converge on the first committed project. Subsequent competing edits from the same revision have one winner; the losing session retains its draft and old revision. It can export that draft, explicitly reload the newer saved version, and reapply the desired change. Retry never bypasses the revision check.

BroadcastChannel announces only a mode and revision. It does not transmit research text and never replaces a session's draft. The React adapter checks for changes again on focus/visibility for browsers without that channel. Notifications improve awareness; correctness does not depend on them.

Within one session, queued edits apply to the latest draft in sequence. A failed save retains the draft as `unsaved` or `conflict`, together with the last acknowledged saved project. A failed import/reset also retains its archive requirement for retry. A mutator that throws cannot partially alter the live draft because it receives a copy.

## Interface contract for integration

Use `useStudioProject(mode)` when the workspace has been adapted to v2 research ownership. The hook deliberately is not substituted beneath the v1 wizard's synchronous mutation API.

Always render the status alongside the data:

- `loading`: do not accept edits yet.
- `ready`, `dirty: false`: the project is acknowledged by storage. `externalChange` may still indicate a newer revision elsewhere.
- `saving`: the transaction has not completed; do not claim success.
- `unsaved`: the draft is available for export/retry but is not committed.
- `conflict`: another revision won. Keep the draft visible, offer its backup, and provide an explicit reload action.
- `blocked`: malformed, unsupported, or future saved content remains untouched. `recoveryRaw` contains the original text where readable.
- `unavailable`: storage could not be opened/read; do not substitute a pretend saved memory-only project.

Every mutation returns a result. Surface invalid-edit/import errors from that result even when the saved/draft state remains unchanged. An export result includes whether the exported draft was saved; a draft backup must not be labeled as the saved portfolio.

`reload()` refuses to discard dirty work. `reload(true)` is the explicit discard-and-reload action; the interface should first let the learner export their draft. `reset()` and `importBackup()` refuse to replace dirty drafts. Both archive the previous saved record before replacement and use the same revision check as an ordinary save. Cross-mode imports are refused; open the matching mode instead.

`recovery()` returns archived JSON for inspection/download or import through the same validated importer. It does not directly overwrite the current project. Unsupported current saved schemas block imports and resets as well as edits; they cannot be silently downgraded.

When integrating, switch the whole relevant owner/consumer set deliberately. The old wizard may still write v1 while the new adapter has a migrated v2 copy. This layer preserves both; it does not reconcile two independently edited schemas. Do not simultaneously present both as one synchronized plan.

## Verification

Run `npm run test:studio-storage` for the focused native-browser suite. It serves the real application TypeScript modules through Playwright route interception using the already-installed TypeScript compiler. It introduces no bundler or IndexedDB mock dependency, starts no dev server, and uses `https://ops-storage.test` in an isolated test browser context. It never touches the user's actual Studio origin or browser profile.

Thirteen cases cover:

1. Migration from the browser's legacy slot, exact original preservation, page reopen, and rejected research surviving position removal.
2. Competing independent tabs with notifications disabled: exactly one successful write and an exportable losing draft.
3. Ten rapid edits composing into ten changes rather than repeating the initial state.
4. A native transaction forced to abort after `put` succeeds: both replacement and recovery archive roll back.
5. Injected quota failure: saved data remains unchanged, draft exports as unsaved, and retry succeeds.
6. Failed import followed by retry preserves the old saved version; reset archives the imported version.
7. Invalid imports/future stored schemas cannot overwrite existing work, including through direct storage reset.
8. Separate practice/personal storage and cross-mode import refusal.
9. Real cross-tab notifications flag changes without replacing the draft.
10. Storage access failure has no false-ready state; closed adapters cannot save.
11. Simultaneous first opens converge on the same project/revision.
12. Unreadable legacy JSON remains recoverable and does not seed an empty replacement.
13. An edit that throws midway changes neither displayed nor saved research.

The quota case injects an explicit quota error at the adapter boundary; it does not claim to fill a real disk. The transaction-abort and concurrency cases use actual Chromium storage. Unit tests independently check rejected inputs and preserved fixture content. No financial formulas or datasets changed.

The first browser command was blocked by the filesystem/process sandbox (`spawn EPERM`) before any test executed. The same suite ran successfully with approved browser-process access; no test expectations were weakened. This is an environment failure, not an observed product failure.

Current evidence and any outstanding full-suite results belong in `studio-research-workspace-progress.md`.
