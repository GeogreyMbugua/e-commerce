# API and Data Standards

This document defines the contracts between the static storefront, future
NestJS services, PostgreSQL, Sanity, payment providers, and operational tools.
It is deliberately provider-neutral where a decision does not need to be made
before implementation.

## API style

- Use versioned REST resources as the default transport.
- Publish an OpenAPI document for every public API version.
- Keep resource names plural and path segments `kebab-case`.
- Use nouns in paths and HTTP methods for actions.
- Reserve explicit action endpoints for commands that are not naturally CRUD,
  such as `/checkout-sessions`, `/orders/{id}/cancel`, and
  `/payments/{id}/refund`.
- Use ISO 8601 UTC timestamps.
- Use JSON with a documented content type and UTF-8 encoding.
- Set request size limits, timeouts, and pagination limits at the edge and API.
- Avoid leaking database table names or ORM relation structure into URLs.

Example resource shape:

```text
GET    /api/v1/products
GET    /api/v1/products/{productSlug}
POST   /api/v1/carts
POST   /api/v1/carts/{cartId}/lines
POST   /api/v1/checkout-sessions
GET    /api/v1/orders/{orderReference}
POST   /api/v1/payments/webhooks/{provider}
```

## Request and response contracts

- Validate every request body, query parameter, path parameter, and header
  required by a workflow.
- Parse external data into an internal type before business logic runs.
- Return explicit response DTOs; never serialize Prisma models directly.
- Do not return fields merely because they exist in the database.
- Use a stable envelope only when it adds consistency; avoid nested generic
  wrappers that obscure the resource.
- Include a request/correlation ID in response headers.
- Use ETags or version fields where clients need optimistic concurrency.
- Keep public contracts backward compatible within a major API version.

## Error contract

Use an RFC 7807-style problem response:

```json
{
  "type": "https://api.audiovintage.com/problems/stock-changed",
  "title": "Stock changed",
  "status": 409,
  "code": "STOCK_CHANGED",
  "detail": "One item in your cart is no longer available in the requested quantity.",
  "instance": "/api/v1/checkout-sessions/checkout_123",
  "requestId": "req_123",
  "fields": [
    {
      "name": "lines[0].quantity",
      "code": "QUANTITY_EXCEEDS_STOCK"
    }
  ]
}
```

Rules:

- `code` is stable and machine-readable.
- `detail` is safe for the intended customer or operator.
- Validation problems identify fields without echoing sensitive values.
- Use `400` for malformed input, `401` for missing/invalid identity,
  `403` for insufficient permission, `404` for an inaccessible or missing
  resource, `409` for state/concurrency conflicts, `422` for semantically
  invalid input where useful, and `429` for rate limiting.
- Use `5xx` responses only for failures the client cannot correct.
- Do not expose SQL, provider response bodies, stack traces, or secret
  configuration.

## Pagination, filtering, and sorting

- All collection endpoints define a maximum page size.
- Use cursor pagination for catalogs, orders, events, and other mutable or
  potentially large collections.
- Return a stable cursor contract and a `hasMore` indicator.
- Use URL parameters for shareable filter state.
- Normalize and validate search terms, prices, categories, sort keys, and
  directions.
- Allow-list sortable and filterable fields.
- Keep filtering and sorting in the repository/query layer, not in a
  controller or frontend loop.
- Ensure result counts have an explicitly documented meaning.

## Idempotency and concurrency

Idempotency is required for:

- Checkout-session creation.
- Order creation.
- Payment attempts.
- Refund requests.
- Webhook processing.
- Cart mutation commands where retries could duplicate effects.

Rules:

- Clients send an `Idempotency-Key` for retryable commands.
- The server scopes keys to the authenticated customer or secure guest
  identity and operation type.
- Store the key, request fingerprint, final status, and response result.
- Repeating the same key with a different request must return a conflict.
- Keys have a documented retention period.
- Database uniqueness constraints enforce deduplication.
- Provider idempotency keys must be derived consistently and stored.

Use optimistic concurrency for ordinary edits and conditional updates or row
locks for inventory reservation. A successful response must represent a
committed state, not an intention to write.

## Authentication and authorization

- Use OIDC through a managed or self-hosted identity provider.
- Do not implement password hashing, reset tokens, or OAuth protocol details
  in the application when the identity provider can own them.
- Prefer secure, short-lived access tokens and rotating refresh mechanisms
  appropriate to the client architecture.
- Store browser session material in secure, HTTP-only, appropriately scoped
  cookies when using cookie sessions.
- Define a guest principal with a secure, rotating cart/order access mechanism.
- Apply authorization in the API use case, not only in guards or frontend
  routes.
- Check resource ownership for every customer-scoped object.
- Use RBAC for coarse roles and policy checks for resource/action constraints.
- High-risk admin actions require explicit permission and audit evidence.

## CORS, CSRF, and rate limits

- Allow only the known GitHub Pages origin and configured local/staging
  origins.
- Never use a wildcard origin with credentials.
- Define whether each authentication path is cookie-based or
  authorization-header-based; do not mix casually.
- Use CSRF protection for cookie-authenticated state-changing requests.
- Rate-limit sign-in, guest order lookup, contact, newsletter, coupon, cart,
  checkout, and webhook endpoints according to risk.
- Return `Retry-After` where appropriate.
- Use provider and edge limits in addition to application limits.

## Domain data ownership

### PostgreSQL

PostgreSQL is authoritative for:

- Sellable products and stable slugs.
- Categories, attributes, media references, and condition records.
- Prices, currency, and market eligibility.
- Inventory, reservations, and adjustments.
- Customer profiles, addresses, carts, and wishlists.
- Orders, immutable line snapshots, payments, refunds, returns, and fulfillment.
- Coupons, shipping methods, and operational audit records.

### Sanity

Sanity is authoritative for:

- Listening Room articles.
- Authors and editorial categories.
- Portable Text and editorial image references.
- Editorial SEO fields.

The storefront may read published Sanity content during static generation. The
backend must not copy mutable transactional fields into Sanity unless a
separate synchronization contract is approved.

## Relational modeling rules

- Use stable IDs that are safe to expose only where exposure is intended.
- Use public references or slugs separately from internal primary keys when
  enumeration or privacy is a concern.
- Add unique constraints for business uniqueness, not only application checks.
- Add foreign keys for relationships that must not dangle.
- Use explicit status columns backed by application transition policies and
  database constraints where practical.
- Store historical snapshots for orders, prices, condition summaries, and
  shipping selections.
- Store provider references and raw event IDs needed for reconciliation, but
  redact or minimize provider payloads.
- Use UTC timestamps and record the actor for operational mutations.
- Define deletion behavior for every relationship.

## Catalog model requirements

A sellable product should support:

- Stable internal ID and public slug.
- Title, description, category, tags, and searchable text.
- Product type and physical-media/equipment classification.
- Currency and integer minor-unit price.
- Condition grade and detailed condition notes.
- Test/restoration history and known defects.
- Specifications, compatibility, provenance, and media.
- Market eligibility and lifecycle status.
- Inventory policy, including whether the product is unique.

Catalog responses must expose enough trust information for a customer to make
an informed decision without exposing internal cost or operational notes.

## Cart, quote, and order data

- Cart lines reference a product identity and requested quantity.
- Quotes contain a server-calculated expiry, currency, line prices, shipping,
  tax, discounts, and total.
- Orders copy the final product title, condition summary, unit price, currency,
  quantity, discount, and tax/shipping allocations into immutable lines.
- Order updates never rewrite historical lines or totals.
- Payment and fulfillment states are separate columns/state machines.
- Customer notes are untrusted input and require length limits and safe display.
- Guest order access uses an unguessable token or equivalent proof.

## Money rules

Use one representation consistently:

```text
Money = { amountMinor: integer, currency: ISO-4217 code }
```

- Never use JavaScript floating-point arithmetic for monetary decisions.
- Never accept a client-provided total as authoritative.
- Calculate and round using a documented currency policy.
- Validate that all lines, discounts, shipping, tax, and payment use the same
  currency.
- Persist the exact amounts used to authorize, capture, refund, and reconcile.
- Test zero, boundary, discount, rounding, and large-value cases.

## Inventory and reservation rules

- Available quantity is derived from inventory minus active reservations and
  completed allocations according to the chosen model.
- A reservation has an owner, quantity, creation time, expiry, and state.
- Reservations are created atomically with checkout state.
- Expiry release is a retryable job.
- Unique items require a conflict-safe conditional write.
- Inventory adjustments require a reason and actor.
- Reconciliation must identify differences between database state and physical
  stock.

## Payments and webhooks

- Use a provider-hosted payment surface where possible to minimize PCI scope.
- Store provider customer/payment/order references, not card data.
- Verify webhook signatures before parsing business events.
- Reject stale, malformed, duplicate, or replayed events safely.
- Record provider event IDs with a uniqueness constraint.
- Process webhook effects idempotently through an application service.
- Do not perform long-running work in the webhook request; enqueue it after
  recording the event.
- Reconcile provider state periodically.

## Events and transactional outbox

An internal event should contain:

```json
{
  "name": "order.paid.v1",
  "eventId": "evt_123",
  "entityId": "order_123",
  "occurredAt": "2026-09-01T00:00:00.000Z",
  "correlationId": "req_123",
  "causationId": "evt_provider_123",
  "payload": {}
}
```

- Write the outbox event in the same transaction as its source change.
- A worker publishes or handles it after commit.
- Consumers track event IDs and are safe to retry.
- Version event payloads explicitly.
- Do not use events to hide a direct data dependency that needs a synchronous
  response.

## PII, retention, and audit

- Collect only what the workflow requires.
- Separate identity-provider data, customer profile data, order data, and
  operational audit data.
- Encrypt data in transit and use provider/database encryption at rest.
- Redact PII from logs, traces, analytics, and error responses.
- Define retention and deletion policies before launch.
- Preserve legally or operationally required order records while minimizing
  unnecessary personal data.
- Audit sign-in-sensitive changes, role changes, inventory adjustments,
  refunds, returns, exports, and administrative customer access.

## Contract governance

- Store the OpenAPI contract with the API.
- Generate frontend clients and types from the reviewed contract.
- Add contract tests for every new resource and command.
- Deprecate before removing a public field or endpoint.
- Record provider changes and compatibility assumptions in an ADR.

