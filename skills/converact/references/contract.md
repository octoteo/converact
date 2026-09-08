# Contract authoring

The canonical v1 contract is `.converact/changes/<id>/contract.json`.

Keep contracts outcome-oriented. Do not encode implementation steps unless a specific implementation is itself a requirement.

Use:
- `intent` for why/outcome;
- `constraints` for implementation boundaries;
- `nonGoals` for deliberately excluded scope;
- `standards` for focused `.converact/standards/*.md` context;
- `requirements` for durable behavior/invariants/interfaces;
- `checks` for evidence producers.

Requirement priority is `must` or `should`. Every MUST requirement should reference at least one meaningful check.

Check kinds:
- `command`: passes only when the shell command exits 0;
- `file`: verifies a project-contained file, optionally a literal `contains` string;
- `manual`: remains pending until explicit evidence is recorded.

Do not lower risk, relax MUST requirements, or replace failing checks with weaker checks solely to obtain a passing verdict.
