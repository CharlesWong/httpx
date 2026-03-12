# Coding Agent Preference

For all coding tasks (building features, refactoring, fixing bugs, reviewing PRs, writing code), **always use Codex CLI** (`codex`) — especially for bounty work.

- Codex CLI is configured with **GPT 5.4 at xhigh reasoning effort** — use it for ALL coding work.
- **DO NOT use Claude Code for bounty tasks** — not worth the cost.
- Only use Claude Code if Codex is completely unavailable.
- When spawning Codex: use `codex --full-auto` with `pty:true` and `background:true`.
- When the user says "用完后用 sonnet 4.6" or asks to switch back, change the default model to `cliproxy/claude-sonnet-4-6`.
