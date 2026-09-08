# Security Policy

Converact operates inside software repositories and treats repository content as potentially untrusted.

- `command` checks execute through the local shell. Running `converact verify` authorizes the commands declared in the contract for the current environment.
- `file` checks reject paths that escape the project root.
- MCP callers can trigger verification and therefore contract commands.
- Command stdout/stderr is stored as evidence and truncated; verification commands must not print secrets.
- Context packs may contain source code and must not include secrets.
- Converact v1 does not provide OS sandboxing. Use containers, VMs, restricted worktrees, or the host coding agent's sandbox for untrusted/high-authority execution.

Report suspected vulnerabilities privately through GitHub security reporting when available rather than opening a public issue.

The latest stable major release is the supported security line.
