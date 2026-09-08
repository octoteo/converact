---
name: converact
description: Use Converact for contract-driven software changes in repositories that contain or should contain a `.converact` directory. Trigger when asked to implement, modify, refactor, fix, verify, or review code under explicit requirements, acceptance criteria, risk constraints, or autonomous-agent workflows. Use it to classify change risk, create and refine change contracts, compile minimum sufficient context, execute implementation with the host coding agent, gather evidence, verify MUST requirements, and converge before acceptance. Prefer the Converact CLI or MCP tools as the deterministic source of truth rather than duplicating contract or evidence logic in the model.
---

# Converact

Use Converact as the control plane for the change. The contract defines truth; the host coding agent decides implementation procedure; fresh evidence defines completion.

## Workflow

1. Locate the project root. If `.converact` does not exist, run `converact init`.
2. Run `converact inspect --json` when repository shape or verification commands are unclear.
3. Classify the request with `converact classify "<request>" --json` unless risk is already governed.
4. L0 changes may be implemented directly with normal verification. L1-L3 changes should use a durable change contract.
5. Create a change with `converact change create`, then edit `.converact/changes/<id>/contract.json` before implementation. See `references/contract.md`.
6. Validate with `converact contract validate <id> --json` and activate the contract.
7. Build focused context with `converact context build <id> --task "<task>" --json`.
8. Implement autonomously. Planning/task decomposition are disposable runtime choices, not durable truth.
9. Run `converact verify <id> --json`. Fix implementation failures; never weaken the contract merely to pass.
10. Run `converact converge <id> --json` until converged or a governance boundary requires escalation.
11. Accept only a converged change with `converact change accept <id> --json`.

## Contract mutation barrier

Treat intent, MUST requirements, constraints, and evidence checks as controlled truth. When evidence shows that the contract itself is wrong, propose the contract change explicitly before using a revised contract. Changing the contract invalidates prior evidence.

## Evidence rules

- Prefer executable `command` and deterministic `file` checks.
- Use `manual` checks only when automatic verification is not reasonable.
- Evidence is valid only for the current contract digest and current implementation workspace fingerprint.
- TaskDone is not ChangeDone. Convergence defines completion.

## Tool choice

Prefer native Converact MCP tools when available. Otherwise call the CLI with `--json`. Both adapters share the same Core semantics.
