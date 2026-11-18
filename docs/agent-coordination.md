# Claude and Codex cooperation

Use one implementation owner and an independent reviewer for each change. The
roles can switch between tasks. Parallel implementation works best on separate
features with separate files; shared files need an explicit owner.

## Shared state across worktrees

The primary checkout on this machine is `C:/Open Portfolio Studio`. Keep current
task records in its `tmp/agent-coordination/` directory, which is already ignored
by Git. Every local worktree reads the same physical directory. Git worktrees
have separate copies of tracked documents, so a status file copied into each
branch would become stale independently.

Use one record per agent/task, such as `codex-portfolio-phone-review.md`. Update
only your own record. Read all current records before claiming a task and again
before editing shared files, starting a server, or integrating changes. Record
the actual state, including unknown ownership. These are advisory records, not
an enforced filesystem lock. Two simultaneous or conflicting claims must be
resolved before overlapping writes; continue independent work meanwhile.

## Startup

1. Inspect `git status --short`, the current branch/HEAD, and `git worktree list`.
   Preserve existing edits and untracked files.
2. Read the current task records in the primary checkout. Historical handoffs
   and inherited chat history help explain decisions but do not establish a
   live session's state or grant ownership today.
3. Record the bounded task, role, files to write, worktree, branch, starting
   revision, intended server port, and next action. Include the session ID when
   it is available; do not invent one.
4. Use a separate worktree and branch for concurrent implementation. Reuse a
   suitable checkout where possible. A reviewer may inspect an owner's tree
   but writes audit scripts and evidence in the reviewer's own scratch area.

## File and process ownership

- One implementation owner handles a given change. Another agent reviews the
  patch, checks calculations, tests learner journeys, or researches independent
  requirements. Findings go into its review record; they do not trigger silent
  edits in the owner's tree.
- Explicitly claim shared files, particularly `components/studio/stages.tsx`,
  `lib/studio.ts`, project schema/storage code, course/lesson registries,
  `lib/if-progress.ts`, and test/build configuration. Independent branches
  protect working files, but overlapping changes still need integration review.
- Preserve another agent's edits, dependencies, processes, and untracked work.
  Do not switch its branch, reset, clean, stash, reinstall shared dependencies,
  or stop its server as a way to clear a conflict.
- Give each serving worktree a free port, and record the absolute checkout and
  process ID after launch. Verify which checkout is actually being served.
  Only one build/server operation may write or rely on a checkout's `.next`
  directory at a time. Stop your own server before rebuilding and restart it
  afterward. Configure test output directories to avoid concurrent overwrites.
- Treat a quiet session or an old timestamp as unknown activity. Transfer work
  through an acknowledged handoff or the human's explicit reassignment; record
  the basis for the transfer. An incoming agent can keep reviewing while
  ownership is unclear.

## Evidence and handoff

Record the exact revision tested. For uncommitted work, preserve a patch and
identify the untracked source files too; a branch name alone does not identify
what passed. Include commands, checkout, relevant non-secret environment
settings, date, results/skips, screenshots, defects, and unresolved limits.

The outgoing owner records the remaining work and whether files/processes are
released. The incoming owner records its acceptance and scope before writing.
Use shared documents and commit/PR references for handoff when direct messaging
is unavailable. Do not claim to have notified another session merely by writing
a file. Sending messages to another chat still requires the human's authorization.

One named integration owner resolves overlap, checks the combined diff, and
runs checks affected by the integration. Follow the human's existing instructions
for commit, push, PR, merge, and publication; this protocol adds no approval gate
and grants no new authority.

## Task record template

```text
Updated: <date/time with timezone>
Agent/session: <agent and available session ID>
Task/role: <bounded task; implementation, review, or integration>
Status: <active, awaiting handoff, handed off, complete>
Worktree/branch: <absolute checkout; branch>
Revision: <HEAD; dirty patch/evidence reference when needed>
Owned writes: <exact files or bounded directories>
Read/review only: <another agent's working copy, if applicable>
Server: <port, PID, checkout; or none>
Evidence: <commands, results, screenshot/report paths>
Next action: <concrete action>
Handoff: <recipient, remaining work, release/acceptance evidence>
```

The 2026-08 handoffs in `docs/handoff-to-codex*.md` describe an earlier mission
split. Retain them as historical context, rather than current task assignments.
