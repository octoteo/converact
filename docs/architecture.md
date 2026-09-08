# Architecture

Converact is a contract and convergence layer for autonomous software engineering agents. It is not a coding model runtime and does not own implementation planning.

## Durable control plane

- Constitution: project-level engineering/security rules.
- Change Contract: intent, risk, constraints, non-goals, requirements, scopes, and checks.
- Evidence: results tied to both contract digest and implementation workspace fingerprint.
- Accepted Contracts: durable baseline contract store.

## Disposable runtime plane

`.converact/runtime/` contains derived data such as compiled contracts, repository inspection, and context packs. It is gitignored and can be regenerated.

## Adapters

CLI, MCP, Agent Skill, and GitHub Actions are interfaces over the same Core semantics. They must not implement competing contract/evidence logic.

## Fresh evidence

A record can satisfy a requirement only when:

```text
record.contractDigest == currentContractDigest
AND
record.fingerprint == currentWorkspaceFingerprint
AND
record.status == pass
```

The implementation fingerprint excludes `.converact`; contract changes are independently covered by the contract digest. Therefore recording evidence does not invalidate itself, while code or contract changes invalidate prior proof.

## Completion

`TaskDone != ChangeDone`.

A change converges when every MUST requirement has at least one referenced check set and all referenced checks have fresh passing evidence. SHOULD failures are warnings. Acceptance is blocked until convergence.

## Context compilation

Context compilation loads constitutions plus explicitly named standards and source files matching requirement `scope` globs. Packs are bounded by file count and bytes per file. This is a minimum-sufficient-context mechanism, not a security boundary.

## v1 non-goals

- model/runtime orchestration;
- distributed multi-agent scheduling;
- remote sandbox provisioning;
- production deployment control;
- vector/semantic code indexing;
- automatic weakening or rewriting of product contracts from failed implementation.
