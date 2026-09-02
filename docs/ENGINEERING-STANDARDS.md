# Engineering Standards

These standards apply to the future NestJS API, background workers, shared
packages, and any supporting TypeScript tooling. They are defaults for team
decisions, not a reason to add abstraction without a problem to solve.

## Engineering principles

1. Prefer simple, explicit designs over cleverness.
2. Keep domain rules independent from frameworks and transport protocols.
3. Make invalid states difficult to represent and easy to reject.
4. Treat external input, provider responses, and stored data as untrusted at
   every boundary.
5. Make side effects observable, retryable, and idempotent.
6. Optimize for correctness in money, inventory, identity, and order state
   before optimizing for throughput.
7. Choose infrastructure from measured requirements, not prestige.
8. Document decisions that create operational, security, or migration
   commitments.

## Target monorepo layout

The repository should move toward this structure when the backend is
scaffolded:

```text
apps/
  web/                 # Next.js static storefront, GitHub Pages
  api/                 # NestJS HTTP API and worker entrypoints, Render
packages/
  contracts/           # OpenAPI-derived types, schemas, error contracts
  config/              # Shared non-secret tooling configuration when useful
  ui/                  # Only genuinely shared UI primitives
docs/
  ...
```

Until migration is approved, the current storefront remains at the repository
root. A directory move is a migration with an explicit plan, not an incidental
backend change.

## NestJS architecture

Start with a modular monolith. Each bounded module owns its use cases, domain
rules, persistence adapter, transport handlers, and tests:

```text
module/
  application/         # use cases, commands, ports
  domain/              # entities, value objects, policies, events
  infrastructure/     # Prisma repositories, providers, adapters
  presentation/        # controllers, DTOs, serializers
```

Recommended initial modules:

- `catalog`
- `inventory`
- `cart`
- `checkout`
- `orders`
- `payments`
- `customers`
- `shipping`
- `promotions`
- `reviews`
- `notifications`
- `admin`
- `content`
- `observability`

### Dependency rules

- Controllers depend on application services, never directly on Prisma.
- Application services depend on domain policies and explicit ports.
- Infrastructure implements ports; it does not define business policy.
- Domain code must not import NestJS, Prisma, HTTP, or provider SDKs.
- Modules communicate through use cases or explicitly versioned events.
- Avoid broad shared utility modules that become hidden dependency containers.
- A module may expose a small public API; its internal files are not a public
  import surface.

### Controllers and services

- Controllers translate HTTP input to an application request and translate the
  result to an HTTP response.
- Controllers contain no pricing, stock, authorization, payment, or transition
  logic.
- Use cases have one clear responsibility and return typed results.
- Keep provider orchestration in adapters or application services, never in
  entities.
- Throw or return typed application errors that map consistently to API
  problem responses.

## TypeScript rules

### Compiler configuration

- Use `strict: true`.
- Keep `noImplicitAny`, `strictNullChecks`, and
  `noUncheckedIndexedAccess` enabled unless an ADR documents an exception.
- Use `exactOptionalPropertyTypes` for domain and contract packages where
  practical.
- Keep `skipLibCheck` disabled in new packages unless a dependency forces an
  explicit exception.
- Build and type-check each workspace independently and from the monorepo
  root.
- Pin a supported Node.js and package-manager version in repository tooling.

### Types and boundaries

- Do not use `any` in application code. Use `unknown` at untrusted boundaries
  and narrow it with a parser.
- Use `import type` for type-only imports.
- Prefer discriminated unions for finite states and command results.
- Use exhaustive `switch` statements with a `never` assertion.
- Use branded/value-object types for IDs, currency amounts, and other values
  whose accidental interchange would be harmful.
- Make invalid combinations unrepresentable where the complexity is
  justified.
- Do not expose Prisma-generated types directly as public API contracts.
- Define explicit input and output DTOs at transport boundaries.
- Avoid optional fields when `undefined` and omission have different meanings.
- Do not use enums as a substitute for a state machine or policy.

### Naming and file design

- Use `PascalCase` for classes, interfaces intended as public abstractions,
  and React components.
- Use `camelCase` for variables, functions, methods, and object properties.
- Use `kebab-case` for URL paths and stable slugs.
- Name functions after observable behavior, such as `reserveInventory`, not
  vague implementation names such as `processData`.
- Keep files focused; split when a module has unrelated responsibilities.
- Avoid barrel exports that hide dependency direction or cause cycles.

### Error handling

- Errors are part of the contract and must have stable codes.
- Never return raw stack traces, SQL errors, provider secrets, or internal
  identifiers to customers.
- Preserve causal errors in server logs.
- Distinguish validation, authentication, authorization, conflict, not-found,
  provider, and unexpected failures.
- Do not catch an error merely to rethrow the same error without adding
  context.
- Promise rejection handling must be explicit at process boundaries.

## Configuration and secrets

- Validate environment variables at process startup.
- Keep configuration access behind one typed configuration module.
- Use separate configuration for local, test, staging, and production.
- Never commit secrets, tokens, private keys, payment credentials, or database
  URLs.
- Never expose server-only configuration through `NEXT_PUBLIC_*` variables.
- Use Render secret environment variables or a managed secret store.
- Log configuration names and safe metadata, never secret values.

## Prisma and PostgreSQL standards

### Schema ownership

- Prisma schema changes require a reviewable migration.
- Every table has a stable primary key and explicit ownership semantics.
- Use foreign keys and database constraints for invariants the database can
  enforce.
- Add indexes based on query patterns and verify them with query plans.
- Use unique constraints for idempotency keys, slugs, provider event IDs, and
  other naturally unique values.
- Store timestamps in UTC and use explicit `createdAt`/`updatedAt` fields.
- Use soft deletion or archival only where historical references require it.

### Money and quantities

- Store monetary values as integer minor units plus an explicit currency, or
  use PostgreSQL `numeric` with a documented decimal policy.
- Never calculate totals with JavaScript binary floating-point numbers.
- Validate currency consistency at every boundary.
- Use decimal-safe arithmetic and deterministic rounding.
- Store quantity as an integer with database and application constraints.

### Queries and transactions

- Repositories expose use-case-oriented methods, not arbitrary query access.
- Select only required fields for list endpoints.
- Avoid N+1 queries; use deliberate relation loading or batched queries.
- Use cursor pagination for large or changing collections and offset
  pagination only where the result set is small and stable.
- Use explicit transaction boundaries in application services.
- Keep transactions short and never perform network calls inside a database
  transaction.
- Use row locks or conditional updates for inventory reservations.
- Use `Serializable` or an appropriate isolation strategy only for identified
  contention; measure and handle serialization retries.
- Raw SQL is allowed for measured query or database features, but must be
  parameterized, reviewed, and covered by integration tests.

### Migrations and seeds

- Migrations are forward-only release artifacts.
- Test migrations from the previous production schema on a clean database.
- Destructive migrations require a staged expand/contract plan.
- Never silently rename or drop data in a deploy that cannot be rolled back.
- Seeds are deterministic and safe for local/test use.
- Production data fixes are reviewed scripts with a dry-run path and audit
  record, not ad hoc console edits.

## Async work and events

- Use a transactional outbox when a database change must reliably produce a
  notification or integration event.
- Use Redis/Valkey and BullMQ initially for email, rebuild triggers, expiry
  processing, and provider retries.
- Jobs must be idempotent, observable, bounded, and safe to retry.
- Add a dead-letter or failed-job review process.
- Do not publish an event before the transaction that establishes its source
  record commits.
- Include event name, version, entity ID, occurred time, correlation ID, and
  causation ID.
- Introduce Kafka or a separate event broker only after volume, retention, or
  consumer isolation requirements justify it.

## Logging and observability

- Use structured JSON logs in deployed environments.
- Include request ID, correlation ID, actor type, route, outcome, duration, and
  error code where applicable.
- Redact email, phone, address, order access tokens, and payment identifiers.
- Capture metrics for catalog latency, checkout failures, inventory conflicts,
  payment webhooks, queue lag, and notification failures.
- Use traces across API, database, queue, and external provider calls.
- Alerts must include a runbook link and an actionable threshold.

## Code review and change management

Every pull request should explain:

- The business problem and affected workflow.
- Source-of-truth and data ownership implications.
- Security and privacy implications.
- Migration and rollback behavior.
- Test evidence and known limitations.
- Monitoring or alert changes.

Reviewers should reject:

- Business logic in controllers or UI components.
- Client-trusted money, stock, payment, or authorization decisions.
- Unbounded queries or unbounded request payloads.
- New external services without an ownership and failure plan.
- Schema changes without migration and rollback analysis.
- Tests that only assert implementation details while missing business behavior.

