# AudioVintage Engineering Documentation

This directory contains the design and operating rules for the AudioVintage
ecommerce platform. The documents are intended to be read before backend
implementation and maintained as the system evolves.

## Reading order

1. [PRODUCT-SCOPE.md](PRODUCT-SCOPE.md) — product boundary, source of truth,
   scope, vocabulary, and definition of ready.
2. [USER-WORKFLOWS.md](USER-WORKFLOWS.md) — customer, editorial, and
   operations workflows, state machines, and invariants.
3. [ARCHITECTURE.md](ARCHITECTURE.md) — current storefront structure and
   target web/API/content boundaries.
4. [ENGINEERING-STANDARDS.md](ENGINEERING-STANDARDS.md) — NestJS, TypeScript,
   Prisma, PostgreSQL, code review, and eventing rules.
5. [API-DATA-STANDARDS.md](API-DATA-STANDARDS.md) — API contracts, data
   ownership, money, identity, inventory, webhooks, and privacy.
6. [UX-GUIDELINES.md](UX-GUIDELINES.md) — visual, responsive, accessibility,
   content, and ecommerce interaction requirements.
7. [TESTING-STRATEGY.md](TESTING-STRATEGY.md) — risk-based tests and release
   quality gates.
8. [DEPLOYMENT-OPERATIONS.md](DEPLOYMENT-OPERATIONS.md) — GitHub Pages,
   Render, PostgreSQL, Redis, Sanity, CI/CD, observability, and recovery.
9. [PRODUCTION-COST-ESTIMATE.md](PRODUCTION-COST-ESTIMATE.md) — staging vs
   production infrastructure cost approximation for a single client.
10. [../CHANGELOG.md](../CHANGELOG.md) — release history and operational notes.

## Documentation rules

### Every feature must identify

- Product owner and technical owner.
- Actor and user workflow.
- Source of truth and data lifecycle.
- Valid states and forbidden transitions.
- API and persistence contract.
- Authentication and authorization requirements.
- PII, security, and audit implications.
- Loading, empty, error, and recovery UX.
- Unit, integration, contract, E2E, accessibility, and security tests.
- Metrics, alerts, rollout, migration, and rollback behavior.

### ADRs

Create an Architecture Decision Record for decisions that:

- Change data ownership or synchronization direction.
- Add or replace an external provider.
- Change authentication, authorization, or security posture.
- Add a deployment service or stateful dependency.
- Change a public API contract or event schema.
- Introduce a migration with destructive or difficult-to-reverse behavior.
- Split the modular monolith into independently owned services.

Suggested ADR format:

```text
docs/adr/NNNN-short-decision-title.md
```

Each ADR should contain context, decision, alternatives, consequences,
security/operational impact, migration plan, and status.

### Change review

- Update the relevant document in the same pull request as the behavior
  change.
- Add a changelog entry for user-visible, operational, schema, or deployment
  changes.
- Link implementation and tests back to the workflow or invariant they prove.
- Mark assumptions as assumptions and record the owner/date for decisions that
  are not yet final.
- Prefer small, reviewable documents over a single unmaintainable specification.

## Definition of ready

The NestJS implementation phase can begin when the team has agreed on:

- Product scope and market rules.
- Catalog, inventory, cart, order, payment, fulfillment, and customer
  vocabulary.
- State machines and business invariants.
- Sanity/PostgreSQL source-of-truth boundaries.
- Monorepo package boundaries.
- API contract approach and authentication provider direction.
- Money, inventory, idempotency, and webhook rules.
- UX failure and recovery states.
- Test levels and CI gates.
- Render/GitHub Pages environments, secrets, migrations, observability, and
  rollback ownership.

## Current status

The existing web storefront remains a static Next.js application. Sanity is
currently used for Listening Room articles and the storefront reads published
content during the GitHub Pages build. The NestJS API, PostgreSQL transactional
model, customer identity, payment integration, and Render services are future
implementation work governed by these documents.

