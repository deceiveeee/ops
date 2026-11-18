# Claude workspace instructions

Read `AGENTS.md` completely before taking action. It contains the repository's controlling
source-integrity, learner-sequence, design, accessibility, typography, animation, and
performance rules.

Before editing or starting a build/server, also read `docs/agent-coordination.md`
and the primary checkout's shared `tmp/agent-coordination/` records. On this
machine that checkout is `C:/Open Portfolio Studio`, including when this session
runs in a linked worktree. Record ownership and the server port, preserve other
agents' work, and hand off shared-file changes explicitly. A session history or
old handoff is context; verify the current records before acting.

For Portfolio Builder work, also read:

1. `docs/agent-prompts/portfolio-builder/00-master-operating-prompt.md`
2. exactly one bounded phase prompt from `docs/agent-prompts/portfolio-builder/README.md`
3. the approved authority and mission-specific records named by that prompt.

Do not treat the phase prompt as a substitute for inspecting the repository. Begin with
`git status --short`, preserve all existing work, and do not commit or push unless the human
explicitly asks.

Source integrity and learner logic precede implementation. If a phase's required claim is
not canonically supported, stop with `Blocked - source`; if a novice is asked to use an
unstated concept, stop with `Blocked - learning`. Never polish around either defect.
