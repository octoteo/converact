# Converact

**Contract-driven convergence for autonomous software engineering agents.**

Converact is an open-source control plane for coding agents. Humans and project policy define what must be true; agents decide how to make it true; fresh evidence decides when the change is done.

> Contract is durable. Plan is disposable. Context is compiled. Evidence defines done.

## Why

Strong coding agents can research, plan, implement, test, review, and repair code with little supervision. The remaining hard problem is keeping product intent, invariants, authority boundaries, and acceptance evidence stable while the agent changes its plan.

Converact makes the durable object a **change contract**, not an implementation plan:

```text
Intent -> Contract -> Context -> Agent execution -> Evidence -> Convergence -> Accept
```

`TaskDone != ChangeDone`. A change is complete only when every MUST requirement has fresh passing evidence for the current contract and implementation state.

## v1.0.0

- deterministic JSON change contracts;
- L0-L3 risk classification;
- repository inspection and bounded context compilation;
- command, file, and explicit/manual evidence;
- evidence bound to both contract digest and workspace fingerprint;
- MUST/SHOULD convergence engine and convergence-gated acceptance;
- universal Node.js CLI with `--json` output;
- MCP v2 stdio server;
- reusable Agent Skill;
- composite GitHub Action and CI;
- JSON Schema, tests, architecture and security documentation.

## Install

Requires Node.js 20+.

From GitHub after the v1.0.0 tag is available:

```bash
npm install -g github:octoteo/converact#v1.0.0
```

For development:

```bash
git clone https://github.com/octoteo/converact.git
cd converact
npm install
npm test
npm link
```

## Quick start

```bash
converact init
converact inspect --json
converact classify "Add disabled-user session revocation" --json
converact change create "Disable sessions for disabled users" \
  --intent "Disabled users cannot create or refresh authenticated sessions" \
  --json
```

Edit `.converact/changes/<id>/contract.json`, then:

```bash
converact contract validate <id> --json
converact change activate <id> --json
converact context build <id> --task "Implement the change" --json
```

Let the host coding agent implement the change, then:

```bash
converact verify <id> --json
converact converge <id> --json
```

If convergence fails, fix the implementation and repeat verification. Do not weaken the contract merely to make the result pass.

When converged:

```bash
converact change accept <id> --json
```

## Contract example

```json
{
  "schemaVersion": 1,
  "id": "CHG-auth-disable",
  "title": "Disable sessions for disabled users",
  "intent": "Disabled users cannot create or refresh authenticated sessions.",
  "riskLevel": "L2",
  "status": "active",
  "constraints": ["Preserve historical user data"],
  "nonGoals": ["Redesign authorization"],
  "standards": ["security"],
  "requirements": [
    {
      "id": "REQ-001",
      "type": "invariant",
      "statement": "Disabled users cannot obtain a valid session.",
      "priority": "must",
      "scope": ["src/auth/**", "test/auth/**"],
      "checks": ["CHK-001"]
    }
  ],
  "checks": [
    {
      "id": "CHK-001",
      "kind": "command",
      "description": "Authentication regression suite passes.",
      "command": "npm test -- auth"
    }
  ]
}
```

The JSON Schema is in `schemas/contract.schema.json`.

## Evidence freshness

Each evidence record stores the current **contract digest** and **workspace fingerprint**. Changing either the contract or implementation invalidates old proof for convergence. Recording evidence itself does not invalidate implementation state because `.converact` is excluded from the workspace fingerprint.

## Risk-adaptive workflow

| Level | Typical change | Workflow |
|---|---|---|
| L0 | typo, cosmetic CSS, isolated reversible edit | direct implementation + normal verification |
| L1 | ordinary feature/bug | lightweight change contract |
| L2 | API/schema/state machine/auth/security/compatibility | structural contract + strong verification/review |
| L3 | safety/industrial/critical/irreversible production behavior | governed contract + explicit authority boundaries |

The classifier is advisory; project policy or humans may always raise risk.

## CLI

```text
converact init
converact inspect
converact classify <description>
converact status
converact change create|show|list|activate|accept
converact contract validate|compile
converact context build
converact evidence record
converact verify [--all-active]
converact converge
converact run
converact mcp
```

Every non-MCP command supports `--json`.

## MCP

Converact uses the official split MCP v2 server package and stdio negotiation path.

```bash
converact mcp
```

Example client configuration:

```json
{
  "mcpServers": {
    "converact": {
      "command": "converact",
      "args": ["mcp"]
    }
  }
}
```

Exposed tools cover inspection, risk classification, status, change creation, contract validation/compilation, context compilation, evidence, verification, convergence, and acceptance.

## Agent Skill

The repository ships `skills/converact/`. Install or copy it to the skill location supported by the host agent, for example `.agents/skills/converact`, `.claude/skills/converact`, or `.github/skills/converact`.

The Skill controls workflow and governance behavior; deterministic contract/evidence semantics remain in Core/CLI/MCP.

## GitHub Actions

After checkout:

```yaml
- uses: octoteo/converact@v1.0.0
  with:
    change-id: CHG-20260908-example
```

Or verify every active/draft change:

```yaml
- uses: octoteo/converact@v1.0.0
  with:
    all-active: 'true'
```

Contract command checks are executable repository input. Review untrusted contracts before verification.

## Project layout

```text
.converact/
├── config.json
├── constitution/
├── contracts/
├── standards/
├── decisions/
├── changes/
│   └── CHG-*/
│       ├── intent.md
│       ├── contract.json
│       ├── evidence.json
│       └── outcome.md
└── runtime/            # disposable; gitignored
```

See `docs/architecture.md` for the design model and `SECURITY.md` for trust boundaries.

## Principles

1. **Contract > Plan** — implementation procedure can change freely; durable requirements cannot drift silently.
2. **Evidence > Agent claim** — done is a verification state, not a model statement.
3. **Context is compiled** — provide minimum sufficient context instead of dumping the whole project into each worker.
4. **Runtime state is disposable** — scratch plans/tasks are not durable project truth.
5. **Convergence defines completion** — TaskDone is not ChangeDone.
6. **Model agnostic** — Converact controls contracts and evidence, not a particular coding model.

## Development

```bash
npm install
npm run ci
```

CI tests Node.js 20 and 22, imports the MCP server, and runs an npm package dry-run.

## License

Apache License 2.0. See `LICENSE`.
