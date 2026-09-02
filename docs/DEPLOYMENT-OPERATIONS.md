# Deployment and Operations

This document defines how the web storefront, NestJS API, data services, and
editorial platform are deployed and operated. The system is intentionally
split into independently deployable units without prematurely splitting the
domain into microservices.

## Target topology

```text
Shopper
  |
  v
GitHub Pages
Next.js static web
  |
  | HTTPS, CORS allow-list
  v
Render web service
NestJS API
  |             |              |
  v             v              v
PostgreSQL   Redis/Valkey   Object storage
  |
  v
Render worker or background process
```

```text
Editorial contributor
        |
        v
Sanity Studio -> published Content Lake
        |
        v
GitHub Actions static rebuild -> GitHub Pages
```

## Deployment units

### Web storefront

- Next.js App Router static export.
- Hosted on GitHub Pages.
- Output directory: `out/`.
- Base path: `/e-commerce` for the current repository deployment.
- No server-only secrets or write tokens.
- Reads public Sanity articles at build time.
- Calls the Render API over HTTPS for future dynamic commerce behavior.

### API

- NestJS modular monolith.
- Hosted as a Render web service or Docker service.
- Owns catalog, inventory, customers, carts, checkout, orders, payments,
  shipping, promotions, reviews, notifications, and admin operations.
- Exposes health, metrics, and version endpoints.
- Uses managed PostgreSQL and Redis/Valkey through private or protected
  connections where the platform supports them.

### Worker

- Separate Render background worker when asynchronous volume or deployment
  isolation requires it.
- Processes transactional outbox events, email, reservation expiry,
  webhook follow-up work, reconciliation, and rebuild triggers.
- Must be safe to restart and retry.
- Does not own a second copy of transactional truth.

### Sanity

- Sanity Studio is maintained under `studio/`.
- Sanity owns editorial articles, authors, categories, and editorial media.
- Studio has an independent package lock and build policy.
- The storefront only consumes published public content.
- Sanity write credentials stay in Studio tooling or server-side automation,
  never in the static web bundle.

## Environments

| Environment | Web | API | Database | Sanity |
| --- | --- | --- | --- | --- |
| Local | Local static/dev server | Local NestJS | Containerized test DB | Local Studio, configured dataset |
| Preview | Optional artifact | Optional preview service | Ephemeral or shared isolated DB | Preview dataset if needed |
| Staging | GitHub Pages-like artifact | Render staging service | Staging DB | Staging dataset |
| Production | GitHub Pages | Render production service | Production managed DB | `production` dataset |

Production and staging must not share mutable customer, order, payment, or
inventory data. A staging build must never point to production payment
credentials.

## Configuration

### Public web configuration

Safe for static build output:

- `NEXT_PUBLIC_BASE_PATH`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- Public API origin, if the API is designed for browser access

### Server-only configuration

Never expose in `NEXT_PUBLIC_*` variables:

- `DATABASE_URL`
- Database direct/admin credentials.
- Redis connection credentials.
- OIDC client secrets.
- Session signing keys.
- Payment provider secret keys and webhook secrets.
- Sanity read/write tokens.
- Email provider API keys.
- Object-storage credentials.
- Sentry or observability server tokens.

Render environment groups or a dedicated secret manager should provide these
values. Configuration is validated at process startup and missing required
production values fail fast.

## Render service requirements

The API service should have:

- A pinned Node.js and package-manager version.
- A reproducible Dockerfile or Render native build configuration.
- A health check at `/health/ready`.
- A liveness check at `/health/live`.
- Graceful shutdown handling for `SIGTERM`.
- Request, connection, and upstream timeouts.
- Structured JSON logs.
- Environment-specific configuration.
- A minimum instance policy appropriate for avoiding cold-start impact on
  checkout.
- Autoscaling criteria based on measured latency, CPU, memory, and queue lag.

The worker should have:

- A distinct process command.
- Concurrency and job-timeout limits.
- Dead-letter or failed-job visibility.
- Graceful drain behavior on deployment.
- Monitoring for queue depth and oldest-job age.

Do not place API and worker responsibilities in a single process merely to
avoid defining service commands. Keep them in the same codebase initially, but
make their process boundaries explicit.

## CI/CD pipeline

### Pull request checks

1. Install dependencies from frozen lockfiles.
2. Validate formatting, lint, and strict TypeScript.
3. Run unit and property-based tests.
4. Start ephemeral PostgreSQL and Redis/Valkey.
5. Run migrations and integration tests.
6. Run contract tests.
7. Build the API, worker, web artifact, and Studio independently.
8. Run targeted E2E, accessibility, and security checks.

### API release

1. Build an immutable API/worker artifact.
2. Run migration compatibility checks.
3. Apply expand migrations as a controlled release step.
4. Deploy the API and worker to Render.
5. Verify liveness, readiness, dependency health, and smoke endpoints.
6. Run post-deploy contract and workflow smoke tests.
7. Monitor errors, latency, queue lag, and database health.
8. Apply contract cleanup migrations only after old code is no longer running.

### Web release

1. Install root dependencies from the root lockfile.
2. Build the static Next.js artifact with the explicit base path and public
   Sanity configuration.
3. Fetch only published public Sanity content.
4. Generate article routes and verify expected output.
5. Upload `out/` using GitHub Pages actions.
6. Run a deployed smoke test against the base path and key routes.

### Studio validation

1. Install from `studio/pnpm-lock.yaml`.
2. Use the Studio’s isolated pnpm build-script policy.
3. Type-check and build Studio independently from the storefront.
4. Deploy Studio hosting only through an explicit Studio release process.

The storefront build must not resolve Studio dependencies through the root
project. The two projects may share a repository but have separate package
boundaries, lockfiles, and build checks.

## Database migrations

- Migrations are reviewed release artifacts.
- CI validates migrations from the previous schema and from a clean database.
- Production migrations run once through a controlled job or release command.
- API replicas must not independently race to apply migrations on startup.
- Use expand/contract for changes requiring old and new application versions
  to coexist.
- Back up before destructive or high-risk migrations.
- Have a data repair and rollback plan before deployment.
- Verify migration duration and locking behavior on representative data.

## Sanity publication and rebuild flow

Current supported flow:

1. Contributor publishes an article in Sanity.
2. A maintainer dispatches the GitHub Pages workflow or pushes an approved
   change to `main`.
3. GitHub Actions builds the storefront against the public Sanity dataset.
4. The generated artifact is deployed to GitHub Pages.
5. The article grid and slug route are smoke-tested.

Future automation may use a signed Sanity webhook to dispatch a restricted
GitHub Actions workflow. The webhook must:

- Authenticate the request.
- Trigger only the intended build workflow.
- Avoid exposing repository write credentials to Sanity.
- Debounce or coalesce repeated content events.
- Report build success/failure to an observable destination.

## Observability

### Logs

Use structured logs with:

- Timestamp and severity.
- Service and environment.
- Request ID and correlation ID.
- Actor type and safe actor ID where applicable.
- Route/operation name.
- Duration and outcome.
- Stable error code.

Redact email, phone, address, session tokens, guest-order tokens, payment
credentials, authorization headers, and full provider payloads.

### Metrics

Track:

- API request count, error rate, and p50/p95/p99 latency.
- Database connection usage and slow queries.
- Redis availability, queue depth, and oldest-job age.
- Catalog/search latency and empty-result rate.
- Cart and quote failure rates.
- Inventory reservation conflicts and expiries.
- Payment success, failure, pending, and webhook lag.
- Duplicate/idempotency conflicts.
- Order state transition failures.
- Email and notification failures.
- Static build duration and Sanity query failures.

### Traces and alerts

Use OpenTelemetry or an equivalent standard across API, database, queue, and
provider calls. Alerts must identify an owner, threshold, severity, dashboard,
and runbook.

Initial alert classes:

- API availability or elevated 5xx errors.
- Checkout/payment failure increase.
- Inventory reservation conflict anomaly.
- Webhook backlog or signature failure anomaly.
- Database connection exhaustion.
- Queue lag beyond the reservation/notification SLA.
- Failed GitHub Pages or Sanity build.

## Backup and disaster recovery

Before production launch, define and approve:

- Recovery point objective (RPO).
- Recovery time objective (RTO).
- Retention schedule.
- Encryption and access policy.
- Restore owner and communication path.

For the initial single-market store, a proposed baseline is RPO of 24 hours and
RTO of 4 hours, subject to business approval. Payment-provider and order
reconciliation procedures must cover the period between the last backup and
recovery.

Run restore drills against a non-production database at least quarterly or
after major storage/migration changes. A backup that has never been restored is
not operational evidence.

## Rollback

### Web

- Redeploy the last known-good GitHub Pages artifact or revert the offending
  web commit.
- Keep Sanity content intact; a web rollback must not delete editorial data.
- If a content item breaks the build, correct or unpublish it and rerun the
  build.

### API

- Prefer a Render rollback to the last known-good immutable artifact.
- Do not roll back application code across an incompatible database migration.
- Use backward-compatible migrations and expand/contract sequencing.
- Pause risky consumers or workers if they could create additional side
  effects.

### Data and payments

- Never “roll back” an order by deleting it.
- Record compensating actions for refunds, returns, inventory, or payment
  reconciliation.
- Preserve audit evidence and provider references.

## Operational runbooks

The following runbooks are required before accepting real orders:

- API unavailable.
- Database unavailable or connection exhaustion.
- Redis/queue unavailable.
- Payment provider outage.
- Duplicate or out-of-order webhook.
- Inventory reservation conflict or drift.
- Stuck order or failed notification.
- Failed Sanity/static build.
- Suspected account takeover or unauthorized order access.
- Data restoration and migration failure.

Each runbook should state detection, immediate containment, customer impact,
safe remediation, escalation, verification, and post-incident follow-up.

## Scaling and architecture triggers

Do not introduce more infrastructure by default. Reconsider the initial
modular monolith only when evidence shows:

- API and worker workloads require independent scaling.
- A module has a separate ownership and release cadence.
- Database contention is isolated and measurable.
- Queue throughput or retention exceeds Redis/Valkey suitability.
- Search requirements exceed PostgreSQL capabilities.
- Deployment blast radius is causing documented incidents.

Kubernetes, Kafka, OpenSearch, and independent microservices require an ADR
covering cost, operational ownership, failure modes, migration, and a measured
threshold.

