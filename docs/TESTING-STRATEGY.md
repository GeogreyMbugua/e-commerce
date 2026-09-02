# Testing Strategy

Testing is organized around business risk, not around maximizing a single
coverage percentage. The highest-risk areas are money, inventory
concurrency, payment state, authorization, personal data, and the customer’s
ability to recover from failure.

## Quality objectives

- A valid purchase can complete exactly once.
- An invalid or unauthorized purchase cannot mutate commercial state.
- Inventory cannot be oversold under concurrent requests.
- Money calculations are deterministic and auditable.
- Provider retries do not duplicate orders, refunds, emails, or inventory
  changes.
- Customers can recover from validation, quote, provider, and payment errors.
- Every public API contract is validated independently of its implementation.
- Critical customer journeys work on supported mobile and desktop contexts.
- Accessibility and security regressions block release at the appropriate
  severity.

## Test pyramid

```text
                 E2E and accessibility
              Contract and API integration
         Domain unit and property-based tests
```

Most behavior should be proven with fast domain and application tests. A
smaller set of E2E tests should prove that the deployed systems work together.

## Test environments

### Unit environment

- No network or real provider calls.
- Deterministic clock, ID, random, and currency services.
- Pure domain logic and application policies.

### Integration environment

- Ephemeral PostgreSQL and Redis/Valkey instances.
- Testcontainers or an equivalent isolated service runner.
- Real Prisma migrations applied from an empty database.
- Provider adapters replaced by deterministic sandbox fakes or official
  sandbox endpoints.

### Contract environment

- Reviewed OpenAPI contract.
- Generated frontend client.
- Provider webhook fixtures with valid and invalid signatures.
- Sanity projection fixtures representing published, draft, internal, and
  malformed content.

### Staging environment

- Render-like API deployment.
- Managed-service configuration with non-production data.
- Payment provider sandbox.
- GitHub Pages-like static artifact.
- Restricted test accounts and seeded catalog.

Production data and real payment credentials must never be used in automated
tests.

## Unit tests

### Money and quote calculations

Test:

- Multiple line items.
- Discounts, tax, shipping, and zero-value totals.
- Currency mismatch.
- Minor-unit rounding boundaries.
- Maximum allowed values.
- Expired quote.
- Price changes between cart and quote.
- Negative, fractional, and overflow quantities.

Core invariant:

```text
total = subtotal + shipping + tax - discount
```

The result must be deterministic, non-negative, currency-consistent, and
represented in integer minor units or an approved decimal-safe type.

### Cart

Test:

- Add a new line.
- Merge an existing line.
- Remove a line.
- Clear the cart.
- Increment/decrement limits.
- Unique-item quantity capped at one.
- Unavailable and insufficient-stock responses.
- Repeated idempotent mutation.
- Guest-to-account merge and conflict resolution.

### Catalog query behavior

Test:

- Search normalization.
- Category, price, availability, and condition filters.
- Allow-listed sort fields.
- Stable ordering for equal sort values.
- Cursor encoding and invalid cursors.
- Maximum page size.
- Empty results.
- Direct product lookup by slug.

### State machines

Test every permitted transition and every important forbidden transition for:

- Cart.
- Inventory reservation.
- Order.
- Payment.
- Fulfillment.
- Return.
- Refund.
- Review moderation.

Use exhaustive TypeScript switches so adding a state creates a compile-time
review point.

### Authorization

Test:

- Customer can access only owned carts, addresses, and orders.
- Guest token cannot access another order.
- Support role has only intended read/write scope.
- Refund and role-management permissions require elevation.
- Missing, expired, and revoked identity are rejected.

## Property-based testing

Use property-based tests for domains with broad input combinations:

- Cart operations preserve one line per product/variant.
- Quantities never become negative or exceed policy limits.
- Totals do not become negative.
- Adding the same idempotent command repeatedly produces one effect.
- Applying and releasing a reservation preserves available inventory.
- State transitions never bypass required intermediate states.
- Cursor pagination does not duplicate or skip records under the defined
  consistency model.

## Integration tests

Run integration tests against real PostgreSQL and Redis/Valkey services.

### Persistence and transactions

- Migrations apply cleanly to an empty database.
- Repositories persist and retrieve only approved fields.
- Foreign keys and uniqueness constraints reject invalid states.
- A failed transaction leaves no partial order or reservation.
- Order line snapshots remain unchanged after catalog edits.
- Soft-deleted or archived records obey relationship policy.

### Inventory concurrency

- Two simultaneous reservations for one unique item produce one success.
- Reservation expiry releases availability once.
- Payment failure releases the reservation.
- Successful payment converts the reservation once.
- Retry and serialization conflict behavior is deterministic.

### Checkout and orders

- Quote re-reads price and availability.
- Empty carts cannot create checkout sessions.
- Valid shipping methods match the address and product.
- Coupon usage limits are enforced transactionally.
- One idempotency key produces one order and response.
- A different request using the same key returns a conflict.

### Payments and webhooks

- Valid webhook transitions the payment once.
- Invalid signature is rejected.
- Replayed event is a successful no-op.
- Out-of-order events do not produce an invalid state.
- Provider timeout leaves a recoverable pending state.
- Refund is recorded with provider reference and audit details.

### Jobs and outbox

- Outbox record is written with its source transaction.
- Worker retry does not duplicate email or external action.
- Failed jobs are visible and recoverable.
- Reservation expiry and notification jobs are safe to run twice.

### Sanity content

- Only published public articles are mapped to the storefront.
- Draft and internal articles are excluded.
- Missing slug or hero image is handled safely.
- Portable Text image and block projections render correctly.
- Sanity/API failure produces a build failure or controlled fallback according
  to the documented release policy.

## Contract tests

Contract tests must cover:

- Catalog list and product detail.
- Cart and cart-line commands.
- Quote and checkout-session creation.
- Order lookup for authenticated and guest customers.
- Payment/refund commands.
- Provider webhooks.
- Shipping and promotion responses.
- Error codes, status codes, field paths, request IDs, and pagination.

Check:

- Required and optional fields.
- Currency and minor-unit money format.
- Enum/state compatibility.
- Idempotency behavior.
- Backward compatibility within the same API version.
- Generated client compatibility with the API.

Provider contracts should use signed fixtures and sandbox verification. Never
test webhook behavior only with an unsigned hand-written payload.

## End-to-end workflows

Keep E2E tests focused on business outcomes:

1. Shopper browses, opens a direct product URL, and sees trust information.
2. Guest adds a product, refreshes, and retains the intended cart.
3. Guest completes checkout without signing in.
4. Price or stock changes require explicit reconfirmation.
5. Payment succeeds and one confirmation/order is produced.
6. Payment declines and the customer can retry without a duplicate order.
7. Two shoppers compete for one unique product and only one succeeds.
8. Refresh/back navigation does not duplicate checkout.
9. Customer signs in and merges a guest cart safely.
10. Customer retrieves an order through a secure access flow.
11. Customer submits a review only after an eligible purchase.
12. Administrator updates fulfillment and the customer sees the new state.
13. Editor publishes an article and a subsequent static build exposes it.
14. Mobile navigation, cart drawer, dialogs, and checkout work by touch and
    keyboard.

## Accessibility tests

Automate axe or equivalent checks on representative routes, then manually
verify:

- Keyboard-only navigation.
- Visible focus and predictable focus movement.
- Correct landmarks and heading hierarchy.
- Screen-reader names for icon-only controls.
- Form labels, descriptions, errors, and announcements.
- `fieldset`/`legend` for payment and shipping choices.
- Modal role, focus trap, Escape handling, and focus restoration.
- Reduced-motion behavior.
- Color contrast and non-color status communication.
- 200% zoom and narrow viewport reflow.

Accessibility failures that block a purchase or hide a required error are
release blockers.

## Security tests

Before production:

- Dependency, secret, SAST, and container scans.
- DAST against staging.
- IDOR tests for orders, addresses, refunds, and admin resources.
- Price, quantity, coupon, and shipping tampering tests.
- Authentication, session expiry, logout, and CSRF tests.
- Rate-limit tests for sign-in, guest lookup, checkout, contact, and coupons.
- Webhook signature, replay, and out-of-order event tests.
- XSS tests for reviews, notes, contact messages, and editorial output.
- PII/log-redaction checks.
- Security-header and CSP checks.
- Confirmation that card data never enters application logs, Redux, local
  storage, or PostgreSQL.

## Load and resilience tests

Use k6 or an equivalent tool against staging:

- Catalog read and search traffic.
- Cart and quote bursts.
- Concurrent unique-item reservations.
- Webhook retry bursts.
- Queue backlog and worker recovery.
- Database connection exhaustion.
- Redis unavailability.
- Payment/shipping provider latency and timeout.
- API restart during an in-flight request.

Measure p50/p95/p99 latency, error rate, reservation conflicts, duplicate
orders, webhook lag, queue lag, database utilization, and recovery time. Use
provider sandboxes or fakes, never production payment endpoints.

## Frontend prototype coverage

Before the backend exists, record the current prototype limitations explicitly.
Smoke tests may cover:

- Header and mobile navigation.
- Product card, quick view, wishlist, cart drawer, and responsive layouts.
- Listening Room grid, Sanity image rendering, Portable Text, and dynamic
  article routes.

Checkout, authentication, orders, inventory, and payment tests cannot be
considered production evidence until their API and persistence boundaries exist.

## CI quality gates

Pull requests should run:

1. Formatting and lint.
2. Type checking with strict workspace configuration.
3. Unit and property-based tests.
4. Integration tests with ephemeral services.
5. Contract tests.
6. Web and API builds.
7. Targeted E2E and accessibility smoke tests.
8. Security and dependency checks according to change risk.

Release gates additionally require:

- Migration review and backup confirmation.
- Staging smoke tests.
- Payment sandbox verification.
- Deployment and rollback plan.
- Observability dashboard and alert readiness.
- Test evidence linked in the release record.

## Flaky tests and test ownership

- A flaky test is a defect, not a reason to increase retries indefinitely.
- Quarantine requires an owner, issue, reason, and expiration date.
- Tests must not depend on execution order or shared mutable data.
- Domain owners maintain workflow and invariant tests.
- Platform owners maintain CI, container, contract, and deployment checks.
- UX owners maintain accessibility and responsive smoke coverage.

