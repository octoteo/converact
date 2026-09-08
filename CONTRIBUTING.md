# Contributing

Contributions are welcome.

1. Open an issue for substantial contract-model or behavior changes.
2. Create a focused branch.
3. Run `npm run ci`.
4. Keep CLI, MCP, Skill, and GitHub Action semantics centered on the same Core rather than duplicating logic.
5. Add tests for changes to contracts, evidence freshness, or convergence.
6. Open a pull request with verification details.

Prefer Node.js built-ins in Core/CLI where practical. New runtime dependencies require a clear interoperability or reliability reason.
